/* eslint-disable */
import {
  Box,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useClipboard,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import {
  MdContentCopy,
  MdAccountTree,
  MdAdd,
  MdPanTool,
  MdSettings,
} from 'react-icons/md';
import { IDshorten } from 'utils';

// Mini node component to render child nodes inside block
function ChildNodeDisplay({ child, index, onExtractAndDrag, onConfig }) {
  const nodeId = child.id; // Use actual node ID
  const { onCopy } = useClipboard(nodeId);
  
  // Determine node color based on type
  const getNodeColor = (type) => {
    switch (type) {
      case 'agent':
      case 'agentNode':
        return { bg: 'blue.50', border: 'blue.300', badge: 'blue' };
      case 'analyzer':
        return { bg: 'purple.50', border: 'purple.300', badge: 'purple' };
      case 'dataSource':
      case 'portfolioNode':
        return { bg: 'green.50', border: 'green.300', badge: 'green' };
      default:
        return { bg: 'gray.50', border: 'gray.300', badge: 'gray' };
    }
  };

  const colors = getNodeColor(child.type);
  const nodeName = child.data?.agent?.name || child.data?.portfolio?.name || child.data?.config?.name || 'Unnamed';

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onExtractAndDrag) {
      onExtractAndDrag(nodeId, e); // Pass nodeId instead of index
    }
  };

  const handleConfigClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onConfig) {
      onConfig(nodeId); // Pass nodeId instead of index
    }
  };

  return (
    <Box
      w="full"
      p="10px"
      bg={colors.bg}
      borderRadius="8px"
      border="2px solid"
      borderColor={colors.border}
      position="relative"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      className="nopan nodrag"
    >
      {/* Action buttons row */}
      <HStack
        position="absolute"
        right="4px"
        top="4px"
        spacing="2px"
      >
        {/* Config button */}
        <Tooltip label="Configure node" placement="top" hasArrow>
          <IconButton
            icon={<Icon as={MdSettings} />}
            size="xs"
            colorScheme="purple"
            variant="ghost"
            aria-label="Configure node"
            onClick={handleConfigClick}
            borderRadius="full"
            _hover={{ bg: 'purple.100', transform: 'scale(1.1)' }}
            transition="all 0.2s"
            className="nodrag"
          />
        </Tooltip>

        {/* Drag/Extract button */}
        <Tooltip label="Hold to drag out" placement="top" hasArrow>
          <IconButton
            icon={<Icon as={MdPanTool} />}
            size="xs"
            colorScheme="blue"
            variant="ghost"
            aria-label="Drag to extract"
            onMouseDown={handleMouseDown}
            cursor="grab"
            _active={{ cursor: 'grabbing' }}
            borderRadius="full"
            _hover={{ bg: 'blue.100', transform: 'scale(1.1)' }}
            transition="all 0.2s"
            className="nodrag"
          />
        </Tooltip>
      </HStack>

      {/* Node content */}
      <VStack align="start" spacing="4px" pr="60px">
        <HStack spacing="6px">
          <Badge colorScheme={colors.badge} fontSize="xs">
            {child.type}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            #{index + 1}
          </Text>
        </HStack>
        
        <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>
          {nodeName}
        </Text>

        {/* ID display */}
        <Tooltip 
          label={nodeId} 
          placement="bottom"
          hasArrow
          bg="gray.700"
          color="white"
          fontSize="xs"
        >
          <HStack 
            spacing="4px" 
            bg="white" 
            px="6px" 
            py="2px" 
            borderRadius="4px"
            border="1px solid"
            borderColor={colors.border}
            _hover={{ bg: 'gray.50' }}
            cursor="pointer"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
          >
            <Text fontSize="xs" color="gray.600" fontFamily="monospace">
              {IDshorten(nodeId)}
            </Text>
            <Icon as={MdContentCopy} boxSize="10px" color="gray.400" />
          </HStack>
        </Tooltip>
      </VStack>
    </Box>
  );
}

export function CustomBlockNode({ data, id, selected }) {
  const { hasCopied, onCopy } = useClipboard(id);
  const [isExpanded, setIsExpanded] = useState(true);

  const childNodes = data.childNodes || [];
  const isHighlighted = data.isHighlighted || false;

  // Handle extract and drag child node - now takes childNodeId instead of index
  const handleExtractAndDrag = (childNodeId, event) => {
    if (data.onExtractAndDrag) {
      data.onExtractAndDrag(id, childNodeId, event);
    }
  };

  // Handle config button click on child node - now takes childNodeId instead of index
  const handleChildConfig = (childNodeId) => {
    if (data.onConfigChildNode) {
      data.onConfigChildNode(id, childNodeId);
    }
  };

  return (
    <Box 
      position="relative" 
      className="custom-block-node"
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#805AD5', width: '12px', height: '12px' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#805AD5', width: '12px', height: '12px' }}
      />

      <Box
        p="16px"
        bg="white"
        borderRadius="12px"
        border={selected ? "3px solid" : "3px dashed"}
        borderColor={
          isHighlighted ? "green.400" : (selected ? "purple.500" : "purple.300")
        }
        boxShadow={
          isHighlighted 
            ? "0 0 0 4px rgba(72, 187, 120, 0.3), 0 4px 12px rgba(72, 187, 120, 0.4)" 
            : (selected ? "0 4px 12px rgba(128, 90, 213, 0.4)" : "md")
        }
        minW="320px"
        maxW="500px"
        transition="all 0.2s"
        bg={isHighlighted ? "green.50" : "white"}
      >
        <VStack align="start" spacing="12px">
          {/* Header */}
          <HStack justify="space-between" w="full">
            <HStack spacing="8px">
              <Icon 
                as={MdAccountTree} 
                color={isHighlighted ? "green.600" : "purple.600"} 
                boxSize="20px" 
              />
              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Block Container
              </Text>
            </HStack>
            {data.onAddToBlock && (
              <Tooltip label="Add nodes to block" placement="top">
                <IconButton
                  icon={<Icon as={MdAdd} />}
                  size="xs"
                  colorScheme={isHighlighted ? "green" : "purple"}
                  variant="ghost"
                  aria-label="Add to block"
                  onClick={() => data.onAddToBlock(id)}
                />
              </Tooltip>
            )}
          </HStack>

          {/* ID Section with Tooltip and Copy Button */}
          {/* <Tooltip 
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
              w="full"
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
          </Tooltip> */}

          {/* Child Nodes Display */}
          {isExpanded && childNodes.length > 0 && (childNodes.map((child, index) => (
                <ChildNodeDisplay
                  key={child.id || index}
                  child={child}
                  index={index}
                  onExtractAndDrag={handleExtractAndDrag}
                  onConfig={handleChildConfig}
                />
              ))
            // <VStack 
            //   w="full" 
            //   spacing="8px" 
            //   p="12px" 
            //   borderRadius="8px"
            //   border="2px dashed"
            //   borderColor={isHighlighted ? "green.300" : "purple.200"}
            //   bg={isHighlighted ? "green.50" : "purple.50"}
            // >
            //   <Text 
            //     fontSize="xs" 
            //     fontWeight="600" 
            //     color={isHighlighted ? "green.700" : "purple.700"} 
            //     w="full"
            //   >
            //     Contained Nodes:
            //   </Text>
              
            // </VStack>
          )}

          {/* Empty state */}
          {childNodes.length === 0 && (
            <Box
              w="full"
              p="20px"
              bg={isHighlighted ? "green.100" : "purple.50"}
              borderRadius="8px"
              border="2px dashed"
              borderColor={isHighlighted ? "green.400" : "purple.300"}
              textAlign="center"
              transition="all 0.2s"
            >
              <Icon 
                as={MdAccountTree} 
                color={isHighlighted ? "green.500" : "purple.400"} 
                boxSize="32px" 
                mb="8px"
              />
              <Text 
                fontSize="sm" 
                color={isHighlighted ? "green.700" : "purple.600"} 
                fontWeight="600"
              >
                {isHighlighted ? "Drop node here!" : "Add nodes here"}
              </Text>
              <Text fontSize="xs" color="gray.500" mt="4px">
                Drag disconnected nodes here OR click + button
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
