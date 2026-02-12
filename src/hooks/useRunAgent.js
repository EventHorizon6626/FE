import { useMutation } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { runAgent, getAgentInputData,
  //  runCustomAgentApi
   } from 'lib/agentApi';
import nodeApi from 'lib/nodeApi';
import { horizonAgentApi } from 'lib/horizonAgentApi';

const STANDARD_AGENT_DETAILS = {
  candlestick: { name: 'Candlestick', color: 'blue', description: 'OHLCV price data — open, high, low, close, volume for each trading day' },
  earnings:    { name: 'Earnings', color: 'green', description: 'Financial reports, quarterly earnings, EPS history, revenue data' },
  news:        { name: 'News', color: 'orange', description: 'Recent news articles, headlines, and press releases' },
  technical:   { name: 'Technical', color: 'purple', description: 'Technical indicators — SMA, RSI, MACD, Bollinger Bands' },
  fundamentals:{ name: 'Fundamentals', color: 'teal', description: 'Fundamental metrics — P/E ratio, EPS, dividend yield, market cap' },
  web_search:  { name: 'Web Search', color: 'cyan', description: 'Web search for sentiment, analyst ratings, industry context' },
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

  // Check if a data agent is wired to an analyzer (skip output node if so)
  const isDataAgentWiredToAnalyzer = (nodeId, edges, nodes) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node?.data?.agent?.system !== 'data') return false;
    // Auto-created data agents (spawned by needs_data) are always wired to their parent,
    // whether the parent is an analyzer OR a custom data-coordinator agent
    if (node?.data?.agent?.isAutoCreated) return true;
    return edges.some(e =>
      e.source === nodeId &&
      nodes.find(n => n.id === e.target)?.data?.agent?.system === 'analyzer'
    );
  };

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

    // Standard built-in agents: DON'T set systemPrompt.
    // Their execution routes to dedicated endpoints, not the custom/thinking path.
    // A systemPrompt here would cause runAgent() to misroute them to /agents/custom.
    if (isStandard && details) {
      agentData.description = `Built-in ${details.name} pipeline — ${details.description.toLowerCase()}`;
    }

    // Exotic agents: use the LLM-generated system prompt from EH
    if (agentSpec.system_prompt) {
      agentData.systemPrompt = agentSpec.system_prompt;
    }

    // Save to DB via nodeApi — include parentId so buildEdgesFromNodes() generates edges on refetch
    const response = await nodeApi.create({
      horizonId,
      type: 'agentNode',
      position,
      data: { agent: agentData },
      parentId: portfolioNode.id,
    });

    const savedNode = response.data || response;
    const nodeId = savedNode.id || savedNode._id;

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
  // const executeDataAgent = async (nodeId, agentSpec, stocks, executionContext) => {
  //   let result;
  //   if (agentSpec.source === 'eh_pipeline') {
  //     // Standard EH data agent — use the specific endpoint (candlestick, earnings, etc.)
  //     result = await runAgent(agentSpec.name, { stocks, data: null }, null, executionContext);
  //   } else {
  //     // Custom/exotic data agent — run via custom agent endpoint with fetch mode
  //     result = await runCustomAgentApi(
  //       stocks,
  //       agentSpec.system_prompt,
  //       null,
  //       { ...executionContext, execution_mode: 'fetch_data' },
  //     );
  //   }
  //   return { name: agentSpec.name, nodeId, result };
  // };

  // Main orchestrator: create agents, execute them, re-run custom agent
  const handleNeedsData = async ({ customAgentNodeId, requiredAgents, currentNodes, currentEdges, node, agentName, agentType }) => {
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
        data: { output: null },
      });
      // Edge: data agent -> custom agent
      newEdges.push({
        id: `edge-${agent.nodeId}-${customAgentNodeId}`,
        source: agent.nodeId,
        target: customAgentNodeId,
        type: 'custom',
        animated: true,
        data: { output: null },
      });
    }

    setNodes(nds => [...nds, ...newNodes]);
    // Remove old portfolio→analyzer direct edge, add new edges through data agents
    setEdges(eds => [
      ...eds.filter(e => !(e.source === portfolioNode.id && e.target === customAgentNodeId)),
      ...newEdges,
    ]);

    // Persist data agent → custom agent relationship for edge reconstruction on reload
    const dataAgentNodeIds = createdAgents.map(a => a.nodeId);
    try {
      await nodeApi.update(customAgentNodeId, {
        inputNodeIds: dataAgentNodeIds,
        parentId: null,  // Remove direct portfolio→analyzer link so buildEdgesFromNodes() won't recreate it
      });
    } catch (err) {
      console.warn('[useRunAgent] Failed to persist inputNodeIds:', err.message);
    }

    // Done — user will manually run each data agent, then re-run the analyzer
    toast.closeAll();
    toast({
      title: 'Data agents created',
      description: `${createdAgents.length} data agent(s) wired to ${agentName} — run them manually`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  // Backward-cascade: recursively run unexecuted upstream agents depth-first
  const ensureUpstreamData = async (nodeId, edges, nodes, visited) => {
    if (visited.has(nodeId)) return; // cycle protection
    visited.add(nodeId);

    const incomingEdges = edges.filter(e => e.target === nodeId);

    for (const edge of incomingEdges) {
      const srcIdx = nodes.findIndex(n => n.id === edge.source);
      if (srcIdx === -1) continue;
      const srcNode = nodes[srcIdx];

      // Only cascade through agent nodes that haven't produced output yet
      if (srcNode.type !== 'agentNode') continue;
      if (srcNode.data.output) continue; // already has output — skip

      // Depth-first: ensure THIS node's upstream is satisfied first
      await ensureUpstreamData(srcNode.id, edges, nodes, visited);

      const srcAgent = srcNode.data.agent;
      const srcName = srcAgent?.name || 'agent';
      const srcType = srcAgent?.type;

      // Validate system prompt for custom agents
      if (srcType === 'custom_agent' && (!srcAgent?.systemPrompt || !srcAgent.systemPrompt.trim())) {
        throw new Error(
          `Cascade blocked: upstream agent "${srcName}" is missing a system prompt. ` +
          `Please edit it and add a system prompt before running.`
        );
      }

      // Gather input data for this upstream node (its own upstream is now populated)
      const srcInputData = getAgentInputData(srcNode, edges, nodes);

      // Build customAgentConfig
      const srcCustomConfig = srcAgent?.systemPrompt
        ? {
            systemPrompt: srcAgent.systemPrompt,
            enableThinking: srcAgent.enableThinking ?? false,
            maxIterations: srcAgent.maxIterations ?? 5,
          }
        : null;

      // Build execution context
      const srcContext = horizonId ? {
        horizonId,
        agentNodeId: srcNode.id,
        agentPosition: srcNode.position || { x: 0, y: 0 },
      } : {};

      // Pass upstream agent output as input_data
      if (srcInputData.data && Object.keys(srcInputData.data).length > 0) {
        srcContext.input_data = srcInputData.data;
      }

      if (srcType === 'custom_agent' && srcAgent?.system === 'data') {
        srcContext.execution_mode = 'fetch_data';
        // Exotic (analyzer-spawned) data agents only need web_search —
        // standard tools are already fetched by dedicated pipeline agents
        if (srcAgent.isAutoCreated && !srcAgent.isBuiltin) {
          srcContext.available_tools = ['web_search'];
        }
      }

      // Skip BE outputNode save if this data agent is wired to an analyzer
      if (isDataAgentWiredToAnalyzer(srcNode.id, edges, nodes)) {
        srcContext.skipOutputNode = true;
      }

      console.log(`[useRunAgent] Cascade: running upstream "${srcName}" (${srcNode.id})`);

      const srcResult = await runAgent(srcType, srcInputData, srcCustomConfig, srcContext);

      // If upstream itself needs_data, we can't auto-resolve that here
      if (srcResult.status === 'needs_data') {
        throw new Error(
          `Cascade blocked: upstream agent "${srcName}" returned needs_data. ` +
          `Run it manually first to trigger auto-create of its data agents.`
        );
      }

      // Mutate the local nodes array so subsequent getAgentInputData calls see the output
      nodes[srcIdx] = {
        ...srcNode,
        data: { ...srcNode.data, output: srcResult, lastRun: new Date().toISOString() },
      };

      // Push to React state so the canvas updates
      setNodes(nds =>
        nds.map(n =>
          n.id === srcNode.id
            ? { ...n, data: { ...n.data, output: srcResult, lastRun: new Date().toISOString() } }
            : n
        )
      );

      // Handle _outputNode from backend (same logic as onSuccess)
      // Skip output node creation if this data agent is wired to an analyzer
      const savedOutputNode = srcResult?._outputNode;
      const isWiredCascade = isDataAgentWiredToAnalyzer(srcNode.id, edges, nodes);

      console.log('[useRunAgent] 🎯 CASCADE OUTPUT NODE DECISION:', {
        step1_hasSavedOutputNode: !!savedOutputNode,
        step2_agentInfo: {
          nodeId: srcNode.id,
          name: srcName,
          system: srcAgent?.system,
          isAutoCreated: srcAgent?.isAutoCreated,
        },
        step3_isWiredToAnalyzer: isWiredCascade,
        step4_willCreateOutput: !!savedOutputNode && !isWiredCascade,
      });

      if (savedOutputNode && !isWiredCascade) {
        console.log('[useRunAgent] ✅ CREATING CASCADE OUTPUT NODE');
        const agentPos = srcNode.position || { x: 0, y: 0 };
        const newOutputNode = {
          id: savedOutputNode.id,
          type: 'outputNode',
          position: { x: agentPos.x + 350, y: agentPos.y },
          data: {
            result: srcResult,
            agentName: srcName,
            timestamp: savedOutputNode.createdAt,
            sourceAgentNodeId: srcNode.id,
          },
        };

        setNodes(nds => {
          // Remove old output node for this agent if it exists
          const filtered = nds.filter(n =>
            !(n.type === 'outputNode' && n.data?.sourceAgentNodeId === srcNode.id)
          );
          return [...filtered, newOutputNode];
        });

        setEdges(eds => [
          ...eds,
          {
            id: `edge-${srcNode.id}-${savedOutputNode.id}`,
            source: srcNode.id,
            target: savedOutputNode.id,
            type: 'custom',
            data: { output: srcResult },
            animated: true,
          },
        ]);

        console.log('[useRunAgent] ✅ CASCADE OUTPUT NODE CREATED:', newOutputNode.id);
      } else {
        console.log('[useRunAgent] ❌ SKIPPING CASCADE OUTPUT NODE:',
          !savedOutputNode
            ? '❌ Backend did not return _outputNode in result'
            : '❌ Agent is wired to analyzer (data flows to analyzer instead)'
        );
      }

      // Update edges with animation for this agent's outgoing edges
      setEdges(eds =>
        eds.map(e =>
          e.source === srcNode.id
            ? { ...e, data: { ...e.data, output: srcResult }, animated: true }
            : e
        )
      );

      // Persist output on the agent node for wired data agents (edge icon needs it on reload)
      if (isDataAgentWiredToAnalyzer(srcNode.id, edges, nodes)) {
        try {
          await nodeApi.update(srcNode.id, {
            data: { ...srcNode.data, output: srcResult, lastRun: new Date().toISOString() },
          });
        } catch (err) {
          console.warn('[useRunAgent] Failed to persist cascaded agent output:', err.message);
        }
      }
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ nodeId }) => {
      // Shallow-clone nodes so cascade mutations don't directly affect React state
      const currentEdges = getEdges();
      const currentNodes = getNodes().map(n => ({ ...n, data: { ...n.data } }));

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

      // Run backward cascade — execute any unexecuted upstream agents first
      await ensureUpstreamData(nodeId, currentEdges, currentNodes, new Set());

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

      // Use the (now-populated) nodes snapshot for input data
      const inputData = getAgentInputData(node, currentEdges, currentNodes);

      // Build execution context for backend auto-save
      const executionContext = horizonId ? {
        horizonId,
        agentNodeId: nodeId,
        agentPosition: node?.position || { x: 0, y: 0 },
      } : {};

      // Pass upstream agent output as input_data so the EH endpoint
      // takes Path A (direct analysis) instead of re-entering discovery
      if (inputData.data && Object.keys(inputData.data).length > 0) {
        executionContext.input_data = inputData.data;
      }

      // Custom DATA agents should only fetch data, not enter discovery/thinking loop
      if (agentType === 'custom_agent' && agent?.system === 'data') {
        executionContext.execution_mode = 'fetch_data';
        // Exotic (analyzer-spawned) data agents only need web_search —
        // standard tools are already fetched by dedicated pipeline agents
        if (agent.isAutoCreated && !agent.isBuiltin) {
          executionContext.available_tools = ['web_search'];
        }
      }

      // Skip BE outputNode save if this data agent is wired to an analyzer
      if (isDataAgentWiredToAnalyzer(nodeId, currentEdges, currentNodes)) {
        executionContext.skipOutputNode = true;
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
      const currentEdges = getEdges();
      const node = currentNodes.find((n) => n.id === nodeId);
      const agentName = node?.data?.agent?.name || 'agent';

      // Detect upstream agents that need to run (no output yet)
      const upstreamWithoutOutput = [];
      const countVisited = new Set();
      const countUpstream = (nid) => {
        if (countVisited.has(nid)) return;
        countVisited.add(nid);
        const incoming = currentEdges.filter(e => e.target === nid);
        for (const edge of incoming) {
          const src = currentNodes.find(n => n.id === edge.source);
          if (!src || src.type !== 'agentNode') continue;
          if (!src.data.output) upstreamWithoutOutput.push(src.data.agent?.name || src.id);
          countUpstream(src.id);
        }
      };
      countUpstream(nodeId);

      const isCascade = upstreamWithoutOutput.length > 0;
      const title = isCascade ? 'Running agent cascade' : 'Running agent';
      const description = isCascade
        ? `Executing ${upstreamWithoutOutput.length} upstream agent(s), then ${agentName}...`
        : `Executing ${agentName}...`;

      // Show loading toast
      const loadingToastId = toast({
        title,
        description,
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

      // Step 2: Log backend response
      console.log('[useRunAgent] 📦 Backend result received:', {
        success: true,
        hasOutputNode: !!result?._outputNode,
        outputNodeId: result?._outputNode?.id,
        resultFields: Object.keys(result || {}),
        resultSample: {
          status: result?.status,
          output: result?.output ? `(${typeof result.output === 'string' ? result.output.substring(0, 50) : 'object'})` : undefined,
          _outputNode: result?._outputNode ? { id: result._outputNode.id, createdAt: result._outputNode.createdAt } : undefined,
        },
      });

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
          agentType: node?.data?.agent?.type,
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

      // Persist output on the agent node for wired data agents (edge icon needs it on reload)
      if (isDataAgentWiredToAnalyzer(nodeId, currentEdges, currentNodes)) {
        try {
          await nodeApi.update(nodeId, {
            data: { ...node.data, output: result, lastRun: new Date().toISOString() },
          });
        } catch (err) {
          console.warn('[useRunAgent] Failed to persist wired agent output:', err.message);
        }
      }

      toast({
        title: 'Agent completed',
        description: `${agentName} finished successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      console.log(`[${agentName}] Output:`, result);

      // Handle backend-saved outputNode
      // Skip output node creation if this data agent is wired to an analyzer
      const savedOutputNode = result?._outputNode;
      const executingNode = currentNodes.find(n => n.id === nodeId);
      const isWired = isDataAgentWiredToAnalyzer(nodeId, currentEdges, currentNodes);

      console.log('[useRunAgent] 🎯 OUTPUT NODE DECISION:', {
        step1_hasSavedOutputNode: !!savedOutputNode,
        step2_agentInfo: {
          nodeId,
          name: executingNode?.data?.agent?.name,
          system: executingNode?.data?.agent?.system,
          isAutoCreated: executingNode?.data?.agent?.isAutoCreated,
        },
        step3_isWiredToAnalyzer: isWired,
        step4_willCreateOutput: !!savedOutputNode && !isWired,
        savedOutputNode: savedOutputNode,
      });

      if (savedOutputNode && !isWired) {
        console.log('[useRunAgent] ✅ CREATING OUTPUT NODE');

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

        console.log('[useRunAgent] ✅ OUTPUT NODE CREATED:', newOutputNode.id);
      } else {
        console.log('[useRunAgent] ❌ SKIPPING OUTPUT NODE:',
          !savedOutputNode
            ? '❌ Backend did not return _outputNode in result'
            : '❌ Agent is wired to analyzer (data flows to analyzer instead)'
        );
      }

      // Call custom onSuccess callback if provided
      if (onSuccess) {
        onSuccess({ nodeId, result, agentName, currentNodes });
      }

      // Refetch horizon data after successful agent execution
      // Note: This ensures data sync even if CustomAgentNode doesn't call refetch
      // Skip for wired data agents — in-memory state + DB are already correct,
      // and refetch causes a race that wipes edge.data.output (teal icon).
      const shouldRefetch = refetchHorizon && !isDataAgentWiredToAnalyzer(nodeId, currentEdges, currentNodes);
      console.log('[useRunAgent] 🔄 REFETCH DECISION:', {
        hasRefetchFunction: !!refetchHorizon,
        isWiredToAnalyzer: isDataAgentWiredToAnalyzer(nodeId, currentEdges, currentNodes),
        willRefetch: shouldRefetch,
        note: shouldRefetch ? 'Refetching - output node should persist' : 'Skipping refetch',
      });

      if (shouldRefetch) {
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
