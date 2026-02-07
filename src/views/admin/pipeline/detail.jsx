/* eslint-disable */
import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Switch,
  Text,
  Textarea,
  Tooltip,
  useClipboard,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// useMutation removed - now used in CustomAgentNode component
import {
  MdAccountBalance,
  MdAdd,
  MdArticle,
  MdClose,
  MdContentCopy,
  MdDelete,
  MdEdit,
  MdGroups,
  MdHome,
  MdHub,
  MdMoreVert,
  MdLightbulb,
  MdPlayArrow,
  MdPsychology,
  MdSave,
  MdShowChart,
  MdSmartToy,
  MdSpeed,
  MdTrendingUp,
  MdWarning
} from 'react-icons/md';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../../assets/css/ReactFlowCustom.css';
import { searchSecurities, SECURITIES } from 'data/securities';
import { runAgent, getAgentInputData } from 'lib/agentApi';
import { request } from 'lib/api';
import portfolioApi from 'lib/portfolioApi';
import horizonAgentApi from 'lib/horizonAgentApi';
import nodeApi from 'lib/nodeApi';
import { CustomAgentNode } from 'components/pipeline/CustomAgentNode';
import { RobotHead } from 'components/pipeline/RobotHead';
import Chart from 'react-apexcharts';
import StockAnalysisCard from 'views/admin/portfolio/components/StockAnalysisCard';
import { IDshorten } from 'utils';

// Sidebar view modes
const SIDEBAR_VIEW = {
  LIST: 0,
  DETAIL: 1,
};

const BUILTIN_AGENTS = [
  // System 1: Data Pipeline Agents
  {
    id: 'candlestick',
    name: 'Candlestick',
    type: 'candlestick',
    system: 'data',
    icon: MdShowChart,
    color: 'blue',
    isBuiltin: true,
  },
  {
    id: 'earnings',
    name: 'Earnings',
    type: 'earnings',
    system: 'data',
    icon: MdAccountBalance,
    color: 'green',
    isBuiltin: true,
  },
  {
    id: 'news',
    name: 'News',
    type: 'news',
    system: 'data',
    icon: MdArticle,
    color: 'orange',
    isBuiltin: true,
  },
  {
    id: 'technical',
    name: 'Technical',
    type: 'technical',
    system: 'data',
    icon: MdSpeed,
    color: 'purple',
    isBuiltin: true,
  },
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    type: 'fundamentals',
    system: 'data',
    icon: MdAccountBalance,
    color: 'teal',
    isBuiltin: true,
  },
];

// Default library of analyzer agents (System 2)
const DEFAULT_ANALYZERS = [
  {
    id: 'bull_bear_analyzer',
    name: 'Bull-Bear Analyzer',
    type: 'bull_bear_analyzer',
    system: 'analyzer',
    category: 'bull_bear_analyzer',
    description: 'Debates bull and bear cases to form balanced investment thesis',
    icon: MdSmartToy,
    color: 'purple',
    isBuiltin: true,
  },
  {
    id: 'risk_manager',
    name: 'Risk Manager',
    type: 'risk_manager',
    system: 'analyzer',
    category: 'risk_analyzer',
    description: 'Evaluates portfolio risk and position sizing',
    icon: MdWarning,
    color: 'orange',
    isBuiltin: true,
  },
];

const AGENT_CATEGORIES = [
  { value: 'strategy_agent', label: '🎯 Strategy Agent', system: 'team' },
  { value: 'risk_manager', label: '⚖️ Risk Manager', system: 'team' },
  { value: 'custom_analyzer', label: '🤖 Custom Analyzer', system: 'team' },
];

const initialNodes = [];
const initialEdges = [];

// CustomAgentNode moved to components/pipeline/CustomAgentNode.jsx
// This component now uses useMutation hook for better loading state management

function CustomPortfolioNode({ data, id, selected }) {
  const { hasCopied, onCopy } = useClipboard(id);

  return (
    <Box position="relative" className="custom-portfolio-node">
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#38A169', width: '12px', height: '12px' }}
      />

      <Box
        p="16px"
        bg="white"
        borderRadius="12px"
        border={selected ? "3px solid" : "3px dashed"}
        borderColor={selected ? "green.500" : "green.300"}
        boxShadow={selected ? "0 4px 12px rgba(56, 161, 105, 0.4)" : "md"}
        minW="220px"
        maxW="300px"
        transition="all 0.2s"
      >
        <VStack align="start" spacing="8px">
          <HStack spacing="8px">
            <Icon as={MdShowChart} color="green.600" boxSize="20px" />
            <Text fontSize="sm" fontWeight="700" color="gray.800">
              {data.portfolio?.name || 'Portfolio'}
            </Text>
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
          </Tooltip>

          {data.portfolio?.description && (
            <Text fontSize="xs" color="gray.600" noOfLines={2}>
              {data.portfolio.description}
            </Text>
          )}

          {data.portfolio?.stocks && data.portfolio.stocks.length > 0 && (
            <VStack align="start" spacing="4px" w="full">
              <Text fontSize="xs" fontWeight="600" color="gray.600">
                Assets ({data.portfolio.stocks.length}):
              </Text>
              <Box
                maxH="120px"
                overflowY="auto"
                w="full"
                bg="gray.50"
                p="8px"
                borderRadius="6px"
              >
                <Text fontSize="xs" color="gray.700" lineHeight="1.6">
                  {data.portfolio.stocks.join(', ')}
                </Text>
              </Box>
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
}

function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [showOutput, setShowOutput] = useState(false);

  const handleInspect = (e) => {
    e.stopPropagation();
    setShowOutput(!showOutput);
  };

  return (
    <>
      <BaseEdge path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          <IconButton
            icon={<Icon as={MdArticle} />}
            size="xs"
            colorScheme="teal"
            variant="solid"
            borderRadius="full"
            aria-label="Inspect data"
            onClick={handleInspect}
            boxShadow="md"
            _hover={{ transform: 'scale(1.2)' }}
          />
          {showOutput && data?.output && (
            <Box
              position="absolute"
              top="30px"
              left="50%"
              transform="translateX(-50%)"
              bg="white"
              border="2px solid"
              borderColor="teal.400"
              borderRadius="8px"
              p="12px"
              minW="300px"
              maxW="500px"
              maxH="400px"
              overflowY="auto"
              boxShadow="lg"
              zIndex="1000"
            >
              <HStack justify="space-between" mb="8px">
                <Text fontSize="xs" fontWeight="700" color="teal.600">
                  Data Flow
                </Text>
                <IconButton
                  icon={<Icon as={MdClose} />}
                  size="xs"
                  variant="ghost"
                  onClick={handleInspect}
                  aria-label="Close"
                />
              </HStack>
              <Box
                fontSize="xs"
                fontFamily="monospace"
                bg="gray.50"
                p="8px"
                borderRadius="4px"
                userSelect="text"
                cursor="text"
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'text' }}>
                  {JSON.stringify(data.output, null, 2)}
                </pre>
              </Box>
            </Box>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function CustomOutputNode({ data, id, selected }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { hasCopied, onCopy } = useClipboard(id);

  return (
    <Box position="relative" className="custom-output-node">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#38B2AC', width: '12px', height: '12px' }}
      />

      <Box
        p="16px"
        bg="white"
        borderRadius="12px"
        border={selected ? "3px solid" : "2px solid"}
        borderColor={selected ? "teal.500" : "teal.300"}
        boxShadow={selected ? "0 4px 12px rgba(56, 178, 172, 0.4)" : "md"}
        minW="280px"
        maxW="400px"
        transition="all 0.2s"
      >
        <VStack align="start" spacing="12px">
          <HStack justify="space-between" w="full">
            <HStack spacing="8px">
              <Icon as={MdArticle} color="teal.600" boxSize="20px" />
              <Text fontSize="sm" fontWeight="700" color="gray.800">
                {data.agentName} Output
              </Text>
            </HStack>
            {/* <IconButton
              icon={<Icon as={isExpanded ? MdClose : MdWarning} />}
              size="xs"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            /> */}
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
          </Tooltip>

          <HStack spacing="6px">
            <Badge colorScheme="teal" fontSize="xs">
              📤 Result
            </Badge>
            {data.revisionCount && data.revisionCount > 1 && (
              <Badge colorScheme="purple" fontSize="xs">
                {data.revisionCount} runs
              </Badge>
            )}
          </HStack>

          <VStack align="start" spacing="4px" w="full">
            <Text fontSize="xs" color="gray.600">
              Status: <Text as="span" color="green.600" fontWeight="600">{data.result?.status || 'success'}</Text>
            </Text>
            <Text fontSize="xs" color="gray.600">
              Symbols: {data.result?.total_symbols || 0}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {new Date(data.timestamp).toLocaleString()}
            </Text>
          </VStack>

          {isExpanded && (
            <Box
              maxH="300px"
              overflowY="auto"
              bg="gray.50"
              p="12px"
              borderRadius="8px"
              w="full"
              fontSize="xs"
              fontFamily="monospace"
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(data.result, null, 2)}
              </pre>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
}

// Define custom node and edge types
const nodeTypes = {
  agentNode: CustomAgentNode,
  portfolioNode: CustomPortfolioNode,
  outputNode: CustomOutputNode,
};

const edgeTypes = {
  custom: CustomEdge,
};
function PipelineBuilderInner() {
  const { id } = useParams(); // Get horizon ID from URL
  const navigate = useNavigate();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeDefault] = useEdgesState(initialEdges);
  
  // Custom onEdgesChange to handle edge deletion
  const onEdgesChange = useCallback(
    async (changes) => {
      // Apply changes to ReactFlow immediately
      onEdgesChangeDefault(changes);

      // Check if any edge was removed
      const removedEdges = changes.filter(change => change.type === 'remove');
      
      if (removedEdges.length > 0) {
        // Find the edge details before it's removed
        const currentEdges = edges;
        
        for (const change of removedEdges) {
          const edge = currentEdges.find(e => e.id === change.id);
          if (edge) {
            try {
              // Clear parentId of the target node
              await nodeApi.update(edge.target, {
                parentId: null,
              });
              console.log(`[onEdgesChange] Cleared parentId for node ${edge.target}`);
            } catch (error) {
              console.error('[onEdgesChange] Failed to clear parent relationship:', error);
            }
          }
        }
      }
    },
    [onEdgesChangeDefault, edges]
  );
  const [availableAgents, setAvailableAgents] = useState([...BUILTIN_AGENTS]); // System 1: Data agents
  const [analyzerAgents, setAnalyzerAgents] = useState([...DEFAULT_ANALYZERS]); // System 2: Analyzer agents
  const [customAgents, setCustomAgents] = useState([]);
  const [currentHorizonName, setCurrentHorizonName] = useState('');
  const [currentHorizonId, setCurrentHorizonId] = useState(null);

  const { isOpen: isAgentOpen, onOpen: onAgentOpen, onClose: onAgentClose } = useDisclosure();
  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();
  const { isOpen: isPortfolioOpen, onOpen: onPortfolioOpen, onClose: onPortfolioClose } = useDisclosure();
  const { isOpen: isDataAgentOpen, onOpen: onDataAgentOpen, onClose: onDataAgentClose } = useDisclosure();

  // State for data agent suggestion modal (when thinking agent pauses)
  const [dataAgentModal, setDataAgentModal] = useState({
    nodeId: null,
    suggestedAgent: null,
    thinkingSteps: [],
    resumeContext: null,
  });

  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    category: 'data_retriever',
    system: 'data',
    model: 'gpt-4',
    systemPrompt: '',
  });

  const [editingAgent, setEditingAgent] = useState(null);
  const [tempHorizonName, setTempHorizonName] = useState('');
  const [showDataAgents, setShowDataAgents] = useState(false);
  const [showAnalyzers, setShowAnalyzers] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [editingPortfolioNodeId, setEditingPortfolioNodeId] = useState(null);
  const [portfolioConfig, setPortfolioConfig] = useState({
    name: '',
    description: '',
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeConfig, setNodeConfig] = useState({
    name: '',
    description: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
  });

  const [draggingAgent, setDraggingAgent] = useState(null);

  // State for right sidebar to show output node data
  const [selectedOutputNode, setSelectedOutputNode] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [selectedRevisionIndex, setSelectedRevisionIndex] = useState(0);
  const [isLoadingRevisions, setIsLoadingRevisions] = useState(false);
  const [sidebarView, setSidebarView] = useState(SIDEBAR_VIEW.LIST);
  
  useEffect(() => {
    if (editingPortfolio) {
      setSelectedStocks(editingPortfolio.stocks || []);
      setPortfolioConfig({
        name: editingPortfolio.name || '',
        description: editingPortfolio.description || '',
      });
    }
  }, [editingPortfolio]);
  const [tempNodeId, setTempNodeId] = useState(null);

  const toast = useToast();
  const { screenToFlowPosition } = useReactFlow();
  
  // Load horizon data from backend using React Query
  const { isLoading, data: horizonData, error: horizonError, refetch: refetchHorizon } = useQuery({
    queryKey: ['horizon', id],
    queryFn: async () => {
      console.log('[PipelineDetail] Fetching horizon:', id);
      const result = await request.get(`/horizons/${id}`);
      if (!result.success || !result.data) {
        throw new Error('Failed to load horizon data');
      }
      return result.data;
    },
    enabled: !!id,
  });

  // Handle horizon loading error
  useEffect(() => {
    if (horizonError) {
      console.error('Failed to load horizon:', horizonError);
      toast({
        title: 'Failed to load horizon',
        description: horizonError.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Redirect back to list if horizon not found
      navigate('/pipeline');
    }
  }, [horizonError, toast, navigate]);
  
  // loadingNodes state removed - now managed internally by CustomAgentNode with useMutation

  useEffect(() => {
    if (!currentHorizonId || isLoading) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await request.put(`/horizons/${currentHorizonId}`, {
          name: currentHorizonName,
          nodes,
          // edges are auto-generated from nodes' parentId, no need to save
        });
        console.log('[Auto-save] Horizon saved successfully');
      } catch (error) {
        console.error('[Auto-save] Failed to sync horizon to backend:', error);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [nodes, currentHorizonName, currentHorizonId, isLoading]);

  const onConnect = useCallback(
    async (params) => {
      console.log('[onConnect] Connection params:', params);
      
      // Add edge to canvas immediately
      setEdges((eds) => {
        const newEdge = {
          ...params,
          type: 'custom',
          data: { output: null },
        };
        const newEdges = addEdge(newEdge, eds);
        console.log('[onConnect] Updated edges:', newEdges);
        return newEdges;
      });

      // Save parent-child relationship to backend
      try {
        // Target node's parent is the source node
        await nodeApi.update(params.target, {
          parentId: params.source,
        });
        
        console.log(`[onConnect] Updated node ${params.target} with parentId: ${params.source}`);
      } catch (error) {
        console.error('[onConnect] Failed to update node relationship:', error);
        toast({
          title: 'Failed to save connection',
          description: 'The connection was added to canvas but not saved to database',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [setEdges, toast]
  );

  // Config panel is shown only on double-click (see handleNodeDoubleClick)
  // Single click just selects the node for moving/deleting

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Escape closes any open config panel
      if (event.key === 'Escape') {
        setSelectedNode(null);
        setNodes((nds) =>
          nds.map((n) => ({ ...n, selected: false }))
        );
        return;
      }

      const target = event.target;
      const isInputField = target.tagName === 'INPUT' ||
                          target.tagName === 'TEXTAREA' ||
                          target.isContentEditable ||
                          target.closest('[contenteditable="true"]');

      if (isInputField) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          const deletableNodes = selectedNodes.filter(
            (node) => !['data-pipeline', 'team1', 'team2', 'team3', 'team4'].includes(node.id)
          );
          
          if (deletableNodes.length > 0) {
            const nodeIds = deletableNodes.map((n) => n.id);
            setNodes((nds) => nds.filter((node) => !nodeIds.includes(node.id)));
            setEdges((eds) => eds.filter((edge) => 
              !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
            ));
            toast({
              title: `${deletableNodes.length} node(s) deleted`,
              status: 'info',
              duration: 2000,
              isClosable: true,
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, setNodes, setEdges, toast]);

  const handleNodeDoubleClick = useCallback((event, node) => {
    if (node.type === 'agentNode') {
      setSelectedNode(node);
      setNodeConfig({
        name: node.data?.config?.name || node.data?.agent?.name || '',
        description: node.data?.config?.description || node.data?.agent?.description || '',
        model: node.data?.config?.model || 'gpt-4',
        temperature: node.data?.config?.temperature || 0.7,
        maxTokens: node.data?.config?.maxTokens || 2000,
        systemPrompt: node.data?.agent?.systemPrompt || '',
      });
    } else if (node.type === 'portfolioNode') {
      setSelectedNode(node);
      setPortfolioConfig({
        name: node.data?.portfolio?.name || '',
        description: node.data?.portfolio?.description || '',
      });
      setSelectedStocks(node.data?.portfolio?.stocks || []);
    }
  }, []);

  const handleNodeClick = useCallback(async (event, node) => {
    if (node.type === 'outputNode') {
      setSelectedOutputNode(node);
      setSidebarView(SIDEBAR_VIEW.LIST); // Always show list view first

      // Get the agentNodeId from this outputNode
      const agentNodeId = node.parentId;
      console.log(agentNodeId)
      if (!agentNodeId) {
        console.error('[OutputNode Click] No sourceAgentNodeId found');
        setRevisions([]);
        return;
      }

      // Load ALL outputNodes (revisions) for this agent
      setIsLoadingRevisions(true);
      try {
        console.log('[OutputNode Click] Fetching revisions for agent:', agentNodeId, 'horizon:', currentHorizonId);
        const response = await nodeApi.getByAgent(agentNodeId, currentHorizonId);
        console.log('[Revisions] API Response:', response);
        console.log('[Revisions] Loaded outputs:', response.data);
        const loadedOutputs = response.data.outputs || [];
        setRevisions(loadedOutputs);
        setSelectedRevisionIndex(0); // Default to latest (newest first)

        // Update the node with revision count
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    revisionCount: loadedOutputs.length,
                  },
                }
              : n
          )
        );
      } catch (error) {
        console.error('[Revisions] Failed to load:', error);
        setRevisions([]);
        toast({
          title: 'Failed to load revision history',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingRevisions(false);
      }
    }
  }, [toast, setNodes, currentHorizonId]);

  const handleNodeDelete = useCallback(async (nodeId) => {
    try {
      await request.delete(`/nodes/${nodeId}`);
      
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ));
      
      toast({
        title: 'Node disabled',
        description: 'The node has been marked as inactive',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to disable node:', error);
      toast({
        title: 'Failed to disable node',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [setNodes, setEdges, toast]);

  const { getNodes, getEdges } = useReactFlow();

  const handleNodePlay = useCallback(async (nodeId) => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const node = currentNodes.find((n) => n.id === nodeId);
    const agentName = node?.data?.agent?.name || 'agent';
    const agentType = node?.data?.agent?.type;
    const agentConfig = node?.data?.agent;

    console.log('[handleNodePlay] Starting execution for node:', nodeId);
    console.log('[handleNodePlay] Total nodes:', currentNodes.length);
    console.log('[handleNodePlay] Total edges:', currentEdges.length);
    console.log('[handleNodePlay] Edges:', currentEdges);

    try {
      // Mark node as running
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, isRunning: true, thinkingSteps: [], status: null } }
            : n
        )
      );

      const loadingToast = toast({
        title: 'Running agent',
        description: `Executing ${agentName}...`,
        status: 'info',
        duration: null,
        isClosable: false,
      });

      const inputData = getAgentInputData(node, currentEdges, currentNodes);

      // Build custom agent config if this is a custom thinking agent
      let customAgentConfig = null;
      if (agentConfig && !agentConfig.isBuiltin && agentConfig.systemPrompt) {
        customAgentConfig = {
          systemPrompt: agentConfig.systemPrompt,
          enableThinking: agentConfig.enableThinking !== false, // Default to true
          maxIterations: agentConfig.maxIterations || 5,
        };
      }

      // Execution context for backend to auto-save outputNode
      const executionContext = {
        horizonId: currentHorizonId,
        agentNodeId: nodeId,
        agentPosition: node?.position || { x: 0, y: 0 },
      };

      const result = await runAgent(agentType, inputData, customAgentConfig, executionContext);

      // Check if result is a paused thinking agent response
      if (result?.status === 'paused' && result?.reason === 'need_data_agent') {
        // Pause execution - show modal requiring user to create data agent
        setDataAgentModal({
          nodeId: nodeId,
          suggestedAgent: result.suggested_data_agent,
          thinkingSteps: result.thinking_steps,
          resumeContext: result.resume_context,
        });
        onDataAgentOpen();

        // Update node to show paused state
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    isRunning: false,
                    status: 'paused',
                    pauseReason: result.message,
                    thinkingSteps: result.thinking_steps,
                  },
                }
              : n
          )
        );

        toast.close(loadingToast);
        toast({
          title: 'Agent paused',
          description: result.message,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Normal completion
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  output: result,
                  isRunning: false,
                  status: 'completed',
                  thinkingSteps: result?.thinking_steps || [],
                  lastRun: new Date().toISOString(),
                },
              }
            : n
        )
      );

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

      toast.close(loadingToast);
      toast({
        title: 'Agent completed',
        description: `${agentName} finished successfully${result?.iterations_used ? ` (${result.iterations_used} thinking steps)` : ''}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      console.log(`[${agentName}] Output:`, result);

      // Backend auto-saved outputNode (if horizonId was provided)
      const savedOutputNode = result?._outputNode;
      
      if (savedOutputNode) {
        console.log('[OutputNode] Backend saved:', savedOutputNode);
        
        // Remove OLD outputNode from canvas (if exists)
        const oldOutputNode = currentNodes.find(n => 
          n.type === 'outputNode' && n.data?.sourceAgentNodeId === nodeId
        );
        
        if (oldOutputNode) {
          console.log('[OutputNode] Removing old output from canvas:', oldOutputNode.id);
          setNodes((nds) => nds.filter((n) => n.id !== oldOutputNode.id));
          setEdges((eds) => eds.filter((e) => 
            e.source !== oldOutputNode.id && e.target !== oldOutputNode.id
          ));
        }

        // Add NEW outputNode to canvas (use id from backend)
        const agentNodePosition = currentNodes.find(n => n.id === nodeId)?.position || { x: 0, y: 0 };
        const newOutputNode = {
          id: savedOutputNode.id, // Use _id from backend
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
            onDelete: handleNodeDelete,
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
    } catch (error) {
      // Clear running state on error
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, isRunning: false, status: 'error' } }
            : n
        )
      );

      toast({
        title: 'Agent failed',
        description: error.message || `Failed to execute ${agentName}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error(`[${agentName}] Error:`, error);
    }
  }, [getNodes, getEdges, setNodes, setEdges, toast, onDataAgentOpen, handleNodeDelete]);

  const handleAgentMouseDown = useCallback(async (event, agent) => {
    event.preventDefault();
    
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    try {
      // Create node in backend immediately
      const response = await nodeApi.create({
        horizonId: currentHorizonId,
        type: 'agentNode',
        position,
        data: {
          agent: agent,
          config: {
            name: agent.name,
            description: agent.description || '',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000,
          },
        },
      });

      const savedNode = response.data;
      
      const newNode = {
        id: savedNode.id, // Use backend-generated ID
        type: 'agentNode',
        position,
        data: {
          agent: agent,
          horizonId: currentHorizonId, // Pass horizonId for useRunAgent
          onDelete: handleNodeDelete,
          refetchHorizon: refetchHorizon,
          config: savedNode.data.config,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setDraggingAgent(agent);
      setTempNodeId(savedNode.id);
      
      toast({
        title: 'Agent added',
        description: `${agent.name} added to pipeline`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to create agent node:', error);
      toast({
        title: 'Failed to add agent',
        description: error.message || 'Could not create agent node',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }

  }, [screenToFlowPosition, setNodes, toast, handleNodeDelete, currentHorizonId]);

  const handlePortfolioMouseDown = useCallback(async (event, portfolio) => {
    event.preventDefault();

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    try {
      // Create node in backend immediately
      const response = await nodeApi.create({
        horizonId: currentHorizonId,
        type: 'portfolioNode',
        position,
        data: {
          portfolio: portfolio,
        },
      });

      const savedNode = response.data;

      const newNode = {
        id: savedNode.id, // Use backend-generated ID
        type: 'portfolioNode',
        position,
        data: {
          portfolio: portfolio,
          onDelete: handleNodeDelete,
          refetchHorizon: refetchHorizon,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setDraggingAgent(portfolio);
      setTempNodeId(savedNode.id);

      toast({
        title: 'Portfolio added',
        description: `${portfolio.name} data source added`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to create portfolio node:', error);
      toast({
        title: 'Failed to add portfolio',
        description: error.message || 'Could not create portfolio node',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [screenToFlowPosition, setNodes, toast, handleNodeDelete, currentHorizonId]);

  useEffect(() => {
    if (!draggingAgent || !tempNodeId) return;

    const handleMouseMove = (event) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((nds) =>
        nds.map((node) =>
          node.id === tempNodeId
            ? { ...node, position }
            : node
        )
      );
    };

    const handleMouseUp = () => {
      setDraggingAgent(null);
      setTempNodeId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingAgent, tempNodeId, screenToFlowPosition, setNodes]);

  // Create custom agent
  const handleCreateAgent = async () => {
    if (!newAgent.name.trim()) {
      toast({
        title: 'Name required',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const agentData = {
        name: newAgent.name.trim(),
        description: (newAgent.description || '').trim(),
        type: 'custom_agent',
        system: newAgent.system,
        model: newAgent.model,
        systemPrompt: (newAgent.systemPrompt || '').trim(),
        icon: 'MdSmartToy',
        color: newAgent.system === 'data' ? 'blue' : 'purple',
        isBuiltin: false,
      };

      if (editingAgent) {
        // Update existing agent via API
        const response = await horizonAgentApi.update(editingAgent.id, agentData);
        
        if (response.success) {
          const updatedAgent = response.data;

          // Update local state
          if (newAgent.system === 'data') {
            setAvailableAgents(availableAgents.map(a =>
              a.id === editingAgent.id ? updatedAgent : a
            ));
          } else if (newAgent.system === 'analyzer') {
            setAnalyzerAgents(analyzerAgents.map(a =>
              a.id === editingAgent.id ? updatedAgent : a
            ));
          }
          setCustomAgents(customAgents.map(a =>
            a.id === editingAgent.id ? updatedAgent : a
          ));

          toast({
            title: 'Agent updated',
            description: `${updatedAgent.name} has been updated`,
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      } else {
        // Create new agent via API
        const response = await horizonAgentApi.create(currentHorizonId, agentData);

        if (response.success) {
          const createdAgent = response.data;

          // Update local state
          if (newAgent.system === 'data') {
            setAvailableAgents([...availableAgents, createdAgent]);
          } else if (newAgent.system === 'analyzer') {
            setAnalyzerAgents([...analyzerAgents, createdAgent]);
          }

          setCustomAgents([...customAgents, createdAgent]);

          toast({
            title: 'Agent created',
            description: `${createdAgent.name} added`,
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      }

      // Reset form
      setNewAgent({
        name: '',
        description: '',
        category: 'data_retriever',
        system: 'data',
        model: 'gpt-4',
        systemPrompt: '',
      });
      setEditingAgent(null);
      onAgentClose();
    } catch (error) {
      console.error('[Agent] Save error:', error);
      toast({
        title: 'Failed to save agent',
        description: error.raw?.details || error.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };


  const handleDeletePortfolio = async (portfolioId) => {
    try {
      await portfolioApi.delete(portfolioId);
      
      // Remove from local state (use 'id' not '_id' since backend returns 'id')
      setPortfolios(portfolios.filter(p => p.id !== portfolioId));
      
      // Remove any nodes using this portfolio
      setNodes((nds) => nds.filter(node => {
        if (node.type === 'dataSource' && node.data?.portfolioId === portfolioId) {
          return false;
        }
        return true;
      }));

      toast({
        title: 'Portfolio deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('[Portfolio] Delete error:', error);
      toast({
        title: 'Failed to delete portfolio',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      await horizonAgentApi.delete(agentId);

      // Remove from local state (use 'id' not '_id')
      setAvailableAgents(availableAgents.filter(a => a.id !== agentId));
      setAnalyzerAgents(analyzerAgents.filter(a => a.id !== agentId));

      // Remove any nodes using this agent
      setNodes((nds) => nds.filter(node => {
        if (node.type === 'agentNode' && node.data?.agent?.id === agentId) {
          return false;
        }
        return true;
      }));

      toast({
        title: 'Agent deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('[Agent] Delete error:', error);
      toast({
        title: 'Failed to delete agent',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };



  const handleStartEditingName = () => {
    setTempHorizonName(currentHorizonName || 'Untitled');
    onRenameOpen();
  };

  const handleSaveNodeConfig = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            selected: false,
            data: {
              ...node.data,
              config: nodeConfig,
              agent: { ...node.data.agent, systemPrompt: nodeConfig.systemPrompt },
            },
          };
        }
        return { ...node, selected: false };
      })
    );

    setSelectedNode(null);

    toast({
      title: 'Configuration saved',
      description: 'Node configuration updated successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSaveHorizonName = async () => {
    const newName = tempHorizonName.trim();
    if (!newName) {
      toast({
        title: 'Name required',
        description: 'Horizon name cannot be empty',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await request.put(`/horizons/${id}`, {
        name: newName,
      });

      if (result.success && result.data) {
        setCurrentHorizonName(newName);
        
        toast({
          title: 'Horizon renamed',
          description: `Renamed to "${newName}"`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });

        onRenameClose();
      }
    } catch (error) {
      console.error('Failed to rename horizon:', error);
      toast({
        title: 'Failed to rename horizon',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Process horizon data when it changes
  useEffect(() => {
    if (horizonData) {
      console.log('[PipelineDetail] Loaded horizon:', horizonData);
      console.log('[PipelineDetail] Horizon ID:', horizonData.id, 'URL ID:', id);
      
      // Add horizonId and refetch to all nodes for useRunAgent
      const nodesWithHorizonId = (horizonData.nodes || []).map(node => ({
        ...node,
        data: {
          ...node.data,
          horizonId: horizonData.id,
          onDelete: handleNodeDelete,
          refetchHorizon: refetchHorizon,
        }
      }));
      
      setNodes(nodesWithHorizonId);
      setEdges(horizonData.edges || []);
      
      // System 1: Data Agents - Merge builtin with custom
      const loadedDataAgents = horizonData.dataAgents || horizonData.availableAgents || [];
      const customDataAgents = loadedDataAgents.filter(a => !a.isBuiltin);
      const mergedDataAgents = [...BUILTIN_AGENTS, ...customDataAgents];
      setAvailableAgents(mergedDataAgents);

      // System 2: Analyzer Agents - Merge builtin with custom
      const loadedAnalyzerAgents = horizonData.analyzerAgents || [];
      const customAnalyzerAgents = loadedAnalyzerAgents.filter(a => !a.isBuiltin);
      const mergedAnalyzerAgents = [...DEFAULT_ANALYZERS, ...customAnalyzerAgents];
      setAnalyzerAgents(mergedAnalyzerAgents);
      
      setCustomAgents(horizonData.customAgents || []);
      setCurrentHorizonName(horizonData.name);
      setCurrentHorizonId(horizonData.id);
      setPortfolios(horizonData.portfolios || []);
    }
  }, [horizonData, id]);

  // Show loading state
  if (isLoading) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <VStack spacing="20px">
          <Icon as={MdHub} boxSize="64px" color="teal.500" />
          <Text fontSize="xl" fontWeight="600" color="gray.700">Loading horizon...</Text>
        </VStack>
      </Box>
    );
  }

  // Canvas View - Working on a horizon
  return (
    <Box h="100vh" position="relative" bg="gray.50">
      {/* Floating Sidebar Sections */}
      <VStack
        position="absolute"
        left="20px"
        top="20px"
        spacing="12px"
        zIndex="10"
        align="start"
      >
        {/* 1. Horizon Name - Adaptive Rectangle */}
        <HStack
          bg="whiteAlpha.900"
          backdropFilter="blur(10px)"
          borderRadius="12px"
          px="12px"
          py="8px"
          spacing="8px"
          border="1px solid"
          borderColor="whiteAlpha.400"
          boxShadow="md"
          cursor="pointer"
          onClick={handleStartEditingName}
          _hover={{ borderColor: 'teal.400', boxShadow: 'lg' }}
          transition="all 0.2s"
        >
          <Icon as={MdHub} color="teal.600" boxSize="20px" />
          <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>
            {currentHorizonName || 'Untitled'}
          </Text>
          <Icon as={MdEdit} color="gray.500" boxSize="14px" />
        </HStack>

        {/* 2. Portfolio - with Dropdown */}
        <Box
          position="relative"
          onMouseEnter={() => setShowPortfolio(true)}
          onMouseLeave={() => setShowPortfolio(false)}
        >
          <HStack
            bg="whiteAlpha.900"
            backdropFilter="blur(10px)"
            borderRadius="12px"
            px="12px"
            py="8px"
            spacing="8px"
            border="1px solid"
            borderColor="whiteAlpha.400"
            boxShadow="md"
            cursor="pointer"
            _hover={{ borderColor: 'green.400', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            <Tooltip label="Portfolio" placement="right" hasArrow>
              <Icon as={MdShowChart} color="green.600" boxSize="24px" />
            </Tooltip>
            <Tooltip label="Add portfolio" placement="right" hasArrow>
              <IconButton
                icon={<Icon as={MdAdd} />}
                size="xs"
                variant="ghost"
                colorScheme="green"
                aria-label="Add portfolio"
                onClick={(e) => {
                  e.stopPropagation();
                  onPortfolioOpen();
                }}
              />
            </Tooltip>
          </HStack>

          {/* Portfolio Dropdown - Positioned to the right */}
          {showPortfolio && (
            <Box
              position="absolute"
              top="0"
              left="100%"
              pl="8px"
            >
              <VStack
                bg="whiteAlpha.900"
                backdropFilter="blur(10px)"
                borderRadius="12px"
                border="1px solid"
                borderColor="whiteAlpha.400"
                boxShadow="lg"
                p="8px"
                spacing="8px"
                minW="250px"
                maxH="400px"
                overflowY="auto"
              >
                {portfolios.length === 0 ? (
                  <Text fontSize="xs" color="gray.600" py="8px">
                    No portfolios yet. Click + to create one.
                  </Text>
                ) : (
                  portfolios.map((portfolio) => (
                  <HStack
                    key={portfolio.id}
                    p="10px"
                    bg="white"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{ bg: 'green.50', borderColor: 'green.400', boxShadow: 'sm' }}
                    w="full"
                    spacing="8px"
                  >
                    <Box
                      flex="1"
                      cursor="grab"
                      _active={{ cursor: 'grabbing' }}
                      onMouseDown={(e) => {
                        // Drag portfolio as a data source node
                        handlePortfolioMouseDown(e, portfolio);
                      }}
                    >
                      <VStack align="start" spacing="4px">
                        <HStack spacing="8px" w="full" justify="space-between">
                          <Text fontSize="sm" fontWeight="600">
                            {portfolio.name}
                          </Text>
                          <Badge colorScheme="green" fontSize="xs">
                            {portfolio.stocks.length}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.600" noOfLines={1}>
                          {portfolio.stocks.join(', ') || 'Empty'}
                        </Text>
                      </VStack>
                    </Box>
                    
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<Icon as={MdMoreVert} />}
                        size="sm"
                        variant="ghost"
                        aria-label="Portfolio options"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList>
                        <MenuItem
                          icon={<Icon as={MdEdit} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPortfolio(portfolio);
                            setSelectedStocks([...portfolio.stocks]);
                            onPortfolioOpen();
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<Icon as={MdDelete} />}
                          color="red.600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete portfolio "${portfolio.name}"?`)) {
                              handleDeletePortfolio(portfolio.id);
                            }
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                  ))
                )}
              </VStack>
            </Box>
          )}
        </Box>

        {/* 3. Data Agents - with Dropdown */}
        <Box
          position="relative"
          onMouseEnter={() => setShowDataAgents(true)}
          onMouseLeave={() => setShowDataAgents(false)}
        >
          <HStack
            bg="whiteAlpha.900"
            backdropFilter="blur(10px)"
            borderRadius="12px"
            px="12px"
            py="8px"
            spacing="8px"
            border="1px solid"
            borderColor="whiteAlpha.400"
            boxShadow="md"
            cursor="pointer"
            _hover={{ borderColor: 'blue.400', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            <Tooltip label="Data Agents" placement="right" hasArrow>
              <Icon as={MdSmartToy} color="blue.600" boxSize="24px" />
            </Tooltip>
            <Tooltip label="Add data agent" placement="right" hasArrow>
              <IconButton
                icon={<Icon as={MdAdd} />}
                size="xs"
                variant="ghost"
                colorScheme="blue"
                aria-label="Add data agent"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewAgent({ name: '', description: '', system: 'data', model: 'gpt-4', systemPrompt: '' });
                  onAgentOpen();
                }}
              />
            </Tooltip>
          </HStack>

          {/* Data Agents Dropdown - Positioned to the right */}
          {showDataAgents && (
            <Box
              position="absolute"
              top="0"
              left="100%"
              pl="8px"
            >
              <VStack
                bg="whiteAlpha.900"
                backdropFilter="blur(10px)"
                borderRadius="12px"
                border="1px solid"
                borderColor="whiteAlpha.400"
                boxShadow="lg"
                p="8px"
                spacing="6px"
                minW="200px"
                maxH="400px"
                overflowY="auto"
              >
              {availableAgents.map((agent) => (
                <HStack
                  key={agent.id}
                  p="10px"
                  bg="white"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{ bg: 'blue.50', borderColor: 'blue.400', boxShadow: 'sm' }}
                  w="full"
                  spacing="8px"
                >
                  <HStack
                    flex="1"
                    spacing="10px"
                    cursor="grab"
                    _active={{ cursor: 'grabbing' }}
                    onMouseDown={(e) => handleAgentMouseDown(e, agent)}
                  >
                    <RobotHead description={agent.description || agent.name} size={24} />
                    <Text fontSize="sm" fontWeight="600" flex="1">
                      {agent.name}
                    </Text>
                    {agent.isBuiltin && (
                      <Badge colorScheme="blue" fontSize="xs">
                        Built-in
                      </Badge>
                    )}
                  </HStack>
                  
                  {!agent.isBuiltin && (
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<Icon as={MdMoreVert} />}
                        size="sm"
                        variant="ghost"
                        aria-label="Agent options"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList>
                        <MenuItem
                          icon={<Icon as={MdEdit} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAgent(agent);
                            setNewAgent({
                              name: agent.name,
                              description: agent.description,
                              category: agent.category,
                              system: agent.system,
                              model: agent.model,
                              systemPrompt: agent.systemPrompt || '',
                            });
                            onAgentOpen();
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<Icon as={MdDelete} />}
                          color="red.600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete agent "${agent.name}"?`)) {
                              handleDeleteAgent(agent.id);
                            }
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </HStack>
              ))}
              </VStack>
            </Box>
          )}
        </Box>

        {/* 4. System 2: Analyzer Agents - with Dropdown */}
        <Box
          position="relative"
          onMouseEnter={() => setShowAnalyzers(true)}
          onMouseLeave={() => setShowAnalyzers(false)}
        >
          <HStack
            bg="whiteAlpha.900"
            backdropFilter="blur(10px)"
            borderRadius="12px"
            px="12px"
            py="8px"
            spacing="8px"
            border="1px solid"
            borderColor="whiteAlpha.400"
            boxShadow="md"
            cursor="pointer"
            _hover={{ borderColor: 'purple.400', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            <Tooltip label="Analyzer Agents (System 2)" placement="right" hasArrow>
              <Icon as={MdSmartToy} color="purple.600" boxSize="24px" />
            </Tooltip>
            <Tooltip label="Create custom analyzer" placement="right" hasArrow>
              <IconButton
                icon={<Icon as={MdAdd} />}
                size="xs"
                variant="ghost"
                colorScheme="purple"
                aria-label="Create analyzer"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewAgent({
                    name: '',
                    description: '',
                    category: 'custom_analyzer',
                    system: 'analyzer',
                    model: 'gpt-4',
                    systemPrompt: '',
                  });
                  onAgentOpen();
                }}
              />
            </Tooltip>
          </HStack>

          {/* Analyzers Dropdown - Positioned to the right */}
          {showAnalyzers && (
            <Box
              position="absolute"
              top="0"
              left="100%"
              pl="8px"
            >
              <VStack
                bg="whiteAlpha.900"
                backdropFilter="blur(10px)"
                borderRadius="12px"
                border="1px solid"
                borderColor="whiteAlpha.400"
                boxShadow="lg"
                p="8px"
                spacing="8px"
                minW="250px"
                maxH="400px"
                overflowY="auto"
              >
                {analyzerAgents.map((agent) => (
                  <HStack
                    key={agent.id}
                    p="10px"
                    bg="white"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{ bg: 'purple.50', borderColor: 'purple.400', boxShadow: 'sm' }}
                    spacing="8px"
                    w="full"
                  >
                    <HStack
                      flex="1"
                      spacing="10px"
                      cursor="grab"
                      _active={{ cursor: 'grabbing' }}
                      onMouseDown={(e) => handleAgentMouseDown(e, agent)}
                    >
                      <RobotHead description={agent.description || agent.name} size={24} />
                      <VStack align="start" spacing="2px" flex="1">
                        <Text fontSize="sm" fontWeight="600">
                          {agent.name}
                        </Text>
                        {agent.description && (
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {agent.description}
                          </Text>
                        )}
                      </VStack>
                      {agent.isBuiltin && (
                        <Badge colorScheme="purple" fontSize="xs">
                          Default
                        </Badge>
                      )}
                    </HStack>

                    {!agent.isBuiltin && (
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<Icon as={MdMoreVert} />}
                          size="sm"
                          variant="ghost"
                          aria-label="Agent options"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <MenuList>
                          <MenuItem
                            icon={<Icon as={MdEdit} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAgent(agent);
                              setNewAgent({
                                name: agent.name,
                                description: agent.description,
                                category: agent.category,
                                system: agent.system,
                                model: agent.model,
                                systemPrompt: agent.systemPrompt || '',
                              });
                              onAgentOpen();
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<Icon as={MdDelete} />}
                            color="red.600"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete agent "${agent.name}"?`)) {
                                handleDeleteAgent(agent.id);
                              }
                            }}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      </VStack>

      {/* Main Canvas */}
      <Box h="100%" position="relative" transition="all 0.3s">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          minZoom={0.1}
          maxZoom={2}
          panOnDrag={true}
          selectionKeyCode="Shift"
          multiSelectionKeyCode="Shift"
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={16} size={1} />

          <Panel position="top-right">
            <Tooltip label="Back to Horizons" placement="left" hasArrow>
              <IconButton
                icon={<Icon as={MdHome} />}
                size="md"
                colorScheme="teal"
                variant="solid"
                aria-label="Back to horizons"
                onClick={() => navigate('/pipeline')}
                boxShadow="lg"
              />
            </Tooltip>
          </Panel>
        </ReactFlow>
      </Box>

      {/* Floating Agent Configuration Panel */}
      {selectedNode && selectedNode.type === 'agentNode' && (
        <>
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="blackAlpha.400"
          zIndex="19"
          onClick={() => {
            setSelectedNode(null);
            setNodes((nds) =>
              nds.map((n) => ({ ...n, selected: false }))
            );
          }}
        />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="500px"
          maxH="80vh"
          bg="white"
          borderRadius="20px"
          overflowY="auto"
          zIndex="20"
          boxShadow="2xl"
        >
          <VStack spacing="0" align="stretch" h="full">
            {/* Header */}
            <Box
              p="20px"
              borderBottom="2px solid"
              borderColor="gray.200"
              bg="teal.50"
              borderTopRadius="20px"
            >
              <HStack justify="space-between">
                <HStack spacing="10px" flex="1">
                  <Icon as={MdSmartToy} color="teal.600" boxSize="24px" />
                  <Input
                    value={nodeConfig.name}
                    onChange={(e) =>
                      setNodeConfig({ ...nodeConfig, name: e.target.value })
                    }
                    placeholder="Node Configuration"
                    fontSize="lg"
                    fontWeight="bold"
                    color="teal.900"
                    variant="unstyled"
                    _placeholder={{ color: 'teal.400' }}
                  />
                </HStack>
                <IconButton
                  icon={<Icon as={MdClose} />}
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  aria-label="Close panel"
                  onClick={() => {
                    setSelectedNode(null);
                    setNodes((nds) =>
                      nds.map((n) => ({ ...n, selected: false }))
                    );
                  }}
                />
              </HStack>
            </Box>

            {/* Configuration Form */}
            <Box flex="1" p="20px">
              <VStack spacing="20px" align="stretch">
                {/* Description */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Description
                  </FormLabel>
                  <Textarea
                    placeholder="What does this agent do?"
                    value={nodeConfig.description}
                    onChange={(e) =>
                      setNodeConfig({
                        ...nodeConfig,
                        description: e.target.value,
                      })
                    }
                    size="sm"
                    rows={3}
                  />
                </FormControl>

                {/* Temperature */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Temperature: {nodeConfig.temperature}
                  </FormLabel>
                  <HStack spacing="10px">
                    <Input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={nodeConfig.temperature}
                      onChange={(e) =>
                        setNodeConfig({
                          ...nodeConfig,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                    />
                    <Text fontSize="xs" color="gray.600" minW="40px">
                      {nodeConfig.temperature}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt="4px">
                    Controls randomness. Lower = more focused, Higher = more creative
                  </Text>
                </FormControl>

                {/* Max Tokens */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Max Tokens
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={nodeConfig.maxTokens}
                    onChange={(e) =>
                      setNodeConfig({
                        ...nodeConfig,
                        maxTokens: parseInt(e.target.value) || 2000,
                      })
                    }
                    size="sm"
                    min="100"
                    max="8000"
                    step="100"
                  />
                  <Text fontSize="xs" color="gray.500" mt="4px">
                    Maximum length of the response (100-8000)
                  </Text>
                </FormControl>

                {/* System Prompt - only for custom (non-builtin) agents */}
                {selectedNode?.data?.agent && !selectedNode.data.agent.isBuiltin && (
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">
                      System Prompt
                    </FormLabel>
                    <Textarea
                      value={nodeConfig.systemPrompt}
                      onChange={(e) =>
                        setNodeConfig({ ...nodeConfig, systemPrompt: e.target.value })
                      }
                      rows={6}
                      fontSize="sm"
                      placeholder="Define the agent's behavior..."
                    />
                    <Text fontSize="xs" color="gray.500" mt="4px">
                      The core instruction that defines this agent's behavior
                    </Text>
                  </FormControl>
                )}
              </VStack>
            </Box>

            {/* Footer with Save Button */}
            <Box
              p="20px"
              borderTop="2px solid"
              borderColor="gray.200"
              bg="gray.50"
              borderBottomRadius="20px"
            >
              <Button
                leftIcon={<Icon as={MdSave} />}
                colorScheme="teal"
                size="md"
                w="full"
                onClick={handleSaveNodeConfig}
                fontWeight="600"
              >
                Save Configuration
              </Button>
            </Box>
          </VStack>
        </Box>
        </>
      )}

      {/* Floating Portfolio Configuration Panel */}
      {selectedNode && selectedNode.type === 'portfolioNode' && (
        <>
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="blackAlpha.400"
          zIndex="19"
          onClick={() => {
            setSelectedNode(null);
            setNodes((nds) =>
              nds.map((n) => ({ ...n, selected: false }))
            );
          }}
        />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="500px"
          maxH="80vh"
          bg="white"
          borderRadius="20px"
          overflowY="auto"
          zIndex="20"
          boxShadow="2xl"
        >
          <VStack spacing="0" align="stretch" h="full">
            {/* Header */}
            <Box
              p="20px"
              borderBottom="2px solid"
              borderColor="gray.200"
              bg="green.50"
              borderTopRadius="20px"
            >
              <HStack justify="space-between">
                <HStack spacing="10px" flex="1">
                  <Icon as={MdShowChart} color="green.600" boxSize="24px" />
                  <Input
                    value={portfolioConfig.name}
                    onChange={(e) =>
                      setPortfolioConfig({ ...portfolioConfig, name: e.target.value })
                    }
                    placeholder="Portfolio Configuration"
                    fontSize="lg"
                    fontWeight="bold"
                    color="green.900"
                    variant="unstyled"
                    _placeholder={{ color: 'green.400' }}
                  />
                </HStack>
                <IconButton
                  icon={<Icon as={MdClose} />}
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  aria-label="Close panel"
                  onClick={() => {
                    setSelectedNode(null);
                    setNodes((nds) =>
                      nds.map((n) => ({ ...n, selected: false }))
                    );
                  }}
                />
              </HStack>
            </Box>

            {/* Configuration Form */}
            <Box flex="1" p="20px">
              <VStack spacing="20px" align="stretch">
                {/* Description */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Description
                  </FormLabel>
                  <Textarea
                    placeholder="Describe this portfolio..."
                    value={portfolioConfig.description}
                    onChange={(e) =>
                      setPortfolioConfig({
                        ...portfolioConfig,
                        description: e.target.value,
                      })
                    }
                    size="sm"
                    rows={3}
                  />
                </FormControl>

                <Divider />

                {/* Stocks Management */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Search Stocks / Assets
                  </FormLabel>
                  <Input
                    placeholder="Search by ticker or name (e.g., AAPL, Apple)..."
                    value={portfolioSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPortfolioSearch(value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && portfolioSearch.trim()) {
                        const ticker = portfolioSearch.trim().toUpperCase();
                        if (!selectedStocks.includes(ticker)) {
                          setSelectedStocks([...selectedStocks, ticker]);
                          setPortfolioSearch('');
                        }
                      }
                    }}
                    size="sm"
                  />
                </FormControl>

                {/* Suggestions - Badge style like Selected Stocks */}
                <VStack spacing="8px" align="stretch">
                  <Text fontSize="xs" fontWeight="600" color="gray.500">
                    {portfolioSearch.length > 0 ? 'Search Results' : 'Popular Stocks'}
                  </Text>
                  <Box
                    maxH="150px"
                    overflowY="auto"
                  >
                    <Box display="flex" flexWrap="wrap" gap="4px" rowGap="4px">
                      {(portfolioSearch.length > 0 
                        ? searchSecurities(portfolioSearch) 
                        : SECURITIES.slice(0, 20)
                      ).map((security) => (
                        <Box
                          key={security.symbol}
                          px="10px"
                          py="6px"
                          bg="white"
                          border="1px solid"
                          borderColor="gray.300"
                          borderRadius="6px"
                          fontSize="xs"
                          fontWeight="600"
                          cursor="pointer"
                          _hover={{ 
                            bg: 'green.50', 
                            borderColor: 'green.400',
                            transform: 'translateY(-1px)',
                            boxShadow: 'sm'
                          }}
                          transition="all 0.2s"
                          onClick={() => {
                            if (!selectedStocks.includes(security.symbol)) {
                              setSelectedStocks([...selectedStocks, security.symbol]);
                            }
                            setPortfolioSearch('');
                          }}
                        >
                          {security.symbol}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </VStack>

                {/* Selected Stocks */}
                {selectedStocks.length > 0 && (
                  <VStack spacing="8px" align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="xs" fontWeight="600" color="gray.500">
                        Selected Stocks ({selectedStocks.length})
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setSelectedStocks([])}
                      >
                        Clear All
                      </Button>
                    </HStack>
                    <HStack spacing="6px" flexWrap="wrap">
                      {selectedStocks.map((stock) => (
                        <Badge
                          key={stock}
                          colorScheme="green"
                          fontSize="xs"
                          px="10px"
                          py="8px"
                          borderRadius="4px"
                          cursor="pointer"
                          onClick={() => setSelectedStocks(selectedStocks.filter(s => s !== stock))}
                        >
                          {stock} ×
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </Box>

            {/* Footer with Save Button */}
            <Box
              p="20px"
              borderTop="2px solid"
              borderColor="gray.200"
              bg="gray.50"
              borderBottomRadius="20px"
            >
              <Button
                leftIcon={<Icon as={MdSave} />}
                colorScheme="green"
                size="md"
                w="full"
                isDisabled={!portfolioConfig.name.trim() || selectedStocks.length === 0}
                onClick={async () => {
                  try {
                    const portfolioData = {
                      name: portfolioConfig.name.trim(),
                      description: portfolioConfig.description.trim(),
                      stocks: [...selectedStocks],
                    };

                    // Check if portfolio exists in DB (has valid MongoDB ID)
                    const existingPortfolio = selectedNode.data.portfolio;
                    let savedPortfolio;

                    if (existingPortfolio && existingPortfolio.id && String(existingPortfolio.id).match(/^[0-9a-fA-F]{24}$/)) {
                      // Update existing portfolio in DB
                      const response = await portfolioApi.update(existingPortfolio.id, portfolioData);
                      if (response.success) {
                        savedPortfolio = response.data;
                        
                        // Update portfolios list
                        setPortfolios(portfolios.map(p => 
                          p.id === existingPortfolio.id ? savedPortfolio : p
                        ));
                      }
                    } else {
                      // Create new portfolio in DB
                      const response = await portfolioApi.create(currentHorizonId, portfolioData);
                      if (response.success) {
                        savedPortfolio = response.data;
                        
                        // Add to portfolios list
                        setPortfolios([...portfolios, savedPortfolio]);
                      }
                    }

                    // Update node with saved portfolio data
                    setNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === selectedNode.id) {
                          return {
                            ...node,
                            data: {
                              ...node.data,
                              portfolio: savedPortfolio,
                            },
                          };
                        }
                        return node;
                      })
                    );

                    toast({
                      title: 'Portfolio configuration saved',
                      description: `${portfolioData.name} with ${selectedStocks.length} stocks`,
                      status: 'success',
                      duration: 2000,
                      isClosable: true,
                    });

                    setSelectedNode(null);
                    setNodes((nds) =>
                      nds.map((n) => ({ ...n, selected: false }))
                    );
                  } catch (error) {
                    console.error('[Portfolio] Save configuration error:', error);
                    toast({
                      title: 'Failed to save portfolio',
                      description: error.message || 'An error occurred',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
                fontWeight="600"
              >
                Save Configuration
              </Button>
            </Box>
          </VStack>
        </Box>
        </>
      )}

      {/* Create/Edit Agent Modal */}
      <Modal isOpen={isAgentOpen} onClose={() => {
        onAgentClose();
        setEditingAgent(null);
        setNewAgent({
          name: '',
          description: '',
          category: 'data_retriever',
          system: 'data',
          model: 'gpt-4',
          systemPrompt: '',
        });
      }} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="20px">
          <ModalCloseButton />
          <ModalHeader>{editingAgent ? 'Edit Agent' : 'Create Custom Agent'}</ModalHeader>

          <ModalBody pb="20px">
            <VStack spacing="20px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Agent Name
                </FormLabel>
                <Input
                  placeholder="e.g., Crypto Price Fetcher"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  Description
                </FormLabel>
                <Textarea
                  placeholder="What does this agent do?"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  System Prompt
                </FormLabel>
                <Textarea
                  placeholder="Define the agent's behavior and instructions..."
                  value={newAgent.systemPrompt}
                  onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                  rows={4}
                  fontSize="sm"
                />
              </FormControl>

              <Button colorScheme="teal" onClick={handleCreateAgent} size="lg" w="full">
                {editingAgent ? 'Update Agent' : 'Create Agent'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Rename Horizon Modal */}
      <Modal isOpen={isRenameOpen} onClose={onRenameClose} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px">
          <ModalCloseButton />
          <ModalHeader>Rename Horizon</ModalHeader>
          <ModalBody pb="20px">
            <VStack spacing="15px">
              <Input
                value={tempHorizonName}
                onChange={(e) => setTempHorizonName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveHorizonName();
                }}
                placeholder="Horizon name"
                autoFocus
                onFocus={(e) => e.target.select()}
              />
              <Button colorScheme="teal" onClick={handleSaveHorizonName} w="full">
                Save
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Build Portfolio Modal */}
      <Modal isOpen={isPortfolioOpen} onClose={() => {
        onPortfolioClose();
        setEditingPortfolio(null);
        setSelectedStocks([]);
        setPortfolioSearch('');
        setSearchSuggestions([]);
        setPortfolioConfig({ name: '', description: '' });
      }} isCentered size="md">
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent borderRadius="20px">
          <ModalCloseButton />
          <ModalHeader>{editingPortfolio ? 'Edit Portfolio' : 'Build Portfolio'}</ModalHeader>
          <ModalBody pb="20px">
            <VStack spacing="20px" align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  Portfolio Name
                </FormLabel>
                <Input
                  placeholder="Enter portfolio name..."
                  value={portfolioConfig.name}
                  onChange={(e) => setPortfolioConfig({ ...portfolioConfig, name: e.target.value })}
                  size="md"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  Description (Optional)
                </FormLabel>
                <Textarea
                  placeholder="Describe this portfolio..."
                  value={portfolioConfig.description}
                  onChange={(e) => setPortfolioConfig({ ...portfolioConfig, description: e.target.value })}
                  size="md"
                  rows={2}
                />
              </FormControl>

              <Divider />

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  Search Stocks / Assets
                </FormLabel>
                <Box position="relative">
                  <Input
                    placeholder="Search by ticker or name (e.g., AAPL, Apple)..."
                    value={portfolioSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPortfolioSearch(value);
                      if (value.length > 0) {
                        setSearchSuggestions(searchSecurities(value));
                      } else {
                        setSearchSuggestions([]);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && portfolioSearch.trim()) {
                        const ticker = portfolioSearch.trim().toUpperCase();
                        if (!selectedStocks.includes(ticker)) {
                          setSelectedStocks([...selectedStocks, ticker]);
                          setPortfolioSearch('');
                          setSearchSuggestions([]);
                        }
                      }
                      if (e.key === 'Escape') {
                        setSearchSuggestions([]);
                      }
                    }}
                    autoFocus
                    size="lg"
                  />

                  {/* Autocomplete Suggestions Dropdown */}
                  {searchSuggestions.length > 0 && (
                    <VStack
                      position="absolute"
                      top="100%"
                      left="0"
                      right="0"
                      mt="4px"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="8px"
                      boxShadow="lg"
                      maxH="300px"
                      overflowY="auto"
                      zIndex="1000"
                      spacing="0"
                      align="stretch"
                    >
                      {searchSuggestions.map((security) => (
                        <Box
                          key={security.symbol}
                          p="12px"
                          cursor="pointer"
                          _hover={{ bg: 'green.50' }}
                          borderBottom="1px solid"
                          borderColor="gray.100"
                          onClick={() => {
                            if (!selectedStocks.includes(security.symbol)) {
                              setSelectedStocks([...selectedStocks, security.symbol]);
                            }
                            setPortfolioSearch('');
                            setSearchSuggestions([]);
                          }}
                        >
                          <HStack justify="space-between">
                            <VStack align="start" spacing="2px">
                              <HStack spacing="8px">
                                <Text fontSize="sm" fontWeight="700" color="gray.800">
                                  {security.symbol}
                                </Text>
                                <Badge colorScheme="green" fontSize="xs">
                                  {security.type}
                                </Badge>
                              </HStack>
                              <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                {security.name}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>
              </FormControl>

              {selectedStocks.length > 0 && (
                <VStack spacing="8px" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="600" color="gray.500">
                      Selected Stocks ({selectedStocks.length})
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setSelectedStocks([])}
                    >
                      Clear All
                    </Button>
                  </HStack>
                  <HStack spacing="6px" flexWrap="wrap">
                    {selectedStocks.map((stock) => (
                      <Badge
                        key={stock}
                        colorScheme="green"
                        fontSize="sm"
                        px="8px"
                        py="4px"
                        borderRadius="6px"
                        cursor="pointer"
                        onClick={() => setSelectedStocks(selectedStocks.filter(s => s !== stock))}
                      >
                        {stock} ×
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              )}

              <Divider />

              <Button
                colorScheme="green"
                size="md"
                w="full"
                isDisabled={selectedStocks.length === 0 || !portfolioConfig.name.trim()}
                onClick={async () => {
                  try {
                    if (editingPortfolio) {
                      // Update existing portfolio via API
                      const response = await portfolioApi.update(editingPortfolio.id, {
                        name: portfolioConfig.name.trim(),
                        description: portfolioConfig.description.trim(),
                        stocks: [...selectedStocks],
                      });

                      if (response.success) {
                        // Update local state
                        const updatedPortfolios = portfolios.map(p =>
                          p.id === editingPortfolio.id ? response.data : p
                        );
                        setPortfolios(updatedPortfolios);

                        // Update node if editing from node
                        if (editingPortfolioNodeId) {
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === editingPortfolioNodeId
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      portfolio: response.data,
                                    },
                                  }
                                : n
                            )
                          );
                          setEditingPortfolioNodeId(null);
                        }

                        toast({
                          title: 'Portfolio Updated',
                          description: `${response.data.name} updated successfully`,
                          status: 'success',
                          duration: 2000,
                          isClosable: true,
                        });
                      }
                    } else {
                      // Create new portfolio via API
                      const response = await portfolioApi.create(currentHorizonId, {
                        name: portfolioConfig.name.trim(),
                        description: portfolioConfig.description.trim(),
                        stocks: [...selectedStocks],
                      });

                      if (response.success) {
                        setPortfolios([...portfolios, response.data]);
                        
                        toast({
                          title: 'Portfolio Created',
                          description: `${response.data.name} with ${selectedStocks.length} stocks`,
                          status: 'success',
                          duration: 2000,
                          isClosable: true,
                        });
                      }
                    }

                    // Reset form
                    setSelectedStocks([]);
                    setPortfolioSearch('');
                    setPortfolioConfig({ name: '', description: '' });
                    setEditingPortfolio(null);
                    onPortfolioClose();
                  } catch (error) {
                    console.error('[Portfolio] Save error:', error);
                    toast({
                      title: 'Failed to save portfolio',
                      description: error.message || 'An error occurred',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              >
                {editingPortfolio ? 'Update Portfolio' : 'Create Portfolio'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Custom Data Agent Needed Modal */}
      <Modal
        isOpen={isDataAgentOpen}
        onClose={() => {}}
        closeOnOverlayClick={false}
        isCentered
        size="lg"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="20px">
          <ModalHeader>
            <HStack spacing="10px">
              <Icon as={MdPsychology} color="orange.500" boxSize="28px" />
              <Text>Custom Data Agent Needed</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack spacing="16px" align="stretch">
              <Text color="gray.700">
                The analysis agent needs data that built-in agents don't provide:
              </Text>

              <Box
                p="16px"
                bg="orange.50"
                borderRadius="12px"
                border="1px solid"
                borderColor="orange.200"
              >
                <HStack mb="8px" spacing="8px">
                  <Badge colorScheme="orange" fontSize="sm">Missing Data</Badge>
                  <Text fontWeight="700" color="gray.800">
                    {dataAgentModal.suggestedAgent?.data_type}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.700">
                  {dataAgentModal.suggestedAgent?.description}
                </Text>
              </Box>

              <Divider />

              <Text fontWeight="600" color="gray.800">Suggested Data Agent:</Text>
              <Box p="14px" bg="purple.50" borderRadius="12px" border="1px solid" borderColor="purple.200">
                <HStack spacing="10px" mb="8px">
                  <Icon as={MdSmartToy} color="purple.600" boxSize="20px" />
                  <Text fontWeight="700" color="purple.800">
                    {dataAgentModal.suggestedAgent?.name}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  A system prompt will be auto-generated to fetch this data type.
                </Text>
              </Box>

              {/* Show thinking steps so far */}
              {dataAgentModal.thinkingSteps?.length > 0 && (
                <>
                  <Divider />
                  <Text fontWeight="600" color="gray.800" fontSize="sm">
                    Thinking Progress ({dataAgentModal.thinkingSteps.length} steps):
                  </Text>
                  <VStack align="stretch" spacing="6px" maxH="150px" overflowY="auto">
                    {dataAgentModal.thinkingSteps.map((step, i) => (
                      <Box key={i} p="8px" bg="gray.50" borderRadius="6px" fontSize="xs">
                        <HStack spacing="4px" mb="4px">
                          <Badge colorScheme="purple" size="sm">Step {step.iteration}</Badge>
                          <Badge
                            colorScheme={step.action === 'call_tool' ? 'blue' : 'orange'}
                            size="sm"
                          >
                            {step.action}
                          </Badge>
                          {step.tool && <Badge colorScheme="teal" size="sm">{step.tool}</Badge>}
                        </HStack>
                        <Text color="gray.600" noOfLines={2}>{step.thought}</Text>
                      </Box>
                    ))}
                  </VStack>
                </>
              )}

              <Text fontSize="xs" color="gray.500" mt="8px">
                After creating this agent, add it to your canvas and re-run the analysis.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing="12px">
              <Button
                variant="ghost"
                onClick={() => {
                  // Cancel - clear paused state
                  if (dataAgentModal.nodeId) {
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === dataAgentModal.nodeId
                          ? { ...n, data: { ...n.data, status: 'cancelled', pauseReason: null } }
                          : n
                      )
                    );
                  }
                  setDataAgentModal({ nodeId: null, suggestedAgent: null, thinkingSteps: [], resumeContext: null });
                  onDataAgentClose();
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                leftIcon={<Icon as={MdAdd} />}
                onClick={() => {
                  // Navigate to agents page or open agent creation with pre-filled data
                  // For now, we'll add the agent to availableAgents directly
                  const suggestedAgent = dataAgentModal.suggestedAgent;
                  if (suggestedAgent) {
                    const newDataAgent = {
                      id: `custom-data-${Date.now()}`,
                      name: suggestedAgent.name,
                      description: suggestedAgent.description,
                      type: 'custom_agent',
                      system: 'data',
                      icon: MdSmartToy,
                      color: 'purple',
                      isBuiltin: false,
                      systemPrompt: suggestedAgent.suggested_system_prompt,
                      enableThinking: false, // Data agents don't need thinking
                    };

                    setAvailableAgents([...availableAgents, newDataAgent]);
                    setCustomAgents([...customAgents, newDataAgent]);

                    toast({
                      title: 'Data Agent Created',
                      description: `${newDataAgent.name} has been added. Drag it to the canvas and connect it to your analysis agent.`,
                      status: 'success',
                      duration: 5000,
                      isClosable: true,
                    });
                  }

                  setDataAgentModal({ nodeId: null, suggestedAgent: null, thinkingSteps: [], resumeContext: null });
                  onDataAgentClose();
                }}
              >
                Create Data Agent
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Right Sidebar for Output Node Data with Candlestick Charts */}
      {selectedOutputNode && (
        <>
          {/* Overlay background */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            bg="blackAlpha.300"
            zIndex="15"
            onClick={() => setSelectedOutputNode(null)}
          />
          
          {/* Sidebar panel */}
          <Box
            position="absolute"
            top="0"
            right="0"
            h="100%"
            w="600px"
            bg="white"
            boxShadow="2xl"
            zIndex="16"
            overflowY="auto"
            transition="all 0.3s"
          >
            {/* Sidebar Header */}
            <Box
              p="20px"
              borderBottom="2px solid"
              borderColor="gray.200"
              bg="teal.50"
              position="sticky"
              top="0"
              zIndex="1"
            >
              <HStack justify="space-between" mb="12px">
                <HStack spacing="10px">
                  {sidebarView === SIDEBAR_VIEW.DETAIL && (
                    <IconButton
                      icon={<Icon as={MdClose} transform="rotate(180deg)" />}
                      size="sm"
                      variant="ghost"
                      colorScheme="teal"
                      aria-label="Back to list"
                      onClick={() => setSidebarView(SIDEBAR_VIEW.LIST)}
                    />
                  )}
                  <Icon as={MdArticle} color="teal.600" boxSize="24px" />
                  <VStack align="start" spacing="0">
                    <Text fontSize="lg" fontWeight="700" color="teal.900">
                      {sidebarView === SIDEBAR_VIEW.LIST ? 'Revision History' : 'Revision Detail'}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {isLoadingRevisions ? (
                        'Loading revisions...'
                      ) : revisions.length > 0 ? (
                        `${revisions.length} run${revisions.length > 1 ? 's' : ''} for ${selectedOutputNode?.data?.agentName}`
                      ) : (
                        selectedOutputNode?.data?.agentName
                      )}
                    </Text>
                  </VStack>
                </HStack>
                <HStack spacing="8px">
                  {/* Add to Workflow button - only show in DETAIL view */}
                  {sidebarView === SIDEBAR_VIEW.DETAIL && revisions[selectedRevisionIndex] && (
                    <Button
                      size="sm"
                      colorScheme="teal"
                      leftIcon={<Icon as={MdAdd} />}
                      onClick={async () => {
                        const currentOutput = revisions[selectedRevisionIndex];
                        const outputNodeId = currentOutput._id;
                        
                        try {
                          await nodeApi.reactivate(outputNodeId);
                          
                          toast({
                            title: 'Added to workflow',
                            description: 'This revision is now active in the pipeline',
                            status: 'success',
                            duration: 3000,
                            isClosable: true,
                          });

                          // Refetch horizon data to update the canvas
                          refetchHorizon();

                          // Close the sidebar
                          setSelectedOutputNode(null);
                        } catch (error) {
                          console.error('[Add to Workflow] Failed:', error);
                          toast({
                            title: 'Failed to add to workflow',
                            description: error.message,
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                      }}
                    >
                      Add to Workflow
                    </Button>
                  )}
                  <IconButton
                    icon={<Icon as={MdClose} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    aria-label="Close sidebar"
                    onClick={() => setSelectedOutputNode(null)}
                  />
                </HStack>
              </HStack>
            </Box>

            {/* Sidebar Content */}
            <Box p="20px">
              {isLoadingRevisions ? (
                <HStack justify="center" p="40px">
                  <Spinner size="md" color="teal.600" />
                  <Text fontSize="sm" color="gray.600">Loading revisions...</Text>
                </HStack>
              ) : sidebarView === SIDEBAR_VIEW.LIST ? (
                /* LIST VIEW - Show all revisions */
                <VStack spacing="10px" align="stretch">
                  <Text fontSize="md" fontWeight="700" color="gray.800" mb="8px">
                    Select a revision to view details:
                  </Text>
                  {revisions.map((output, index) => {
                    const timestamp = output.createdAt || output.data?.timestamp;
                    const symbols = output.data?.metadata?.symbols || output.data?.result?.symbols || [];
                    const period = output.data?.metadata?.period || output.data?.result?.period || 'N/A';
                    const isActive = output.isActive === true;
                    
                    return (
                      <Box
                        key={output._id || output.id}
                        p="16px"
                        bg="white"
                        borderRadius="12px"
                        border="2px solid"
                        borderColor={isActive ? "teal.400" : "gray.200"}
                        transition="all 0.2s"
                        position="relative"
                      >
                        <HStack justify="space-between" mb="8px">
                          <HStack spacing="8px">
                            <Icon as={MdArticle} color="teal.600" boxSize="18px" />
                            <Text fontSize="sm" fontWeight="700" color="gray.800">
                              Run #{revisions.length - index}
                            </Text>
                            {index === 0 && (
                              <Badge colorScheme="purple" fontSize="2xs">
                                Latest
                              </Badge>
                            )}
                            {isActive && (
                              <Badge colorScheme="teal" fontSize="2xs">
                                Active
                              </Badge>
                            )}
                          </HStack>
                          <HStack spacing="6px">
                            <IconButton
                              icon={<Icon as={MdAdd} />}
                              size="xs"
                              colorScheme="teal"
                              variant="solid"
                              aria-label="Add to workflow"
                              isDisabled={isActive}
                              onClick={async (e) => {
                                e.stopPropagation();
                                const outputNodeId = output._id;
                                
                                try {
                                  await nodeApi.reactivate(outputNodeId);
                                  
                                  toast({
                                    title: 'Added to workflow',
                                    description: 'This revision is now active in the pipeline',
                                    status: 'success',
                                    duration: 3000,
                                    isClosable: true,
                                  });

                                  // Refetch horizon data to update the canvas
                                  refetchHorizon();

                                  // Refetch revisions to update active status
                                  const agentNodeId = output.parentId;
                                  const response = await nodeApi.getByAgent(agentNodeId, currentHorizonId);
                                  setRevisions(response.data.outputs || []);
                                } catch (error) {
                                  console.error('[Add to Workflow] Failed:', error);
                                  toast({
                                    title: 'Failed to add to workflow',
                                    description: error.message,
                                    status: 'error',
                                    duration: 3000,
                                    isClosable: true,
                                  });
                                }
                              }}
                              _disabled={{
                                opacity: 0.4,
                                cursor: 'not-allowed',
                                bg: 'gray.300',
                              }}
                            />
                            <Badge colorScheme="green" fontSize="xs">
                              success
                            </Badge>
                          </HStack>
                        </HStack>
                        <VStack 
                          align="start" 
                          spacing="4px"
                          cursor="pointer"
                          onClick={() => {
                            setSelectedRevisionIndex(index);
                            setSidebarView(SIDEBAR_VIEW.DETAIL);
                          }}
                          _hover={{ 
                            opacity: 0.8,
                          }}
                        >
                          <Text fontSize="xs" color="gray.600">
                            📅 {new Date(timestamp).toLocaleString()}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            📊 {Array.isArray(symbols) && symbols.length > 0 ? symbols.join(', ') : 'No symbols'} • {period}
                          </Text>
                        </VStack>
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                /* DETAIL VIEW - Show selected revision detail */
                <VStack spacing="20px" align="stretch">
                  {(() => {
                    // Get the current output node (revision) data to display
                    const currentOutput = revisions[selectedRevisionIndex];
                    const displayResult = currentOutput?.data?.result;
                    
                    return (
                      <>
                        {/* Summary Info */}
                        <Box
                          p="16px"
                          bg="gray.50"
                          borderRadius="12px"
                          border="1px solid"
                          borderColor="gray.200"
                        >
                          <VStack align="start" spacing="8px">
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                Run:
                              </Text>
                              <Text fontSize="sm" color="gray.800" fontWeight="600">
                                #{revisions.length - selectedRevisionIndex}
                              </Text>
                            </HStack>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                Status:
                              </Text>
                              <Badge colorScheme="green" fontSize="sm">
                                {displayResult?.status || 'success'}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                Symbols:
                              </Text>
                              <Text fontSize="sm" color="gray.800">
                                {displayResult?.total_symbols || 0}
                              </Text>
                            </HStack>
                            {currentOutput?.createdAt && (
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm" fontWeight="600" color="gray.700">
                                  Executed:
                                </Text>
                                <Text fontSize="sm" color="gray.800">
                                  {new Date(currentOutput.createdAt).toLocaleString()}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </Box>

                        {/* Render Charts for each symbol */}
                        {(() => {
                          console.log('[Sidebar Render] Full result:', displayResult);
                          console.log('[Sidebar Render] result keys:', displayResult ? Object.keys(displayResult) : 'no result');
                          
                          // Try to find chart data in various possible locations
                          let chartData = displayResult?.chart_data_by_symbol || displayResult?.chart_data;
                          
                          // If chart_data doesn't exist, try to find it in result.data
                          if (!chartData && displayResult?.data) {
                            chartData = displayResult.data.chart_data_by_symbol || displayResult.data.chart_data;
                          }
                          
                          // If still no chart data, try result.result (nested)
                          if (!chartData && displayResult?.result) {
                            chartData = displayResult.result.chart_data_by_symbol || displayResult.result.chart_data;
                          }
                          
                          console.log('[Sidebar Render] Final chartData:', chartData);
                          
                          if (!chartData || Object.keys(chartData).length === 0) {
                            return (
                              <Box
                                p="16px"
                                bg="yellow.50"
                                borderRadius="12px"
                                border="1px solid"
                                borderColor="yellow.200"
                              >
                                <VStack align="start" spacing="8px">
                                  <HStack>
                                    <Icon as={MdWarning} color="yellow.600" />
                                  <Text fontSize="sm" fontWeight="600" color="yellow.800">
                                    No Chart Data Available
                                  </Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.600">
                                  The output doesn't contain chart data. This might be from a non-candlestick agent.
                                </Text>
                                <Text fontSize="xs" color="gray.500" fontFamily="monospace">
                                  Expected: result.chart_data
                                </Text>
                              </VStack>
                            </Box>
                          );
                        }

                        return (
                          <VStack spacing="20px" align="stretch">
                            <Text fontSize="md" fontWeight="700" color="gray.800">
                              Candlestick Charts ({Object.keys(chartData).length} symbols)
                            </Text>
                            {Object.keys(chartData).map((symbol) => {
                              const symbolData = chartData[symbol];
                              console.log(`[Chart Render] ${symbol} data:`, symbolData);
                              
                              // Format data for candlestick chart
                              if (!symbolData?.candles || symbolData.candles.length === 0) {
                                return (
                                  <Box key={symbol} p="16px" bg="gray.50" borderRadius="12px">
                                    <Text fontSize="sm" color="gray.600">
                                      No chart data available for {symbol}
                                    </Text>
                                  </Box>
                                );
                              }

                              const chartSeries = [
                                {
                                  name: symbol,
                                  data: symbolData.candles.map((candle) => ({
                                    x: new Date(candle.date),
                                    y: [candle.open, candle.high, candle.low, candle.close],
                                  })),
                                },
                              ];

                              const chartOptions = {
                                chart: {
                                  type: 'candlestick',
                                  height: 350,
                                  toolbar: {
                                    show: true,
                                  },
                                },
                                title: {
                                  text: `${symbol} - ${symbolData.period || '1mo'}`,
                                  align: 'left',
                                  style: {
                                    color: '#1F2937',
                                  },
                                },
                                xaxis: {
                                  type: 'datetime',
                                  labels: {
                                    style: {
                                      colors: '#6B7280',
                                    },
                                  },
                                },
                                yaxis: {
                                  tooltip: {
                                    enabled: true,
                                  },
                                  labels: {
                                    formatter: (value) => `$${value.toFixed(2)}`,
                                    style: {
                                      colors: '#6B7280',
                                    },
                                  },
                                },
                                plotOptions: {
                                  candlestick: {
                                    colors: {
                                      upward: '#26A69A',
                                      downward: '#EF5350',
                                    },
                                  },
                                },
                                tooltip: {
                                  theme: 'dark',
                                },
                                grid: {
                                  borderColor: '#E5E7EB',
                                },
                              };

                              return (
                                <Box
                                  key={symbol}
                                  p="16px"
                                  bg="white"
                                  borderRadius="12px"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  boxShadow="sm"
                                >
                                  <Chart
                                    options={chartOptions}
                                    series={chartSeries}
                                    type="candlestick"
                                    height={300}
                                  />
                                </Box>
                              );
                            })}
                          </VStack>
                        );
                      })()}

                      {/* Raw JSON Data - Only show chart_data_by_symbol */}
                      <Box>
                        <Text fontSize="md" fontWeight="700" color="gray.800" mb="12px">
                          Raw Output Data
                        </Text>
                        <Box
                          p="16px"
                          bg="gray.50"
                          borderRadius="12px"
                          border="1px solid"
                          borderColor="gray.200"
                          maxH="400px"
                          overflowY="auto"
                          fontSize="xs"
                          fontFamily="monospace"
                        >
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {JSON.stringify(
                              displayResult?.chart_data_by_symbol || 
                              displayResult?.chart_data || 
                              displayResult?.data?.chart_data_by_symbol ||
                              displayResult?.result?.chart_data_by_symbol ||
                              { error: 'No chart data available' },
                              null,
                              2
                            )}
                          </pre>
                        </Box>
                      </Box>
                    </>
                  );
                })()}
              </VStack>
              )}
            </Box>
          </Box>
        </>
      )}

    </Box>
  );
}
// Wrap the component with ReactFlowProvider
export default function PipelineDetail() {
  return (
    <ReactFlowProvider>
      <PipelineBuilderInner />
    </ReactFlowProvider>
  );
}
