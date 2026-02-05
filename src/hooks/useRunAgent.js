import { useMutation } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { runAgent, getAgentInputData } from 'lib/agentApi';

export const useRunAgent = ({ 
  onSuccess, 
  onError,
  setNodes,
  setEdges,
  getNodes,
  getEdges
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

      console.log('[useRunAgent] Starting execution for node:', nodeId);
      console.log('[useRunAgent] Total nodes:', currentNodes.length);
      console.log('[useRunAgent] Total edges:', currentEdges.length);

      const inputData = getAgentInputData(node, currentEdges, currentNodes);
      const result = await runAgent(agentType, inputData);

      return {
        nodeId,
        agentName,
        result,
        currentNodes,
        currentEdges,
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
      const { nodeId, agentName, result, currentNodes, currentEdges } = data;

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

      // Create output node if no outgoing edge
      const hasOutgoingEdge = currentEdges.some(edge => edge.source === nodeId);
      if (!hasOutgoingEdge && onSuccess) {
        onSuccess({ nodeId, result, agentName, currentNodes });
      }
    },
    onError: (error, variables, context) => {
      const { nodeId } = variables;
      const agentName = context?.agentName || 'agent';

      // Close loading toast
      if (context?.loadingToastId) {
        toast.close(context.loadingToastId);
      }

      toast({
        title: 'Agent failed',
        description: error.message || `Failed to execute ${agentName}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      console.error(`[${agentName}] Error:`, error);

      if (onError) {
        onError(error, { nodeId, agentName });
      }
    },
  });

  return mutation;
};
