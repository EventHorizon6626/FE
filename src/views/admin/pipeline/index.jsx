/* eslint-disable */
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAdd,
  MdDelete,
  MdHub,
  MdSearch,
} from 'react-icons/md';
import { request } from 'lib/api';
import { formatRelativeTime } from 'utils/formatTime';

// Color mapping for agent node types
const AGENT_COLORS = {
  candlestick: '#3B82F6',  // blue
  earnings: '#22C55E',     // green
  news: '#F97316',         // orange
  technical: '#A855F7',    // purple
  fundamentals: '#14B8A6', // teal
  bull_bear_analyzer: '#A855F7',
  risk_manager: '#F97316',
  custom_agent: '#6366F1', // indigo
};

const NODE_TYPE_COLORS = {
  agentNode: '#3B82F6',
  portfolioNode: '#0D9488',
  outputNode: '#6B7280',
};

/** Mini SVG workflow preview — auto-layouts nodes as a left-to-right tree */
function WorkflowPreview({ nodes, edges }) {
  if (!nodes || nodes.length === 0) {
    return (
      <Box
        h="80px"
        bg="gray.50"
        borderRadius="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb="12px"
      >
        <Text fontSize="xs" color="gray.400">No nodes yet</Text>
      </Box>
    );
  }

  const getNodeColor = (node) => {
    if (node.type === 'portfolioNode') return NODE_TYPE_COLORS.portfolioNode;
    if (node.type === 'outputNode') return NODE_TYPE_COLORS.outputNode;
    const agentType = node.data?.agent?.type;
    const agentColor = node.data?.agent?.color;
    if (agentType && AGENT_COLORS[agentType]) return AGENT_COLORS[agentType];
    const colorMap = { blue: '#3B82F6', green: '#22C55E', orange: '#F97316', purple: '#A855F7', teal: '#14B8A6' };
    if (agentColor && colorMap[agentColor]) return colorMap[agentColor];
    return NODE_TYPE_COLORS.agentNode;
  };

  // Build adjacency from edges or parentId
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id || n._id] = n; });

  const children = {}; // parentId -> [childIds]
  const hasParent = new Set();

  const resolvedEdges = (edges && edges.length > 0) ? edges : nodes
    .filter(n => n.parentId || n.data?.parentId)
    .map(n => ({ source: n.parentId || n.data?.parentId, target: n.id || n._id }));

  resolvedEdges.forEach(e => {
    const src = e.source;
    const tgt = e.target;
    if (!children[src]) children[src] = [];
    children[src].push(tgt);
    hasParent.add(tgt);
  });

  // Find roots (nodes with no parent)
  const roots = nodes.filter(n => !hasParent.has(n.id || n._id));
  // If no roots found (circular), just use all nodes
  if (roots.length === 0) roots.push(...nodes);

  // BFS to assign column (depth) and row within each column
  const laid = {}; // nodeId -> { col, row }
  const colCounts = {}; // col -> count of nodes placed

  const queue = roots.map((r, i) => ({ id: r.id || r._id, col: 0, rootIdx: i }));
  const visited = new Set();

  while (queue.length > 0) {
    const { id, col } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    if (!colCounts[col]) colCounts[col] = 0;
    laid[id] = { col, row: colCounts[col]++ };
    const kids = children[id] || [];
    kids.forEach(kid => {
      if (!visited.has(kid)) queue.push({ id: kid, col: col + 1 });
    });
  }

  // Place any unvisited nodes (disconnected)
  let disconnectedRow = 0;
  nodes.forEach(n => {
    const nid = n.id || n._id;
    if (!visited.has(nid)) {
      const col = 0;
      if (!colCounts[col]) colCounts[col] = 0;
      laid[nid] = { col, row: colCounts[col]++ };
    }
  });

  // Convert layout to SVG positions
  const svgWidth = 300;
  const svgHeight = 80;
  const padding = 20;
  const maxCol = Math.max(...Object.values(laid).map(l => l.col), 0);
  const maxRowPerCol = {};
  Object.values(laid).forEach(l => {
    maxRowPerCol[l.col] = Math.max(maxRowPerCol[l.col] || 0, l.row);
  });

  const colSpacing = maxCol > 0 ? (svgWidth - padding * 2) / maxCol : 0;

  const toSvg = (nodeId) => {
    const l = laid[nodeId];
    if (!l) return { x: svgWidth / 2, y: svgHeight / 2 };
    const maxRow = maxRowPerCol[l.col] || 0;
    const rowSpacing = maxRow > 0 ? (svgHeight - padding * 2) / maxRow : 0;
    return {
      x: padding + l.col * colSpacing,
      y: maxRow === 0 ? svgHeight / 2 : padding + l.row * rowSpacing,
    };
  };

  return (
    <Box
      h="80px"
      bg="gray.50"
      borderRadius="8px"
      overflow="hidden"
      mb="12px"
    >
      <svg width="100%" height="80" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
        {/* Edges */}
        {resolvedEdges.map((edge, i) => {
          const src = toSvg(edge.source);
          const tgt = toSvg(edge.target);
          return (
            <line
              key={`e-${i}`}
              x1={src.x} y1={src.y}
              x2={tgt.x} y2={tgt.y}
              stroke="#CBD5E0"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
        {/* Nodes */}
        {nodes.map((node) => {
          const nid = node.id || node._id;
          const pos = toSvg(nid);
          const color = getNodeColor(node);
          const radius = node.type === 'outputNode' ? 4 : 6;
          return (
            <circle
              key={nid}
              cx={pos.x}
              cy={pos.y}
              r={radius}
              fill={color}
              stroke="white"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </Box>
  );
}

export default function PipelineList() {
  const [savedHorizons, setSavedHorizons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [horizonToDelete, setHorizonToDelete] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated', 'created', 'name'

  useEffect(() => {
    const loadHorizons = async () => {
      try {
        setIsLoading(true);
        const result = await request.get('/horizons');
        if (result.success && result.data) {
          console.log('[PipelineList] Loaded horizons:', result.data);
          console.log('[PipelineList] First horizon keys:', result.data[0] ? Object.keys(result.data[0]) : 'No horizons');
          setSavedHorizons(result.data);
        }
      } catch (error) {
        console.error('Failed to load horizons:', error);
        toast({
          title: 'Failed to load horizons',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadHorizons();
  }, [toast]);

  const handleNewHorizon = async () => {
    const newHorizonName = `Untitled ${savedHorizons.length + 1}`;

    try {
      const horizonData = {
        name: newHorizonName,
        description: '', // Add empty description
        edges: [],
        viewport: { x: 0, y: 0, zoom: 0.9 },
      };

      const response = await request.post('/horizons', horizonData);
      const createdHorizon = response.data;

      console.log('[PipelineList] Created horizon:', createdHorizon);

      setSavedHorizons([...savedHorizons, createdHorizon]);

      navigate(`/pipeline/${createdHorizon.id}`);

      toast({
        title: 'New horizon created',
        description: newHorizonName,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to create horizon:', error);
      toast({
        title: 'Failed to create horizon',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLoadHorizon = (horizon) => {
    const horizonId = horizon.id;
    if (!horizonId) {
      console.error('Horizon ID not found:', horizon);
      toast({
        title: 'Error',
        description: 'Horizon ID is missing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    console.log('Navigating to horizon:', horizonId);
    navigate(`/pipeline/${horizonId}`);
  };

  const handleDeleteClick = (e, horizon) => {
    e.stopPropagation();
    setHorizonToDelete(horizon);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!horizonToDelete) return;

    try {
      await request.delete(`/horizons/${horizonToDelete.id}`);

      setSavedHorizons(savedHorizons.filter(h => h.id !== horizonToDelete.id));

      toast({
        title: 'Horizon deleted',
        description: `"${horizonToDelete.name}" has been deleted`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to delete horizon:', error);
      toast({
        title: 'Failed to delete horizon',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setHorizonToDelete(null);
      onDeleteClose();
    }
  };

  // Filter and sort horizons
  const filteredAndSortedHorizons = savedHorizons
    .filter((horizon) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        horizon.name.toLowerCase().includes(query) ||
        (horizon.description && horizon.description.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updated':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

  if (isLoading) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <VStack spacing="20px">
          <Icon as={MdHub} boxSize="64px" color="teal.500" />
          <Text fontSize="xl" fontWeight="600" color="gray.700">Loading horizons...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box h="100vh" bg="#FAFAFA" p="40px">
      <VStack spacing="30px" maxW="1200px" mx="auto">
        <HStack justify="space-between" w="full" mb="20px">
          <Text fontSize="3xl" fontWeight="bold" color="gray.800">
            Horizons
          </Text>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="teal"
            size="md"
            onClick={handleNewHorizon}
          >
            New Horizon
          </Button>
        </HStack>

        <HStack spacing="15px" w="full" mb="25px">
          <InputGroup flex="1">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search horizons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              borderColor="gray.200"
              _focus={{
                borderColor: 'teal.600',
                boxShadow: '0 0 0 1px teal.600',
              }}
            />
          </InputGroup>

          <HStack spacing="8px">
            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
              Sort by
            </Text>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="md"
              width="140px"
              bg="white"
              borderColor="gray.200"
              _focus={{
                borderColor: 'teal.600',
                boxShadow: '0 0 0 1px teal.600',
              }}
            >
              <option value="updated">Updated</option>
              <option value="created">Created</option>
              <option value="name">Name</option>
            </Select>
          </HStack>
        </HStack>

        {filteredAndSortedHorizons.length === 0 ? (
          <Box
            w="full"
            py="80px"
            textAlign="center"
            bg="white"
            borderRadius="16px"
            border="2px dashed"
            borderColor="gray.300"
          >
            {searchQuery ? (
              <>
                <Icon as={MdSearch} boxSize="64px" color="gray.300" mb="20px" />
                <Text fontSize="xl" fontWeight="600" color="gray.600" mb="10px">
                  No horizons found
                </Text>
                <Text fontSize="md" color="gray.500" mb="20px">
                  No horizons match "{searchQuery}"
                </Text>
                <Button
                  variant="outline"
                  colorScheme="teal"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <Icon as={MdHub} boxSize="64px" color="gray.300" mb="20px" />
                <Text fontSize="xl" fontWeight="600" color="gray.600" mb="10px">
                  No horizons yet
                </Text>
                <Text fontSize="md" color="gray.500" mb="20px">
                  Create your first horizon to get started
                </Text>
                <Button
                  leftIcon={<Icon as={MdAdd} />}
                  colorScheme="teal"
                  size="lg"
                  onClick={handleNewHorizon}
                >
                  Create First Horizon
                </Button>
              </>
            )}
          </Box>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))"
            gap="20px"
            w="full"
          >
            {filteredAndSortedHorizons.map((horizon) => (
              <Box
                key={horizon.id}
                p="24px"
                bg="white"
                borderRadius="12px"
                border="1px solid"
                borderColor="gray.200"
                cursor="pointer"
                _hover={{
                  borderColor: 'gray.300',
                  boxShadow: 'md',
                  transform: 'translateY(-2px)'
                }}
                transition="all 0.2s"
                onClick={() => handleLoadHorizon(horizon)}
                position="relative"
                role="group"
              >
                {/* Delete button - shows on hover */}
                <IconButton
                  icon={<Icon as={MdDelete} />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={(e) => handleDeleteClick(e, horizon)}
                  aria-label="Delete horizon"
                  position="absolute"
                  top="16px"
                  right="16px"
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                />

                {/* Horizon Title */}
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="gray.800"
                  mb="12px"
                  noOfLines={1}
                  pr="40px"
                >
                  {horizon.name}
                </Text>

                {/* Workflow Preview */}
                <WorkflowPreview nodes={horizon.nodes} edges={horizon.edges} />

                {/* Updated timestamp */}
                <Text fontSize="sm" color="gray.500">
                  Updated {formatRelativeTime(horizon.updatedAt)}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Horizon
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{horizonToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
