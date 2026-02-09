import {
  Badge,
  Box,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useClipboard,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MdPlayArrow, MdContentCopy, MdAdd, MdClose } from 'react-icons/md';
import { Handle, Position, useReactFlow } from 'reactflow';
import { useRunAgent } from '../../hooks/useRunAgent';
import { RobotHead } from './RobotHead';
import { IDshorten } from '../../utils';

export const CustomAgentNode = ({ data, id, selected }) => {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();
  const { onCopy } = useClipboard(id);
  const [showAddOptions, setShowAddOptions] = useState(false);

  const runAgentMutation = useRunAgent({
    setNodes,
    setEdges,
    getNodes,
    getEdges,
    horizonId: data.horizonId, // Pass horizonId for backend auto-save
    refetchHorizon: data.refetchHorizon, // Pass refetch function
  });

  const handlePlay = (e) => {
    e.stopPropagation();

    if (runAgentMutation.isPending) {
      return; // Prevent multiple clicks
    }

    runAgentMutation.mutate({ nodeId: id });
  };

  return (
    <Box position="relative" className={`custom-agent-node${showAddOptions ? ' add-options-open' : ''}`}>
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

      {/* Play button */}
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

      {/* Add child analyzer node button — invisible hover zone near right edge */}
      {data.onAddChildNode && (
        <Box className="add-node-zone nopan nodrag" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <IconButton
            className={`add-node-btn${showAddOptions ? ' add-node-btn--open' : ''}`}
            icon={<Icon as={showAddOptions ? MdClose : MdAdd} />}
            size="xs"
            colorScheme="purple"
            variant="solid"
            borderRadius="full"
            position="absolute"
            right="6px"
            top="50%"
            transform="translateY(-50%)"
            zIndex="10"
            boxShadow="md"
            aria-label="Add analyzer node"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setShowAddOptions(!showAddOptions);
            }}
            _hover={{ transform: 'translateY(-50%) scale(1.15)' }}
          />
          {showAddOptions && (
            <Box
              as="button"
              className="nopan nodrag"
              position="absolute"
              left="100%"
              top="50%"
              transform="translateY(-50%)"
              ml="8px"
              display="flex"
              alignItems="center"
              gap="6px"
              px="12px"
              py="6px"
              bg="purple.50"
              border="2px solid"
              borderColor="purple.300"
              borderRadius="12px"
              cursor="pointer"
              boxShadow="sm"
              zIndex="10"
              _hover={{ bg: 'purple.100', borderColor: 'purple.400', transform: 'translateY(-50%) translateY(-1px)', boxShadow: 'md' }}
              transition="all 0.2s"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                data.onAddChildNode(id, {
                  name: 'Analyzer',
                  type: 'custom_agent',
                  system: 'analyzer',
                  color: 'purple',
                  description: 'Analysis agent',
                });
                setShowAddOptions(false);
              }}
            >
              <RobotHead description="Analysis agent" size={18} />
              <Text fontSize="xs" fontWeight="600" color="purple.700" whiteSpace="nowrap">Analyzer</Text>
            </Box>
          )}
        </Box>
      )}

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
        <VStack spacing="8px" align="stretch">
          <HStack spacing="12px">
            <RobotHead
              description={data.agent?.description || data.agent?.name || 'agent'}
              size={28}
            />
            <Text fontSize="md" fontWeight="700">
              {data.agent?.name || 'Agent'}
            </Text>
            {data.agent?.isAutoCreated && (
              <Badge colorScheme="purple" fontSize="2xs" variant="solid" borderRadius="full" px="6px">
                Auto
              </Badge>
            )}
          </HStack>

          {/* ID Section with Tooltip and Copy Button */}
          <Tooltip 
            label={id} 
            placement="bottom"
            hasArrow
            bg="gray.700"
            color="white"
            fontSize="xs"
            p="8px"
          >
            <HStack 
              spacing="6px" 
              bg="gray.50" 
              p="6px 8px" 
              borderRadius="6px"
              _hover={{ bg: 'gray.100' }}
              transition="all 0.2s"
              justify="space-between"
            >
              <Text fontSize="xs" color="gray.600" fontFamily="monospace">
                {IDshorten(id)}
              </Text>
              <IconButton
                icon={<Icon as={MdContentCopy} />}
                size="xs"
                variant="ghost"
                colorScheme="gray"
                aria-label="Copy ID"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
                _hover={{ bg: 'gray.200' }}
              />
            </HStack>
          </Tooltip>

          {runAgentMutation.isPending && (
            <Text fontSize="xs" color="gray.500">
              Running...
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};
