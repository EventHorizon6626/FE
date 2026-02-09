import { useMutation } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { runAgent, getAgentInputData, runCustomAgentApi } from 'lib/agentApi';
import nodeApi from 'lib/nodeApi';
import { horizonAgentApi } from 'lib/horizonAgentApi';

const STANDARD_AGENT_DETAILS = {
  candlestick: { name: 'Candlestick', color: 'blue', description: 'OHLCV price data — open, high, low, close, volume for each trading day' },
  earnings:    { name: 'Earnings', color: 'green', description: 'Financial reports, quarterly earnings, EPS history, revenue data' },
  news:        { name: 'News', color: 'orange', description: 'Recent news articles, headlines, and press releases' },
  technical:   { name: 'Technical', color: 'purple', description: 'Technical indicators — SMA, RSI, MACD, Bollinger Bands' },
  fundamentals:{ name: 'Fundamentals', color: 'teal', description: 'Fundamental metrics — P/E ratio, EPS, dividend yield, market cap' },
};

export const useRunAgent = ({
  onSuccess,
  onError,
  setNodes,
  setEdges,
  getNodes,
  getEdges,
  horizonId,  // Add horizonId parameter
  refetchHorizon,  // Add refetchHorizon parameter
}) => {
  const toast = useToast();

  // Traverse edges backward to find the connected portfolio node
  const findConnectedPortfolio = (nodeId, edges, nodes) => {
    const incomingEdges = edges.filter(e => e.target === nodeId);
    for (const edge of incomingEdges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (!sourceNode) continue;
      if (sourceNode.type === 'portfolioNode') return sourceNode;
      // Recurse one level up (portfolio -> data agent -> custom agent)
      const upstream = findConnectedPortfolio(sourceNode.id, edges, nodes);
      if (upstream) return upstream;
    }
    return null;
  };

  // Position data agents between portfolio and custom agent
  const calculateDataAgentPosition = (customAgentNode, portfolioNode, index, total) => {
    const midX = (portfolioNode.position.x + customAgentNode.position.x) / 2;
    const spreadY = 120; // vertical spacing between data agents
    const totalHeight = (total - 1) * spreadY;
    const startY = customAgentNode.position.y - totalHeight / 2;
    return {
      x: midX,
      y: startY + index * spreadY,
    };
  };

  // Create a data agent node via API and add to canvas
  const createDataAgentNode = async ({ agentSpec, portfolioNode, customAgentNode, index, total }) => {
    const position = calculateDataAgentPosition(customAgentNode, portfolioNode, index, total);

    // Standard EH pipeline agents use their tool name as type (candlestick, earnings, etc.)
    // Custom/exotic agents use 'custom_agent' type
    const isStandard = agentSpec.source === 'eh_pipeline';
    const details = isStandard ? STANDARD_AGENT_DETAILS[agentSpec.name] : null;
    const agentType = isStandard ? agentSpec.name : 'custom_agent';

    const agentData = {
      name: details?.name || agentSpec.name,
      type: agentType,
      system: 'data',
      description: details?.description || agentSpec.description || `Data agent: ${agentSpec.name}`,
      color: details?.color || (isStandard ? 'blue' : 'purple'),
      isAutoCreated: true,
      isBuiltin: isStandard,
    };

    // Standard built-in agents: add descriptive read-only prompt
    if (isStandard && details) {
      agentData.systemPrompt = `Built-in ${details.name} data pipeline agent.\n\nRetrieves ${details.description.toLowerCase()} for the given stocks using the standard EH data pipeline.\n\nThis agent uses a pre-configured endpoint and does not require a custom system prompt.`;
    }

    // Exotic agents: use the LLM-generated system prompt from EH
    if (agentSpec.system_prompt) {
      agentData.systemPrompt = agentSpec.system_prompt;
    }

    // Save to DB via nodeApi — include parentId so buildEdgesFromNodes() generates edges on refetch
    const savedNode = await nodeApi.create({
      horizonId,
      type: 'agentNode',
      position,
      data: { agent: agentData },
      parentId: portfolioNode.id,
    });

    const nodeId = savedNode._id || savedNode.id;

    // Build ReactFlow node for the canvas
    const reactFlowNode = {
      id: nodeId,
      type: 'agentNode',
      position,
      data: {
        agent: agentData,
        horizonId,
        refetchHorizon,
      },
    };

    return { reactFlowNode, nodeId, agentSpec };
  };

  // Execute a data agent — route standard EH pipeline agents to their endpoints,
  // custom/exotic agents to the custom agent endpoint
  const executeDataAgent = async (nodeId, agentSpec, stocks, executionContext) => {
    let result;
    if (agentSpec.source === 'eh_pipeline') {
      // Standard EH data agent — use the specific endpoint (candlestick, earnings, etc.)
      result = await runAgent(agentSpec.name, { stocks, data: null }, null, executionContext);
    } else {
      // Custom/exotic data agent — run via custom agent endpoint with fetch mode
      result = await runCustomAgentApi(
        stocks,
        agentSpec.system_prompt,
        null,
        { ...executionContext, execution_mode: 'fetch_data' },
      );
    }
    return { name: agentSpec.name, nodeId, result };
  };

  // Main orchestrator: create agents, execute them, re-run custom agent
  const handleNeedsData = async ({ customAgentNodeId, requiredAgents, currentNodes, currentEdges, node, agentName }) => {
    const portfolioNode = findConnectedPortfolio(customAgentNodeId, currentEdges, currentNodes);
    if (!portfolioNode) {
      toast({
        title: 'Cannot auto-create data agents',
        description: 'No portfolio node connected. Please connect a portfolio to this agent.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const stocks = portfolioNode.data.portfolio?.stocks || [];
    if (stocks.length === 0) {
      toast({
        title: 'Cannot auto-create data agents',
        description: 'Connected portfolio has no stocks. Please add stocks to the portfolio.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const customAgentNode = currentNodes.find(n => n.id === customAgentNodeId);
    if (!customAgentNode) return;

    toast({
      title: 'Auto-creating data agents',
      description: `Creating ${requiredAgents.length} data agent(s) for missing data...`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    // 1. Create data agent nodes
    const createdAgents = [];
    for (let i = 0; i < requiredAgents.length; i++) {
      try {
        const created = await createDataAgentNode({
          agentSpec: requiredAgents[i],
          portfolioNode,
          customAgentNode,
          index: i,
          total: requiredAgents.length,
        });
        createdAgents.push(created);
      } catch (err) {
        console.error(`[useRunAgent] Failed to create data agent node:`, err);
        toast({
          title: 'Failed to create data agent',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    // 1b. Persist exotic agents to the agent library
    // Uses the SAME system_prompt from EH's generate_data_agent_prompt()
    for (const agent of createdAgents) {
      if (agent.agentSpec.source !== 'eh_pipeline' && agent.agentSpec.system_prompt) {
        try {
          await horizonAgentApi.create(horizonId, {
            name: agent.agentSpec.name,
            description: agent.agentSpec.description || `Data agent: ${agent.agentSpec.name}`,
            type: 'custom_agent',
            system: 'data',
            category: 'data_retriever',
            systemPrompt: agent.agentSpec.system_prompt,
            icon: 'MdSmartToy',
            color: 'purple',
            isBuiltin: false,
            config: {
              dataType: agent.agentSpec.data_type || 'specialized data',
              source: 'web_search',
              autoCreated: true,
            },
          });
        } catch (err) {
          console.warn(`[useRunAgent] Failed to save exotic agent to library:`, err.message);
        }
      }
    }

    // 2. Add nodes + edges to canvas
    const newNodes = createdAgents.map(a => a.reactFlowNode);
    const newEdges = [];

    for (const agent of createdAgents) {
      // Edge: portfolio -> data agent
      newEdges.push({
        id: `edge-${portfolioNode.id}-${agent.nodeId}`,
        source: portfolioNode.id,
        target: agent.nodeId,
        type: 'custom',
        animated: true,
      });
      // Edge: data agent -> custom agent
      newEdges.push({
        id: `edge-${agent.nodeId}-${customAgentNodeId}`,
        source: agent.nodeId,
        target: customAgentNodeId,
        type: 'custom',
        animated: true,
      });
    }

    setNodes(nds => [...nds, ...newNodes]);
    setEdges(eds => [...eds, ...newEdges]);

    // Persist data agent → custom agent relationship for edge reconstruction on reload
    const dataAgentNodeIds = createdAgents.map(a => a.nodeId);
    try {
      await nodeApi.update(customAgentNodeId, { inputNodeIds: dataAgentNodeIds });
    } catch (err) {
      console.warn('[useRunAgent] Failed to persist inputNodeIds:', err.message);
    }

    // 3. Execute each data agent
    toast({
      title: 'Executing data agents',
      description: `Running ${createdAgents.length} data agent(s)...`,
      status: 'info',
      duration: null,
      isClosable: false,
    });

    const collectedData = {};
    for (const agent of createdAgents) {
      try {
        const executionContext = horizonId ? {
          horizonId,
          agentNodeId: agent.nodeId,
          agentPosition: agent.reactFlowNode.position,
        } : {};

        const { name, result } = await executeDataAgent(
          agent.nodeId,
          agent.agentSpec,
          stocks,
          executionContext,
        );

        collectedData[name] = result;

        // Update the data agent node with its output
        setNodes(nds =>
          nds.map(n =>
            n.id === agent.nodeId
              ? { ...n, data: { ...n.data, output: result, lastRun: new Date().toISOString() } }
              : n
          )
        );

        // Handle backend-saved outputNode for data agent
        const savedOutputNode = result?._outputNode;
        if (savedOutputNode) {
          const outputNode = {
            id: savedOutputNode.id,
            type: 'outputNode',
            position: {
              x: agent.reactFlowNode.position.x + 350,
              y: agent.reactFlowNode.position.y,
            },
            data: {
              result,
              agentName: name,
              timestamp: savedOutputNode.createdAt,
              sourceAgentNodeId: agent.nodeId,
            },
          };
          setNodes(nds => [...nds, outputNode]);
          setEdges(eds => [...eds, {
            id: `edge-${agent.nodeId}-${savedOutputNode.id}`,
            source: agent.nodeId,
            target: savedOutputNode.id,
            type: 'custom',
            data: { output: result },
            animated: true,
          }]);
        }
      } catch (err) {
        console.error(`[useRunAgent] Data agent "${agent.agentSpec.name}" failed:`, err);
        toast({
          title: `Data agent failed: ${agent.agentSpec.name}`,
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    // 4. Re-execute the custom agent with collected data
    toast({
      title: 'Re-running custom agent',
      description: `${agentName} is re-executing with collected data...`,
      status: 'info',
      duration: null,
      isClosable: false,
    });

    try {
      const customAgent = customAgentNode.data.agent;
      const executionContext = horizonId ? {
        horizonId,
        agentNodeId: customAgentNodeId,
        agentPosition: customAgentNode.position,
        agentName: agentName,
        input_data: collectedData,
      } : { input_data: collectedData };

      const finalResult = await runCustomAgentApi(
        stocks,
        customAgent.systemPrompt,
        customAgent.userPrompt || null,
        executionContext,
      );

      // Update the custom agent node with final result
      setNodes(nds =>
        nds.map(n =>
          n.id === customAgentNodeId
            ? { ...n, data: { ...n.data, output: finalResult, lastRun: new Date().toISOString() } }
            : n
        )
      );

      // Handle backend-saved outputNode for the re-executed custom agent
      const savedOutputNode = finalResult?._outputNode;
      if (savedOutputNode) {
        // Remove old outputNode from canvas (if exists)
        const latestNodes = getNodes();
        const oldOutputNode = latestNodes.find(n =>
          n.type === 'outputNode' && n.data?.sourceAgentNodeId === customAgentNodeId
        );
        if (oldOutputNode) {
          setNodes(nds => nds.filter(n => n.id !== oldOutputNode.id));
          setEdges(eds => eds.filter(e =>
            e.source !== oldOutputNode.id && e.target !== oldOutputNode.id
          ));
        }

        const agentNodePosition = customAgentNode.position || { x: 0, y: 0 };
        const newOutputNode = {
          id: savedOutputNode.id,
          type: 'outputNode',
          position: {
            x: agentNodePosition.x + 350,
            y: agentNodePosition.y,
          },
          data: {
            result: finalResult,
            agentName,
            timestamp: savedOutputNode.createdAt,
            sourceAgentNodeId: customAgentNodeId,
          },
        };

        setNodes(nds => [...nds, newOutputNode]);
        setEdges(eds => [...eds, {
          id: `edge-${customAgentNodeId}-${savedOutputNode.id}`,
          source: customAgentNodeId,
          target: savedOutputNode.id,
          type: 'custom',
          data: { output: finalResult },
          animated: true,
        }]);

        setNodes(nds =>
          nds.map(n =>
            n.id === customAgentNodeId
              ? { ...n, data: { ...n.data, currentOutputNodeId: savedOutputNode.id, lastExecutedAt: savedOutputNode.createdAt } }
              : n
          )
        );
      }

      toast.closeAll();
      toast({
        title: 'Agent completed',
        description: `${agentName} finished with auto-collected data`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      if (onSuccess) {
        onSuccess({ nodeId: customAgentNodeId, result: finalResult, agentName, currentNodes: getNodes() });
      }

      // Note: refetchHorizon intentionally NOT called here — it would replace canvas
      // state and destroy auto-created edges. Nodes are already persisted to DB with
      // parentId, so edges will regenerate on next full page load.
    } catch (err) {
      console.error(`[useRunAgent] Re-execution of custom agent failed:`, err);
      toast.closeAll();
      toast({
        title: 'Re-execution failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ nodeId }) => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      const node = currentNodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error('Node not found');
      }

      const agentName = node?.data?.agent?.name || 'agent';
      const agentType = node?.data?.agent?.type;
      const agent = node?.data?.agent;

      // Check if custom agent has empty system prompt
      if (agentType === 'custom_agent' && (!agent?.systemPrompt || !agent.systemPrompt.trim())) {
        throw new Error(
          `Cannot execute agent "${agentName}": This agent is missing a system prompt. ` +
          `Please edit the agent and ensure it has a valid system prompt before running it.`
        );
      }

      // Build customAgentConfig for agents that have their own systemPrompt
      const customAgentConfig = agent?.systemPrompt
        ? {
            systemPrompt: agent.systemPrompt,
            enableThinking: agent.enableThinking ?? false,
            maxIterations: agent.maxIterations ?? 5,
          }
        : null;

      console.log('[useRunAgent] Starting execution for node:', nodeId);
      console.log('[useRunAgent] Total nodes:', currentNodes.length);
      console.log('[useRunAgent] Total edges:', currentEdges.length);

      const inputData = getAgentInputData(node, currentEdges, currentNodes);

      // Build execution context for backend auto-save
      const executionContext = horizonId ? {
        horizonId,
        agentNodeId: nodeId,
        agentPosition: node?.position || { x: 0, y: 0 },
      } : {};

      // Custom DATA agents should only fetch data, not enter discovery/thinking loop
      if (agentType === 'custom_agent' && agent?.system === 'data') {
        executionContext.execution_mode = 'fetch_data';
      }

      const result = await runAgent(agentType, inputData, customAgentConfig, executionContext);

      return {
        nodeId,
        agentName,
        result,
        currentNodes,
        currentEdges,
        node,
      };
    },
    onMutate: async ({ nodeId }) => {
      const currentNodes = getNodes();
      const node = currentNodes.find((n) => n.id === nodeId);
      const agentName = node?.data?.agent?.name || 'agent';

      // Show loading toast
      const loadingToastId = toast({
        title: 'Running agent',
        description: `Executing ${agentName}...`,
        status: 'info',
        duration: null,
        isClosable: false,
      });

      return { loadingToastId, agentName };
    },
    onSuccess: async (data, variables, context) => {
      const { nodeId, agentName, result, currentNodes, currentEdges, node } = data;

      // Close loading toast first
      if (context?.loadingToastId) {
        toast.close(context.loadingToastId);
      }

      // Check if agent needs data — auto-create flow
      if (result.status === 'needs_data' && result.required_agents?.length > 0) {
        console.log('[useRunAgent] Agent needs data, starting auto-create flow:', result.required_agents);

        toast({
          title: 'Agent needs additional data',
          description: `Auto-creating ${result.required_agents.length} data agent(s)...`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });

        // Update node to show it's in the auto-create flow
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, output: result, lastRun: new Date().toISOString() } }
              : n
          )
        );

        await handleNeedsData({
          customAgentNodeId: nodeId,
          requiredAgents: result.required_agents,
          currentNodes,
          currentEdges,
          node,
          agentName,
        });
        return;
      }

      // Normal flow: update node with result
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  output: result,
                  lastRun: new Date().toISOString(),
                },
              }
            : n
        )
      );

      // Update edges with animation
      setEdges((eds) =>
        eds.map((edge) =>
          edge.source === nodeId
            ? {
                ...edge,
                data: { ...edge.data, output: result },
                animated: true,
              }
            : edge
        )
      );

      toast({
        title: 'Agent completed',
        description: `${agentName} finished successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      console.log(`[${agentName}] Output:`, result);

      // Handle backend-saved outputNode
      const savedOutputNode = result?._outputNode;

      if (savedOutputNode) {
        console.log('[useRunAgent] Backend saved outputNode:', savedOutputNode);

        // Remove old outputNode from canvas (if exists)
        const oldOutputNode = currentNodes.find(n =>
          n.type === 'outputNode' && n.data?.sourceAgentNodeId === nodeId
        );

        if (oldOutputNode) {
          console.log('[useRunAgent] Removing old output:', oldOutputNode.id);
          setNodes((nds) => nds.filter((n) => n.id !== oldOutputNode.id));
          setEdges((eds) => eds.filter((e) =>
            e.source !== oldOutputNode.id && e.target !== oldOutputNode.id
          ));
        }

        // Add NEW outputNode to canvas (use id from backend)
        const agentNodePosition = node?.position || { x: 0, y: 0 };
        const newOutputNode = {
          id: savedOutputNode.id, // Use backend _id
          type: 'outputNode',
          position: {
            x: agentNodePosition.x + 350,
            y: agentNodePosition.y,
          },
          data: {
            result: result,
            agentName: agentName,
            timestamp: savedOutputNode.createdAt,
            sourceAgentNodeId: nodeId,
          },
        };

        setNodes((nds) => [...nds, newOutputNode]);

        // Create edge from agent to new output
        const newOutputEdge = {
          id: `edge-${nodeId}-${savedOutputNode.id}`,
          source: nodeId,
          target: savedOutputNode.id,
          type: 'custom',
          data: { output: result },
          animated: true,
        };

        setEdges((eds) => [...eds, newOutputEdge]);

        // Update agentNode with current outputNodeId reference
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    currentOutputNodeId: savedOutputNode.id,
                    lastExecutedAt: savedOutputNode.createdAt,
                  },
                }
              : n
          )
        );
      }

      // Call custom onSuccess callback if provided
      if (onSuccess) {
        onSuccess({ nodeId, result, agentName, currentNodes });
      }

      // Refetch horizon data after successful agent execution
      // Note: This ensures data sync even if CustomAgentNode doesn't call refetch
      if (refetchHorizon) {
        console.log('[useRunAgent] Refetching horizon data after agent execution');
        refetchHorizon();
      }
    },
    onError: (error, variables, context) => {
      const { nodeId } = variables;
      const agentName = context?.agentName || 'agent';

      // Close loading toast
      if (context?.loadingToastId) {
        toast.close(context.loadingToastId);
      }

      // Enhanced error message with endpoint info
      let errorDescription = error.message || `Failed to execute ${agentName}`;

      if (error.isTimeout) {
        const durationText = error.duration ? `${error.duration}ms` : 'timeout limit';
        const urlText = error.url ? ` on ${error.url}` : '';
        errorDescription = `Timeout after ${durationText}${urlText}`;
      }

      toast({
        title: 'Agent failed',
        description: errorDescription,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      console.error(`[${agentName}] Error:`, {
        message: error.message,
        url: error.url,
        method: error.method,
        duration: error.duration ? `${error.duration}ms` : 'unknown',
        isTimeout: error.isTimeout,
        fullError: error,
      });

      if (onError) {
        onError(error, { nodeId, agentName });
      }
    },
  });

  return mutation;
};
