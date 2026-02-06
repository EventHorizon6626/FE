import React from 'react';
import {
  Box,
  HStack,
  Icon,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { MdPlayArrow, MdSmartToy } from 'react-icons/md';
import { Handle, Position, useReactFlow } from 'reactflow';
import { useRunAgent } from '../../hooks/useRunAgent';
import { RobotHead } from './RobotHead';

export const CustomAgentNode = ({ data, id, selected }) => {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();

  const runAgentMutation = useRunAgent({
    setNodes,
    setEdges,
    getNodes,
    getEdges,
    onSuccess: ({ nodeId, result, agentName, currentNodes }) => {
      // Create output node if no outgoing edge exists
      const outputNodeId = `output-${Date.now()}`;
      const agentNodePosition = currentNodes.find(n => n.id === nodeId)?.position || { x: 0, y: 0 };

      const outputNode = {
        id: outputNodeId,
        type: 'outputNode',
        position: {
          x: agentNodePosition.x + 350,
          y: agentNodePosition.y,
        },
        data: {
          result: result,
          agentName: agentName,
          timestamp: new Date().toISOString(),
          onDelete: data.onDelete,
        },
      };

      const outputEdge = {
        id: `edge-${nodeId}-${outputNodeId}`,
        source: nodeId,
        target: outputNodeId,
        type: 'custom',
        data: { output: result },
        animated: true,
      };

      setNodes((nds) => [...nds, outputNode]);
      setEdges((eds) => [...eds, outputEdge]);
    },
  });

  const handlePlay = (e) => {
    e.stopPropagation();
    
    if (runAgentMutation.isPending) {
      return; // Prevent multiple clicks
    }

    runAgentMutation.mutate({ nodeId: id });
  };

  return (
    <Box position="relative" className="custom-agent-node">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '12px', height: '12px' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '12px', height: '12px' }}
      />

      <Box
        position="absolute"
        top="-8px"
        right="-8px"
        zIndex="10"
      >
        <IconButton
          icon={<Icon as={MdPlayArrow} />}
          size="sm"
          colorScheme="green"
          variant="solid"
          borderRadius="full"
          aria-label="Run agent"
          onClick={handlePlay}
          boxShadow="md"
          _hover={{ transform: 'scale(1.1)', boxShadow: 'lg' }}
          transition="all 0.2s"
          isLoading={runAgentMutation.isPending}
          isDisabled={runAgentMutation.isPending}
        />
      </Box>

      <Box
        p="20px"
        bg="white"
        borderRadius="16px"
        border={selected ? "3px solid" : "3px solid"}
        borderColor={selected ? "teal.500" : `${data.agent?.color || 'blue'}.400`}
        boxShadow={selected ? "0 4px 12px rgba(49, 151, 149, 0.4)" : "lg"}
        minW="200px"
        transition="all 0.2s"
        opacity={runAgentMutation.isPending ? 0.7 : 1}
      >
        <HStack spacing="12px">
          <RobotHead
            description={data.agent?.description || data.agent?.name || 'agent'}
            size={28}
          />
          <Text fontSize="md" fontWeight="700">
            {data.agent?.name || 'Agent'}
          </Text>
        </HStack>
        
        {runAgentMutation.isPending && (
          <Text fontSize="xs" color="gray.500" mt="8px">
            Running...
          </Text>
        )}
      </Box>
    </Box>
  );
};
