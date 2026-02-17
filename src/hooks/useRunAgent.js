import { useMutation } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { runAgent, getAgentInputData } from 'lib/agentApi';
import nodeApi from 'lib/nodeApi';

export const useRunAgent = ({
  onSuccess,
  onError,
  setNodes,
  setEdges,
  getNodes,
  getEdges,
  horizonId,  // Add horizonId parameter
  refetchHorizon,  // Add refetchHorizon parameter
  onAutoLayout,  // Add auto-layout callback for when data agents are spawned
  setIsAutoLayouting,  // Add state setter for loading overlay
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

      // Backend already created the outputNode — no need to create it here
      // We'll rely on refetchHorizon() to sync the canvas with DB

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

      // Check if agent needs data — BE already created nodes
      if (result.status === 'needs_data') {
        console.log('[useRunAgent] Agent needs data, BE should have created nodes:', result);

        // BE created data agents automatically
        if (result._createdDataAgents && result._createdDataAgents.length > 0) {
          toast({
            title: 'Data agents created',
            description: result.message || `Created ${result._createdDataAgents.length} data agent(s) — run them and re-run this agent`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Show loading overlay to hide messy initial layout
          if (setIsAutoLayouting) {
            setIsAutoLayouting(true);
          }

          // Refetch horizon to load the new nodes and edges from DB
          if (refetchHorizon) {
            console.log('[useRunAgent] Refetching horizon to load new data agents');
            await refetchHorizon();

            // Auto-layout after data agents are loaded
            if (onAutoLayout) {
              console.log('[useRunAgent] Triggering auto-layout after data agents spawned');
              // Use setTimeout to ensure nodes are rendered before layout
              setTimeout(() => {
                onAutoLayout();

                // Hide loading overlay after layout completes
                if (setIsAutoLayouting) {
                  setTimeout(() => {
                    setIsAutoLayouting(false);
                  }, 300); // Small delay for smooth transition
                }
              }, 100);
            } else {
              // No auto-layout, just hide overlay
              if (setIsAutoLayouting) {
                setTimeout(() => {
                  setIsAutoLayouting(false);
                }, 300);
              }
            }
          }

          return;
        }

        // Legacy handling: needs_data but no _createdDataAgents (shouldn't happen with new BE)
        console.warn('[useRunAgent] needs_data without _createdDataAgents - BE might not have created nodes');
        
        toast({
          title: 'Agent needs data',
          description: result.message || 'Please connect required data agents and re-run this agent',
          status: 'warning',
          duration: 5000,
          isClosable: true,
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

      // Backend already created outputNode (_outputNode), refetchHorizon will sync it
      // No need to manually create outputNode in FE anymore

      // Call custom onSuccess callback if provided
      if (onSuccess) {
        onSuccess({ nodeId, result, agentName, currentNodes });
      }

      // Refetch horizon data after successful agent execution
      // This will load the outputNode created by BE automatically
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
