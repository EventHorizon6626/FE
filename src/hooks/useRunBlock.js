import { useMutation } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { runAgent } from 'lib/agentApi';
import nodeApi from 'lib/nodeApi';

/**
 * Hook to execute all child agents inside a block container sequentially,
 * concatenate their outputs, and create a single output node for the block.
 */
export const useRunBlock = ({
  setNodes,
  setEdges,
  getNodes,
  getEdges,
  horizonId,
  refetchHorizon,
}) => {
  const toast = useToast();

  // Traverse edges backward to find the connected portfolio node
  const findConnectedPortfolio = (nodeId, edges, nodes) => {
    const incomingEdges = edges.filter(e => e.target === nodeId);
    for (const edge of incomingEdges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (!sourceNode) continue;
      if (sourceNode.type === 'portfolioNode') return sourceNode;
      const upstream = findConnectedPortfolio(sourceNode.id, edges, nodes);
      if (upstream) return upstream;
    }
    return null;
  };

  const mutation = useMutation({
    mutationFn: async ({ blockId }) => {
      const currentEdges = getEdges();
      const currentNodes = getNodes().map(n => ({ ...n, data: { ...n.data } }));

      const blockNode = currentNodes.find(n => n.id === blockId);
      if (!blockNode) throw new Error('Block node not found');

      const childNodes = blockNode.data.childNodes || [];
      if (childNodes.length === 0) throw new Error('Block has no child nodes to execute');

      // Find connected portfolio for stock data
      const portfolioNode = findConnectedPortfolio(blockId, currentEdges, currentNodes);
      if (!portfolioNode) {
        throw new Error('No portfolio connected to this block. Please connect a portfolio node.');
      }

      const stocks = portfolioNode.data.portfolio?.stocks || [];
      if (stocks.length === 0) {
        throw new Error('Connected portfolio has no stocks. Please add stocks to the portfolio.');
      }

      // Execute each child agent sequentially
      const blockResults = [];
      let accumulatedData = {};

      for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        const agent = child.data?.agent;
        if (!agent) continue;

        const agentName = agent.name || 'agent';
        const agentType = agent.type;

        // Build input data — all children get the same stocks, accumulated context from previous children
        const inputData = { stocks, data: { ...accumulatedData } };

        // Build customAgentConfig from child's systemPrompt
        const customAgentConfig = agent.systemPrompt
          ? {
              systemPrompt: agent.systemPrompt,
              enableThinking: agent.enableThinking ?? false,
              maxIterations: agent.maxIterations ?? 5,
            }
          : null;

        // Build execution context — skip individual output node creation
        const executionContext = horizonId ? {
          horizonId,
          agentNodeId: child.id,
          agentPosition: child.position || { x: 0, y: 0 },
          skipOutputNode: true,
        } : { skipOutputNode: true };

        // Custom DATA agents should only fetch data
        if (agentType === 'custom_agent' && agent.system === 'data') {
          executionContext.execution_mode = 'fetch_data';
        }

        console.log(`[useRunBlock] Running child ${i + 1}/${childNodes.length}: "${agentName}" (${child.id})`);

        const result = await runAgent(agentType, inputData, customAgentConfig, executionContext);

        // Accumulate output for subsequent children
        accumulatedData[agentName] = result;

        blockResults.push({
          agentName,
          agentType,
          agentId: child.id,
          output: result,
        });
      }

      const concatenatedOutput = {
        blockResults,
        executedAt: new Date().toISOString(),
        childCount: childNodes.length,
      };

      return { blockId, result: concatenatedOutput, blockNode };
    },

    onMutate: async ({ blockId }) => {
      const currentNodes = getNodes();
      const blockNode = currentNodes.find(n => n.id === blockId);
      const childCount = blockNode?.data?.childNodes?.length || 0;

      const loadingToastId = toast({
        title: 'Running block',
        description: `Executing ${childCount} agent(s) sequentially...`,
        status: 'info',
        duration: null,
        isClosable: false,
      });

      return { loadingToastId, childCount };
    },

    onSuccess: async (data, variables, context) => {
      const { blockId, result, blockNode } = data;

      // Close loading toast
      if (context?.loadingToastId) {
        toast.close(context.loadingToastId);
      }

      // Update block node data with output
      setNodes(nds =>
        nds.map(n =>
          n.id === blockId
            ? { ...n, data: { ...n.data, output: result, lastRun: new Date().toISOString() } }
            : n
        )
      );

      // Create output node via API
      if (horizonId) {
        try {
          const blockPos = blockNode.position || { x: 0, y: 0 };
          const response = await nodeApi.create({
            horizonId,
            type: 'outputNode',
            position: { x: blockPos.x + 450, y: blockPos.y },
            data: {
              result,
              agentName: 'Block Container',
              timestamp: new Date().toISOString(),
              sourceAgentNodeId: blockId,
            },
            parentId: blockId,
          });

          const savedOutputNode = response.data || response;
          const outputNodeId = savedOutputNode.id || savedOutputNode._id;

          // Remove old output node for this block from canvas
          setNodes(nds => {
            const filtered = nds.filter(n =>
              !(n.type === 'outputNode' && n.data?.sourceAgentNodeId === blockId)
            );
            return [
              ...filtered,
              {
                id: outputNodeId,
                type: 'outputNode',
                position: { x: blockPos.x + 450, y: blockPos.y },
                data: {
                  result,
                  agentName: 'Block Container',
                  timestamp: savedOutputNode.createdAt || new Date().toISOString(),
                  sourceAgentNodeId: blockId,
                },
              },
            ];
          });

          // Remove old edges from block to old output nodes, add new edge
          setEdges(eds => {
            const filtered = eds.filter(e =>
              !(e.source === blockId && getNodes().find(n => n.id === e.target)?.type === 'outputNode')
            );
            return [
              ...filtered,
              {
                id: `edge-${blockId}-${outputNodeId}`,
                source: blockId,
                target: outputNodeId,
                type: 'custom',
                data: { output: result },
                animated: true,
              },
            ];
          });

          // Update block node with current output reference
          setNodes(nds =>
            nds.map(n =>
              n.id === blockId
                ? { ...n, data: { ...n.data, currentOutputNodeId: outputNodeId } }
                : n
            )
          );
        } catch (err) {
          console.error('[useRunBlock] Failed to create output node:', err);
        }
      }

      // Update outgoing edges from block with animation
      setEdges(eds =>
        eds.map(e =>
          e.source === blockId
            ? { ...e, data: { ...e.data, output: result }, animated: true }
            : e
        )
      );

      toast({
        title: 'Block completed',
        description: `All ${result.childCount} agent(s) finished successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      console.log('[useRunBlock] Block output:', result);

      if (refetchHorizon) {
        refetchHorizon();
      }
    },

    onError: (error, variables, context) => {
      if (context?.loadingToastId) {
        toast.close(context.loadingToastId);
      }

      toast({
        title: 'Block execution failed',
        description: error.message || 'Failed to execute block agents',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      console.error('[useRunBlock] Error:', error);
    },
  });

  return mutation;
};
