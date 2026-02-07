import { useMutation } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { runAgent, getAgentInputData } from 'lib/agentApi';

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
      } : undefined;

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
    onSuccess: (data, variables, context) => {
      const { nodeId, agentName, result, currentNodes, node } = data;

      // Update node with result
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

      // Close loading toast and show success
      if (context?.loadingToastId) {
        toast.close(context.loadingToastId);
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
