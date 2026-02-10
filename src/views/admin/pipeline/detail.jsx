/* eslint-disable */
import {
  Alert,
  AlertDescription,
  AlertIcon,
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
  Progress,
  Select,
  SimpleGrid,
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
import { Component, useCallback, useEffect, useRef, useState } from 'react';
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
  MdRefresh,
  MdSave,
  MdShowChart,
  MdSmartToy,
  MdSpeed,
  MdTrendingUp,
  MdWarning,
  MdAccountTree
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
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import '../../../assets/css/ReactFlowCustom.css';
import { searchSecurities, SECURITIES } from 'data/securities';
import { runAgent, getAgentInputData, generateAgentSystemPrompt } from 'lib/agentApi';
import { request } from 'lib/api';
import portfolioApi from 'lib/portfolioApi';
import horizonAgentApi from 'lib/horizonAgentApi';
import nodeApi from 'lib/nodeApi';
import { CustomAgentNode } from 'components/pipeline/CustomAgentNode';
import { CustomBlockNode } from 'components/pipeline/CustomBlockNode';
import { RobotHead } from 'components/pipeline/RobotHead';
import ConsoleLog from 'components/pipeline/ConsoleLog';
import Chart from 'react-apexcharts';
import StockAnalysisCard from 'views/admin/portfolio/components/StockAnalysisCard';
import { IDshorten } from 'utils';
import { getActivatedDataAgents, getActivatedAnalyzerAgents, getActivatedAgentIds } from 'data/libraryAgents';

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

// Helper to extract data_by_symbol regardless of field name (used across components)
const extractDataBySymbol = (result) => {
  if (!result || typeof result !== 'object') return {};

  // Try known agent-specific fields first
  const knownField = result.chart_data_by_symbol ||
         result.earnings_data_by_symbol ||
         result.news_data_by_symbol ||
         result.technical_data_by_symbol ||
         result.fundamentals_data_by_symbol ||
         result.chart_data ||
         result.data?.chart_data_by_symbol ||
         result.result?.chart_data_by_symbol;

  if (knownField && typeof knownField === 'object') return knownField;

  // For custom agents: look for any field ending in _by_symbol or _data
  const symbolField = Object.keys(result).find(key =>
    key.endsWith('_by_symbol') || key.endsWith('_data')
  );
  if (symbolField && typeof result[symbolField] === 'object') return result[symbolField];

  // If result looks like an AnalysisResponse (has analysis text + status), wrap it
  if (result.analysis && result.status) {
    return { _analysis: result };
  }

  // If no structured field found, return the entire result for custom rendering
  // This handles arbitrary JSON from custom agents
  return result;
};

const initialNodes = [];
const initialEdges = [];

// CustomAgentNode moved to components/pipeline/CustomAgentNode.jsx
// This component now uses useMutation hook for better loading state management

function CustomPortfolioNode({ data, id, selected }) {
  const { hasCopied, onCopy } = useClipboard(id);
  const [showAddOptions, setShowAddOptions] = useState(false);

  return (
    <Box position="relative" className={`custom-portfolio-node${showAddOptions ? ' add-options-open' : ''}`}>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#38A169', width: '12px', height: '12px' }}
      />

      {/* Add child node button — invisible hover zone near right edge */}
      {data.onAddChildNode && (
        <Box className="add-node-zone nopan nodrag" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <IconButton
            className={`add-node-btn${showAddOptions ? ' add-node-btn--open' : ''}`}
            icon={<Icon as={showAddOptions ? MdClose : MdAdd} />}
            size="xs"
            colorScheme="green"
            variant="solid"
            borderRadius="full"
            position="absolute"
            right="6px"
            top="50%"
            transform="translateY(-50%)"
            zIndex="10"
            boxShadow="md"
            aria-label="Add connected node"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setShowAddOptions(!showAddOptions);
            }}
            _hover={{ transform: 'translateY(-50%) scale(1.15)' }}
          />
          {showAddOptions && (
            <VStack
              className="nopan nodrag"
              position="absolute"
              left="100%"
              top="50%"
              transform="translateY(-50%)"
              ml="8px"
              zIndex="10"
              spacing="6px"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Box
                as="button"
                display="flex"
                alignItems="center"
                gap="6px"
                px="12px"
                py="6px"
                bg="blue.50"
                border="2px solid"
                borderColor="blue.300"
                borderRadius="12px"
                cursor="pointer"
                boxShadow="sm"
                _hover={{ bg: 'blue.100', borderColor: 'blue.400', transform: 'translateY(-1px)', boxShadow: 'md' }}
                transition="all 0.2s"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  data.onAddChildNode(id, { name: 'Data Agent', type: 'custom_agent', system: 'data', color: 'blue', description: 'Custom data retrieval agent' });
                  setShowAddOptions(false);
                }}
              >
                <RobotHead description="Custom data retrieval agent" size={18} />
                <Text fontSize="xs" fontWeight="600" color="blue.700" whiteSpace="nowrap">Data Agent</Text>
              </Box>
              <Box
                as="button"
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
                _hover={{ bg: 'purple.100', borderColor: 'purple.400', transform: 'translateY(-1px)', boxShadow: 'md' }}
                transition="all 0.2s"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  data.onAddChildNode(id, { name: 'Analyzer', type: 'custom_agent', system: 'analyzer', color: 'purple', description: 'Analysis agent' });
                  setShowAddOptions(false);
                }}
              >
                <RobotHead description="Analysis agent" size={18} />
                <Text fontSize="xs" fontWeight="600" color="purple.700" whiteSpace="nowrap">Analyzer</Text>
              </Box>
            </VStack>
          )}
        </Box>
      )}

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

function CustomEdge({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [showOutput, setShowOutput] = useState(false);
  const { getNode } = useReactFlow();

  const sourceNode = getNode(source);
  const targetNode = getNode(target);
  const isDataToAnalyzer =
    sourceNode?.data?.agent?.system === 'data' &&
    (targetNode?.data?.agent?.system === 'analyzer' || sourceNode?.data?.agent?.isAutoCreated);

  const hasOutput = !!data?.output;

  const handleInspect = (e) => {
    e.stopPropagation();
    if (isDataToAnalyzer && !hasOutput) return;
    setShowOutput(!showOutput);
  };

  const iconColorScheme = isDataToAnalyzer && !hasOutput ? 'gray' : 'teal';
  const iconOpacity = isDataToAnalyzer && !hasOutput ? 0.3 : 1;
  const iconCursor = isDataToAnalyzer && !hasOutput ? 'default' : 'pointer';

  return (
    <>
      <BaseEdge path={edgePath} />
      {isDataToAnalyzer && (
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
              colorScheme={iconColorScheme}
              variant="solid"
              borderRadius="full"
              aria-label="Inspect data"
              onClick={handleInspect}
              boxShadow="md"
              opacity={iconOpacity}
              cursor={iconCursor}
              _hover={{ transform: !hasOutput ? 'none' : 'scale(1.2)' }}
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
      )}
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
              Symbols: {(() => {
                if (!data.result) return 0;
                const dataBySymbol = extractDataBySymbol(data.result);
                return Object.keys(dataBySymbol).length || data.result?.total_symbols || 0;
              })()}
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
  block: CustomBlockNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Error Boundary to catch React Flow errors
class ReactFlowErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's the parentNode error
    if (error?.message?.includes('Parent node') && error?.message?.includes('not found')) {
      console.warn('[ReactFlowErrorBoundary] Caught orphaned parentId error:', error.message);
      // Trigger refetch to clean data
      return { hasError: true, error };
    }
    // Let other errors bubble up
    throw error;
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ReactFlowErrorBoundary] Error caught:', error, errorInfo);
    
    // Auto-recover by refetching
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  componentDidUpdate(prevProps) {
    // Reset error state when nodes change (after refetch)
    if (this.state.hasError && prevProps.nodes !== this.props.nodes) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box h="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
          <VStack spacing="20px">
            <Icon as={MdWarning} boxSize="64px" color="orange.500" />
            <Text fontSize="xl" fontWeight="600" color="gray.700">
              Refreshing canvas...
            </Text>
            <Spinner size="lg" color="teal.500" />
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

function PipelineBuilderInner() {
  const { id } = useParams(); // Get horizon ID from URL
  const navigate = useNavigate();
  
  // Suppress ResizeObserver warnings
  useEffect(() => {
    const resizeObserverErrHandler = (e) => {
      if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
        const resizeObserverErr = e;
        resizeObserverErr.stopImmediatePropagation();
        return false;
      }
    };
    window.addEventListener('error', resizeObserverErrHandler);
    return () => window.removeEventListener('error', resizeObserverErrHandler);
  }, []);
  
  const [nodes, setNodes, onNodesChangeDefault] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeDefault] = useEdgesState(initialEdges);
  const [reactFlowError, setReactFlowError] = useState(null);
  
  // Custom onNodesChange to ensure only one node is selected at a time (unless Shift is held)
  const shiftHeldRef = useRef(false);
  useEffect(() => {
    const down = (e) => { if (e.key === 'Shift') shiftHeldRef.current = true; };
    const up = (e) => { if (e.key === 'Shift') shiftHeldRef.current = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const onNodesChange = useCallback(
    (changes) => {
      try {
        // Check if any selection changes
        const selectionChanges = changes.filter(change =>
          change.type === 'select' && change.selected === true
        );

        if (selectionChanges.length === 1 && !shiftHeldRef.current) {
          // Single click without Shift — keep single-select behavior
          const selectedNodeId = selectionChanges[0].id;

          setNodes((nds) =>
            nds.map((node) => ({
              ...node,
              selected: node.id === selectedNodeId,
            }))
          );
        } else {
          // Shift+click, multi-select (Shift+drag box), or no selection changes — let React Flow handle it natively
          onNodesChangeDefault(changes);
        }
      } catch (error) {
        if (error?.message?.includes('Parent node') && error?.message?.includes('not found')) {
          console.warn('[onNodesChange] Caught orphaned parentId error, triggering refetch:', error.message);
          setReactFlowError(error);
        } else {
          throw error;
        }
      }
    },
    [onNodesChangeDefault, setNodes]
  );
  
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
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
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

  const { getNodes, getEdges, fitView } = useReactFlow();
  // State for drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragPreviewNodeId, setDragPreviewNodeId] = useState(null);
  const dragStartPosRef = useRef(null); // Track mouse start position to require minimum drag distance

  // State for block node
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [isAddingToBlock, setIsAddingToBlock] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [highlightedBlockId, setHighlightedBlockId] = useState(null);
  const [extractingChild, setExtractingChild] = useState(null); // { blockId, childNodeId, childNode }

  // State for right sidebar to show output node data
  const [selectedOutputNode, setSelectedOutputNode] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [selectedRevisionIndex, setSelectedRevisionIndex] = useState(0);
  const [isLoadingRevisions, setIsLoadingRevisions] = useState(false);
  const [sidebarView, setSidebarView] = useState(SIDEBAR_VIEW.LIST);
  
  // Ref for Console Log
  const consoleLogRef = useRef(null);
  
  useEffect(() => {
    if (editingPortfolio) {
      setSelectedStocks(editingPortfolio.stocks || []);
      setPortfolioConfig({
        name: editingPortfolio.name || '',
        description: editingPortfolio.description || '',
      });
    }
  }, [editingPortfolio]);

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

  // Auto-refetch when ReactFlow encounters orphaned parentId error
  useEffect(() => {
    if (reactFlowError) {
      console.log('[PipelineDetail] ReactFlow error detected, refetching horizon...');
      refetchHorizon();
      setReactFlowError(null);
    }
  }, [reactFlowError, refetchHorizon]);

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
        // Only save horizon name, not nodes (nodes are saved individually via nodeApi)
        await request.put(`/horizons/${currentHorizonId}`, {
          name: currentHorizonName,
          // Don't send nodes array - it causes duplicate key errors
          // Nodes are managed individually through nodeApi.update/create/delete
        });
        console.log('[Auto-save] Horizon name saved successfully');
      } catch (error) {
        console.error('[Auto-save] Failed to sync horizon to backend:', error);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [currentHorizonName, currentHorizonId, isLoading]); // Removed 'nodes' from dependencies

  // Add a child node from the "+" button on a node's outbound side
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
        
        // Refetch horizon to update UI
        await refetchHorizon();
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
    [toast, refetchHorizon]
  );

  // Config panel is shown only on double-click (see handleNodeDoubleClick)
  // Single click just selects the node for moving/deleting

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Escape closes any open config panel or cancels block selection mode
      if (event.key === 'Escape') {
        if (isAddingToBlock) {
          setIsAddingToBlock(false);
          setSelectedBlockId(null);
          toast({
            title: 'Cancelled',
            description: 'Block selection mode cancelled',
            status: 'info',
            duration: 2000,
            isClosable: true,
          });
          return;
        }
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
            // Track locally-deleted IDs to prevent ghost nodes
            deletableNodes.forEach(n => deletedNodeIdsRef.current.add(n.id));

            // Remove from local React Flow state immediately
            setNodes((nds) => nds.filter(n => !deletableNodes.some(d => d.id === n.id)));

            // Delete nodes via backend API (wait for all to complete)
            Promise.all(
              deletableNodes.map(async (node) => {
                try {
                  await nodeApi.delete(node.id);
                  console.log(`[KeyboardDelete] Deleted node: ${node.id}`);
                } catch (error) {
                  console.error(`[KeyboardDelete] Failed to delete node ${node.id}:`, error);
                  toast({
                    title: 'Delete failed',
                    description: `Could not delete node`,
                    status: 'error',
                    duration: 2000,
                    isClosable: true,
                  });
                }
              })
            ).then(() => {
              // Refetch to get updated data after all deletes complete
              if (refetchHorizon) {
                refetchHorizon();
              }
              consoleLogRef.current?.addLog('success', `${deletableNodes.length} node(s) deleted`);
              // toast({
              //   title: 'Nodes deleted',
              //   description: `${deletableNodes.length} node(s) removed`,
              //   status: 'success',
              //   duration: 2000,
              //   isClosable: true,
              // });
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, toast, isAddingToBlock, refetchHorizon]);

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

  
  // Add node to block
  const handleNodeClickForBlock = useCallback(async (nodeId) => {
    if (!isAddingToBlock || !selectedBlockId) return;

    const currentNodes = getNodes();
    const currentEdges = getEdges();
    
    // Check if node is disconnected (no edges)
    const hasConnection = currentEdges.some(
      e => e.source === nodeId || e.target === nodeId
    );

    if (hasConnection) {
      toast({
        title: 'Cannot add connected node',
        description: 'Only disconnected nodes can be added to a block',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const nodeToAdd = currentNodes.find(n => n.id === nodeId);
    if (!nodeToAdd || nodeToAdd.type === 'block' || nodeToAdd.type === 'outputNode') {
      toast({
        title: 'Invalid node',
        description: 'Cannot add this type of node to block',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const blockNode = currentNodes.find(n => n.id === selectedBlockId);
      const currentChildNodeIds = blockNode?.data?.childNodeIds || [];

      // Add this node ID to block's childNodeIds array
      const updatedChildNodeIds = [...currentChildNodeIds, nodeId];

      // Update block node in backend - add child ID to array
      await nodeApi.update(selectedBlockId, {
        childNodeIds: updatedChildNodeIds,
      });

      // Update the node itself - set its blockId
      await nodeApi.update(nodeId, {
        blockId: selectedBlockId,
      });

      // Refetch to get updated data
      await refetchHorizon();

      consoleLogRef.current?.addLog('success', 'Node added to block. Continue selecting nodes or press ESC to finish');
    } catch (error) {
      console.error('Failed to add node to block:', error);
      consoleLogRef.current?.addLog('error', `Failed to add node: ${error.message}`);
    }
  }, [isAddingToBlock, selectedBlockId, getNodes, getEdges, setNodes]);

  const handleNodeClick = useCallback(async (event, node) => {
    // Handle block selection mode
    if (isAddingToBlock && node.type !== 'block' && node.type !== 'outputNode') {
      handleNodeClickForBlock(node.id);
      return;
    }

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
  }, [toast, setNodes, currentHorizonId, isAddingToBlock, handleNodeClickForBlock]);

  const handleNodeDelete = useCallback(async (nodeId) => {
    try {
      deletedNodeIdsRef.current.add(nodeId);
      // Remove from local state immediately for responsiveness
      setNodes((nds) => nds.filter(n => n.id !== nodeId));

      await nodeApi.delete(nodeId);

      // Refetch horizon data to get updated nodes with cleaned parentId references
      await refetchHorizon();

      console.log('[Delete] Adding log, ref:', consoleLogRef.current);
      consoleLogRef.current?.addLog('info', `Node deleted: ${nodeId}`);
    } catch (error) {
      // Rollback tracking on failure
      deletedNodeIdsRef.current.delete(nodeId);
      console.error('Failed to delete node:', error);
      consoleLogRef.current?.addLog('error', `Failed to delete node: ${error.message}`);
    }
  }, [refetchHorizon, setNodes]);


  // Add a child node from the "+" button on a node's outbound side
  const handleAddChildNode = useCallback(async (sourceNodeId, agentTemplate) => {
    const sourceNode = getNodes().find(n => n.id === sourceNodeId);
    if (!sourceNode || !currentHorizonId) return;

    const sourceW = sourceNode.width || 250;
    const position = {
      x: sourceNode.position.x + sourceW + 80,
      y: sourceNode.position.y,
    };

    try {
      const response = await nodeApi.create({
        horizonId: currentHorizonId,
        type: 'agentNode',
        position,
        data: {
          agent: agentTemplate,
          config: {
            name: agentTemplate.name,
            description: agentTemplate.description || '',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000,
          },
        },
        parentId: sourceNodeId,
      });

      const savedNode = response.data;
      
      // Refetch horizon to get updated data
      await refetchHorizon();

      consoleLogRef.current?.addLog('success', `Node added: ${agentTemplate.name} connected to pipeline`);
    } catch (error) {
      console.error('Failed to add child node:', error);
      consoleLogRef.current?.addLog('error', `Failed to add node: ${error.message || 'Could not create node'}`);
    }
  }, [getNodes, currentHorizonId, setNodes, setEdges, handleNodeDelete, refetchHorizon]);

  // Auto-layout: barycenter method — centers parents with children, spaces subtrees
  const handleAutoLayout = useCallback(() => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    if (currentNodes.length === 0) return;

    const RANK_SEP = 120;
    const NODE_SEP = 50;

    // Separate connected vs disconnected
    const connectedIds = new Set();
    currentEdges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });

    // Build adjacency
    const childrenOf = {};
    const parentsOf = {};
    currentEdges.forEach(e => {
      if (connectedIds.has(e.source) && connectedIds.has(e.target)) {
        if (!childrenOf[e.source]) childrenOf[e.source] = [];
        if (!childrenOf[e.source].includes(e.target)) childrenOf[e.source].push(e.target);
        if (!parentsOf[e.target]) parentsOf[e.target] = [];
        if (!parentsOf[e.target].includes(e.source)) parentsOf[e.target].push(e.source);
      }
    });

    // Node dimensions
    const nodeMap = {};
    currentNodes.forEach(n => { nodeMap[n.id] = n; });
    const getW = (id) => nodeMap[id]?.width || 250;
    const getH = (id) => nodeMap[id]?.height || 120;

    // Find roots
    const roots = [...connectedIds].filter(id => !parentsOf[id] || parentsOf[id].length === 0);
    if (roots.length === 0 && connectedIds.size > 0) roots.push([...connectedIds][0]);

    // Assign layers via longest path
    const layers = {};
    function assignLayer(nodeId, layer) {
      if (layers[nodeId] !== undefined && layers[nodeId] >= layer) return;
      layers[nodeId] = layer;
      (childrenOf[nodeId] || []).forEach(cid => assignLayer(cid, layer + 1));
    }
    roots.forEach(r => assignLayer(r, 0));
    connectedIds.forEach(id => { if (layers[id] === undefined) layers[id] = 0; });

    // Group by layer
    const layerGroups = {};
    connectedIds.forEach(id => {
      const l = layers[id];
      if (!layerGroups[l]) layerGroups[l] = [];
      layerGroups[l].push(id);
    });
    const maxLayer = Math.max(...Object.values(layers), 0);

    // X offset per layer
    const layerX = {};
    let xPos = 0;
    for (let l = 0; l <= maxLayer; l++) {
      const ids = layerGroups[l] || [];
      const maxW = ids.length > 0 ? Math.max(...ids.map(id => getW(id))) : 250;
      layerX[l] = xPos;
      xPos += maxW + RANK_SEP;
    }

    // Initial Y: evenly spaced per layer
    const positions = {};
    for (let l = 0; l <= maxLayer; l++) {
      let y = 0;
      (layerGroups[l] || []).forEach(id => {
        positions[id] = { x: layerX[l], y };
        y += getH(id) + NODE_SEP;
      });
    }

    // Resolve overlaps within a sorted layer, then re-center the group
    function resolveOverlaps(sortedIds) {
      if (sortedIds.length <= 1) return;
      const desiredCenter = sortedIds.reduce((s, id) => s + positions[id].y + getH(id) / 2, 0) / sortedIds.length;
      for (let i = 1; i < sortedIds.length; i++) {
        const prev = sortedIds[i - 1];
        const curr = sortedIds[i];
        const minY = positions[prev].y + getH(prev) + NODE_SEP;
        if (positions[curr].y < minY) positions[curr].y = minY;
      }
      const actualCenter = sortedIds.reduce((s, id) => s + positions[id].y + getH(id) / 2, 0) / sortedIds.length;
      const shift = desiredCenter - actualCenter;
      sortedIds.forEach(id => { positions[id].y += shift; });
    }

    // Barycenter: 8 passes forward + backward
    for (let pass = 0; pass < 8; pass++) {
      // Forward: position each layer based on parents
      for (let l = 1; l <= maxLayer; l++) {
        const ids = [...(layerGroups[l] || [])];
        const bary = {};
        ids.forEach(id => {
          const pars = (parentsOf[id] || []).filter(p => positions[p]);
          bary[id] = pars.length > 0
            ? pars.reduce((s, p) => s + positions[p].y + getH(p) / 2, 0) / pars.length
            : positions[id].y + getH(id) / 2;
        });
        ids.sort((a, b) => bary[a] - bary[b]);
        ids.forEach(id => { positions[id].y = bary[id] - getH(id) / 2; });
        resolveOverlaps(ids);
        layerGroups[l] = ids;
      }
      // Backward: position each layer based on children
      for (let l = maxLayer - 1; l >= 0; l--) {
        const ids = [...(layerGroups[l] || [])];
        const bary = {};
        ids.forEach(id => {
          const kids = (childrenOf[id] || []).filter(k => positions[k]);
          bary[id] = kids.length > 0
            ? kids.reduce((s, k) => s + positions[k].y + getH(k) / 2, 0) / kids.length
            : positions[id].y + getH(id) / 2;
        });
        ids.sort((a, b) => bary[a] - bary[b]);
        ids.forEach(id => { positions[id].y = bary[id] - getH(id) / 2; });
        resolveOverlaps(ids);
        layerGroups[l] = ids;
      }
    }

    // Apply positions
    let maxTreeY = 0;
    const finalNodes = currentNodes.map(node => {
      if (connectedIds.has(node.id) && positions[node.id]) {
        const pos = { x: Math.round(positions[node.id].x), y: Math.round(positions[node.id].y) };
        maxTreeY = Math.max(maxTreeY, pos.y + getH(node.id));
        return { ...node, position: pos };
      }
      return node;
    });

    // Disconnected nodes in a row below
    let dx = 0;
    const result = finalNodes.map(node => {
      if (!connectedIds.has(node.id)) {
        const pos = { x: dx, y: maxTreeY + 100 };
        dx += 260;
        return { ...node, position: pos };
      }
      return node;
    });

    setNodes(result);
    result.forEach(node => {
      nodeApi.update(node.id, { position: node.position }).catch(() => {});
    });
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [getNodes, getEdges, setNodes, fitView]);

  // Check if two nodes overlap based on position and size
  const checkNodeOverlap = useCallback((node1, node2) => {
    // Get node dimensions (use measured width/height or defaults)
    const node1Width = node1.width || 250;
    const node1Height = node1.height || 120;
    const node2Width = node2.width || 300;
    const node2Height = node2.height || 150;

    // Calculate boundaries
    const node1Left = node1.position.x;
    const node1Right = node1.position.x + node1Width;
    const node1Top = node1.position.y;
    const node1Bottom = node1.position.y + node1Height;

    const node2Left = node2.position.x;
    const node2Right = node2.position.x + node2Width;
    const node2Top = node2.position.y;
    const node2Bottom = node2.position.y + node2Height;

    // Check overlap
    return !(node1Right < node2Left || 
             node1Left > node2Right || 
             node1Bottom < node2Top || 
             node1Top > node2Bottom);
  }, []);

  // Handle node drag (while dragging) to highlight blocks
  const handleNodeDrag = useCallback((event, node) => {
    // Track which node is being dragged
    setDraggingNodeId(node.id);

    // Only force single-select when NOT holding Shift and the dragged node isn't part of a multi-selection
    const currentNodes = getNodes();
    const selectedNodes = currentNodes.filter(n => n.selected);
    const isDraggedNodeSelected = selectedNodes.some(n => n.id === node.id);

    if (!shiftHeldRef.current && !(selectedNodes.length > 1 && isDraggedNodeSelected)) {
      // Set dragged node as the only selected node
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );
    }

    // Skip if dragging a block or output node
    if (node.type === 'block' || node.type === 'outputNode') {
      setHighlightedBlockId(null);
      return;
    }

    // Check if node has connections
    const currentEdges = getEdges();
    const hasConnection = currentEdges.some(
      e => e.source === node.id || e.target === node.id
    );

    if (hasConnection) {
      // Can't add to block if it has connections
      setHighlightedBlockId(null);
      return;
    }

    // Find all block nodes
    const blockNodes = currentNodes.filter(n => n.type === 'block');

    // Check if currently overlapping with any block
    let overlappingBlock = null;
    for (const blockNode of blockNodes) {
      if (checkNodeOverlap(node, blockNode)) {
        overlappingBlock = blockNode;
        break;
      }
    }

    setHighlightedBlockId(overlappingBlock ? overlappingBlock.id : null);
  }, [getNodes, getEdges, checkNodeOverlap, setNodes]);

  // Save node position to backend when drag stops
  const handleNodeDragStop = useCallback(async (event, node) => {
    // Clear dragging state
    setDraggingNodeId(null);
    setHighlightedBlockId(null);

    try {
      // Check if node was dropped onto a block
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      // Skip if this is a block node or output node
      if (node.type === 'block' || node.type === 'outputNode') {
        await nodeApi.update(node.id, {
          position: node.position,
        });
        return;
      }

      // Check if node has connections
      const hasConnection = currentEdges.some(
        e => e.source === node.id || e.target === node.id
      );

      if (hasConnection) {
        // Node has connections, just save position
        await nodeApi.update(node.id, {
          position: node.position,
        });
        return;
      }

      // Find all block nodes
      const blockNodes = currentNodes.filter(n => n.type === 'block');

      // Check if dropped node overlaps with any block
      let targetBlock = null;
      for (const blockNode of blockNodes) {
        if (checkNodeOverlap(node, blockNode)) {
          targetBlock = blockNode;
          break;
        }
      }

      if (targetBlock) {
        // Node was dropped onto a block - add it to the block using new design
        console.log(`[DragDrop] Node ${node.id} dropped onto block ${targetBlock.id}`);
        
        const currentChildNodeIds = targetBlock.data?.childNodeIds || [];

        // Check if node is already in this block
        if (currentChildNodeIds.includes(node.id)) {
          // Just update position
          await nodeApi.update(node.id, {
            position: node.position,
          });
          return;
        }

        const updatedChildNodeIds = [...currentChildNodeIds, node.id];

        // Update block node with new child ID
        await nodeApi.update(targetBlock.id, {
          childNodeIds: updatedChildNodeIds,
        });

        // Update node to set its blockId
        await nodeApi.update(node.id, {
          blockId: targetBlock.id,
          position: node.position,
        });

        // Refetch horizon to get updated data
        await refetchHorizon();

        toast({
          title: 'Node added to block',
          description: `Successfully moved node into block container`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        // Normal drag - just save position
        await nodeApi.update(node.id, {
          position: node.position,
        });
        console.log(`[NodeDrag] Saved position for node ${node.id}:`, node.position);
      }
    } catch (error) {
      console.error('Failed to save node position:', error);
      consoleLogRef.current?.addLog('error', 'Failed to save node position');
    }
  }, [getNodes, getEdges, checkNodeOverlap, setNodes]);

  // Start adding nodes to block
  const handleAddToBlock = useCallback((blockId) => {
    setSelectedBlockId(blockId);
    setIsAddingToBlock(true);
    consoleLogRef.current?.addLog('info', 'Select nodes to add to block. Click on disconnected nodes or press ESC to cancel.');
  }, []);

  // Handle drop node to block (drag & drop)
  const handleDropToBlock = useCallback(async (blockId, nodeId) => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    
    // Check if node is disconnected (no edges)
    const hasConnection = currentEdges.some(
      e => e.source === nodeId || e.target === nodeId
    );

    if (hasConnection) {
      consoleLogRef.current?.addLog('warn', 'Cannot add connected node - only disconnected nodes can be added to a block');
      return;
    }

    const nodeToAdd = currentNodes.find(n => n.id === nodeId);
    if (!nodeToAdd || nodeToAdd.type === 'block' || nodeToAdd.type === 'outputNode') {
      consoleLogRef.current?.addLog('warn', 'Invalid node - cannot add this type of node to block');
      return;
    }

    try {
      const blockNode = currentNodes.find(n => n.id === blockId);
      const currentChildNodeIds = blockNode?.data?.childNodeIds || [];

      // Check if node is already in this block
      if (currentChildNodeIds.includes(nodeId)) {
        toast({
          title: 'Node already in block',
          description: 'This node is already part of the block',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        return;
      }

      const updatedChildNodeIds = [...currentChildNodeIds, nodeId];

      // Update block node with new child ID
      await nodeApi.update(blockId, {
        childNodeIds: updatedChildNodeIds,
      });

      // Update node to set its blockId
      await nodeApi.update(nodeId, {
        blockId: blockId,
      });

      // Refetch horizon to get updated data
      await refetchHorizon();

      toast({
        title: 'Node added to block',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to add node to block:', error);
      toast({
        title: 'Failed to add node',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [getNodes, getEdges, setNodes, toast]);

  // Remove a child node from block
  const handleRemoveFromBlock = useCallback(async (blockId, childNodeId) => {
    try {
      const currentNodes = getNodes();
      const blockNode = currentNodes.find(n => n.id === blockId);
      
      if (!blockNode || !blockNode.data.childNodeIds) {
        return;
      }

      const childNodeIds = blockNode.data.childNodeIds;
      
      // Check if child node exists in block
      if (!childNodeIds.includes(childNodeId)) {
        return;
      }

      const updatedChildNodeIds = childNodeIds.filter(id => id !== childNodeId);

      // Update block in backend - remove child ID
      await nodeApi.update(blockId, {
        childNodeIds: updatedChildNodeIds,
      });

      // Calculate new position for extracted node (to the right of block)
      const newNodePosition = {
        x: blockNode.position.x + 350,
        y: blockNode.position.y + (updatedChildNodeIds.length * 50),
      };

      // Update the child node - clear blockId and set new position
      await nodeApi.update(childNodeId, {
        blockId: null,
        position: newNodePosition,
      });

      // Refetch horizon to get updated data
      await refetchHorizon();

      toast({
        title: 'Node removed from block',
        description: 'Node has been extracted and placed outside',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to remove node from block:', error);
      toast({
        title: 'Failed to remove node',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [getNodes, toast, refetchHorizon]);

  // Handle double-click on child node to edit
  const handleEditChildNode = useCallback(async (blockId, childNodeId) => {
    console.log(`[EditChildNode] Block: ${blockId}, Child: ${childNodeId}`);
    
    try {
      const currentNodes = getNodes();
      const blockNode = currentNodes.find(n => n.id === blockId);
      
      if (!blockNode || !blockNode.data.childNodeIds) {
        console.warn('[EditChildNode] Block not found or has no childNodeIds');
        return;
      }

      const childNodeIds = blockNode.data.childNodeIds;
      
      // Check if child node exists in block
      if (!childNodeIds.includes(childNodeId)) {
        console.warn('[EditChildNode] Child node not in block childNodeIds');
        return;
      }

      // Find the child node data from block's childNodes
      const childNode = blockNode.data.childNodes?.find(n => n.id === childNodeId);
      if (!childNode) {
        console.warn('[EditChildNode] Child node not found in block.data.childNodes');
        return;
      }
      
      // First, extract the node from block by removing from childNodeIds
      const updatedChildNodeIds = childNodeIds.filter(id => id !== childNodeId);

      // Update block in backend
      await nodeApi.update(blockId, {
        childNodeIds: updatedChildNodeIds,
      });

      // Calculate new position for extracted node
      const newNodePosition = {
        x: blockNode.position.x + 350,
        y: blockNode.position.y + (updatedChildNodeIds.length * 50),
      };

      // Update the child node - clear blockId and set new position
      await nodeApi.update(childNodeId, {
        blockId: null,
        position: newNodePosition,
      });

      // Refetch horizon to get updated data
      await refetchHorizon();

      // Now open the config panel for the node
      setTimeout(() => {
        const nodeToEdit = {
          id: childNodeId,
          type: childNode.type,
          data: childNode.data,
        };

        if (childNode.type === 'agentNode') {
          setSelectedNode(nodeToEdit);
          setNodeConfig({
            name: childNode.data?.config?.name || childNode.data?.agent?.name || '',
            description: childNode.data?.config?.description || childNode.data?.agent?.description || '',
            model: childNode.data?.config?.model || 'gpt-4',
            temperature: childNode.data?.config?.temperature || 0.7,
            maxTokens: childNode.data?.config?.maxTokens || 2000,
            systemPrompt: childNode.data?.agent?.systemPrompt || '',
          });
        } else if (childNode.type === 'portfolioNode') {
          setSelectedNode(nodeToEdit);
          setPortfolioConfig({
            name: childNode.data?.portfolio?.name || '',
            description: childNode.data?.portfolio?.description || '',
          });
          setSelectedStocks(childNode.data?.portfolio?.stocks || []);
        }
      }, 100);

      toast({
        title: 'Editing node',
        description: 'Node extracted from block for editing',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to edit child node:', error);
      toast({
        title: 'Failed to edit node',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [getNodes, toast, refetchHorizon, setSelectedNode, setNodeConfig, setPortfolioConfig, setSelectedStocks]);

  // Handle config button click on child node (edit in-place without extraction)
  const handleConfigChildNode = useCallback((blockId, childNodeId) => {
    console.log(`[ConfigChildNode] Block: ${blockId}, Child: ${childNodeId}`);
    
    const currentNodes = getNodes();
    const blockNode = currentNodes.find(n => n.id === blockId);
    
    if (!blockNode || !blockNode.data.childNodeIds) {
      console.warn('[ConfigChildNode] Block not found or has no childNodeIds');
      return;
    }

    const childNodeIds = blockNode.data.childNodeIds;
    
    // Check if child node exists in block
    if (!childNodeIds.includes(childNodeId)) {
      console.warn('[ConfigChildNode] Child node not in block childNodeIds');
      return;
    }

    // Find the actual child node from block's childNodes data
    const childNode = blockNode.data.childNodes?.find(n => n.id === childNodeId);
    if (!childNode) {
      console.warn('[ConfigChildNode] Child node not found in block.data.childNodes');
      return;
    }
    
    // Create a temporary node object for config panel
    const tempNode = {
      id: childNodeId, // Use actual node ID
      type: childNode.type,
      data: childNode.data,
      // Store block reference for saving later
      _isChildNode: true,
      _blockId: blockId,
    };

    // Open config panel based on node type
    if (childNode.type === 'agentNode') {
      setSelectedNode(tempNode);
      setNodeConfig({
        name: childNode.data?.config?.name || childNode.data?.agent?.name || '',
        description: childNode.data?.config?.description || childNode.data?.agent?.description || '',
        model: childNode.data?.config?.model || 'gpt-4',
        temperature: childNode.data?.config?.temperature || 0.7,
        maxTokens: childNode.data?.config?.maxTokens || 2000,
        systemPrompt: childNode.data?.agent?.systemPrompt || '',
      });
    } else if (childNode.type === 'portfolioNode') {
      setSelectedNode(tempNode);
      setPortfolioConfig({
        name: childNode.data?.portfolio?.name || '',
        description: childNode.data?.portfolio?.description || '',
      });
      setSelectedStocks(childNode.data?.portfolio?.stocks || []);
    }

    toast({
      title: 'Configure child node',
      description: 'Edit the node configuration',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [getNodes, setSelectedNode, setNodeConfig, setPortfolioConfig, setSelectedStocks, toast]);

  // Handle extract and drag child node out of block (start drag operation)
  const handleExtractAndDrag = useCallback((blockId, childNodeId, mouseEvent) => {
    console.log(`[ExtractAndDrag] Block: ${blockId}, Child: ${childNodeId}`);
    
    const currentNodes = getNodes();
    const blockNode = currentNodes.find(n => n.id === blockId);
    
    if (!blockNode || !blockNode.data.childNodeIds) {
      console.warn('[ExtractAndDrag] Block not found or has no childNodeIds');
      return;
    }

    const childNodeIds = blockNode.data.childNodeIds;
    
    // Check if child node exists in block
    if (!childNodeIds.includes(childNodeId)) {
      console.warn('[ExtractAndDrag] Child node not in block childNodeIds');
      return;
    }

    // Find the child node from block's childNodes data (not from visible nodes)
    const childNode = blockNode.data.childNodes?.find(n => n.id === childNodeId);
    if (!childNode) {
      console.warn('[ExtractAndDrag] Child node not found in block.data.childNodes');
      return;
    }

    // Get cursor position in flow coordinates
    const position = screenToFlowPosition({
      x: mouseEvent.clientX,
      y: mouseEvent.clientY,
    });

    // Create preview node
    const previewNodeId = `preview-extract-${Date.now()}`;
    const previewNode = {
      id: previewNodeId,
      type: childNode.type,
      position,
      data: childNode.data,
      draggable: false,
      style: { opacity: 0.6 }, // Preview style
    };

    setNodes((nds) => nds.concat(previewNode));
    setDragPreviewNodeId(previewNodeId);
    setExtractingChild({ blockId, childNodeId, childNode });
    dragStartPosRef.current = { x: mouseEvent.clientX, y: mouseEvent.clientY };
    setIsDragging(true);

    toast({
      title: 'Extracting node',
      description: 'Move to desired position and release',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [getNodes, screenToFlowPosition, setNodes, toast]);

  // Create a new block node (OLD - now using drag from sidebar)
  /*
  const handleCreateBlock = useCallback(async () => {
    if (!currentHorizonId) return;

    try {
      const position = {
        x: 100,
        y: 100,
      };

      const response = await nodeApi.create({
        horizonId: currentHorizonId,
        type: 'block',
        position,
        data: {},
        childNodeIds: [], // Use childNodeIds instead of childNodes
      });

      const savedNode = response.data;
      
      // Refetch horizon to get updated data
      await refetchHorizon();

      toast({
        title: 'Block created',
        description: 'Drag disconnected nodes into the block or use the + button',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to create block:', error);
      toast({
        title: 'Failed to create block',
        description: error.message || 'Could not create block',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [currentHorizonId, setNodes, toast, handleNodeDelete, handleAddToBlock, handleDropToBlock, handleRemoveFromBlock, handleConfigChildNode, handleExtractAndDrag]);
  */


  const handleAgentMouseDown = useCallback((event, agent) => {
    event.preventDefault();

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Start drag operation - create preview node
    const previewNodeId = `preview-${Date.now()}`;
    const previewNode = {
      id: previewNodeId,
      type: 'agentNode',
      position,
      data: {
        agent: agent,
        horizonId: currentHorizonId,
        onDelete: () => {},
        refetchHorizon: refetchHorizon,
        config: {
          name: agent.name,
          description: agent.description || '',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
        },
      },
      draggable: false,
      style: { opacity: 0.6 }, // Preview style
    };

    setNodes((nds) => nds.concat(previewNode));
    setDraggedItem({ type: 'agent', data: agent });
    setDragPreviewNodeId(previewNodeId);
    dragStartPosRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);

  }, [screenToFlowPosition, setNodes, currentHorizonId, refetchHorizon]);

  const handlePortfolioMouseDown = useCallback((event, portfolio) => {
    event.preventDefault();

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Start drag operation - create preview node
    const previewNodeId = `preview-${Date.now()}`;
    const previewNode = {
      id: previewNodeId,
      type: 'portfolioNode',
      position,
      data: {
        portfolio: portfolio,
        onDelete: () => {},
        refetchHorizon: refetchHorizon,
      },
      draggable: false,
      style: { opacity: 0.6 }, // Preview style
    };

    setNodes((nds) => nds.concat(previewNode));
    setDraggedItem({ type: 'portfolio', data: portfolio });
    setDragPreviewNodeId(previewNodeId);
    dragStartPosRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);

  }, [screenToFlowPosition, setNodes, currentHorizonId, refetchHorizon]);

  const handleBlockMouseDown = useCallback((event) => {
    event.preventDefault();

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Start drag operation - create preview block node
    const previewNodeId = `preview-block-${Date.now()}`;
    const previewNode = {
      id: previewNodeId,
      type: 'block',
      position,
      data: {
        childNodeIds: [],
        childNodes: [],
        horizonId: currentHorizonId,
        onDelete: () => {},
        onAddToBlock: () => {},
        onDropToBlock: () => {},
        onRemoveFromBlock: () => {},
        onConfigChildNode: () => {},
        onExtractAndDrag: () => {},
        isHighlighted: false,
      },
      draggable: false,
      style: { opacity: 0.6 }, // Preview style
    };

    setNodes((nds) => nds.concat(previewNode));
    setDraggedItem({ type: 'block', data: {} });
    setDragPreviewNodeId(previewNodeId);
    dragStartPosRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);

  }, [screenToFlowPosition, setNodes, currentHorizonId]);

  // Handle drag and drop
  useEffect(() => {
    if (!isDragging || !dragPreviewNodeId) return;

    const handleMouseMove = (event) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Update preview node position
      setNodes((nds) =>
        nds.map((node) =>
          node.id === dragPreviewNodeId
            ? { ...node, position }
            : node
        )
      );
    };

    const handleMouseUp = async (event) => {
      // Get final position
      const previewNode = getNodes().find(n => n.id === dragPreviewNodeId);
      const finalPosition = previewNode?.position || { x: 0, y: 0 };

      // Remove preview node
      setNodes((nds) => nds.filter((n) => n.id !== dragPreviewNodeId));

      // Require minimum drag distance (30px) to prevent accidental click-to-create
      const MIN_DRAG_DISTANCE = 30;
      if (dragStartPosRef.current) {
        const dx = event.clientX - dragStartPosRef.current.x;
        const dy = event.clientY - dragStartPosRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < MIN_DRAG_DISTANCE) {
          // Not enough drag — cancel operation
          setIsDragging(false);
          setDraggedItem(null);
          setDragPreviewNodeId(null);
          setExtractingChild(null);
          dragStartPosRef.current = null;
          return;
        }
      }
      dragStartPosRef.current = null;

      // Handle extracting child from block
      if (extractingChild) {
        try {
          const { blockId, childNodeId, childNode } = extractingChild;
          const currentNodes = getNodes();
          const blockNode = currentNodes.find(n => n.id === blockId);

          if (blockNode && blockNode.data.childNodeIds) {
            const updatedChildNodeIds = blockNode.data.childNodeIds.filter(id => id !== childNodeId);

            // Update block in backend - remove child ID
            await nodeApi.update(blockId, {
              childNodeIds: updatedChildNodeIds,
            });

            // Update the child node - clear blockId and set new position
            await nodeApi.update(childNodeId, {
              blockId: null,
              position: finalPosition,
            });

            // Refetch horizon to get updated data
            await refetchHorizon();

            toast({
              title: 'Node extracted',
              description: 'Node successfully removed from block',
              status: 'success',
              duration: 2000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error('Failed to extract node:', error);
          toast({
            title: 'Failed to extract node',
            description: error.message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
      // Create actual node in backend (for sidebar drag)
      else if (draggedItem) {
        try {
          if (draggedItem.type === 'agent') {
            const response = await nodeApi.create({
              horizonId: currentHorizonId,
              type: 'agentNode',
              position: finalPosition,
              data: {
                agent: draggedItem.data,
                config: {
                  name: draggedItem.data.name,
                  description: draggedItem.data.description || '',
                  model: 'gpt-4',
                  temperature: 0.7,
                  maxTokens: 2000,
                },
              },
            });

            const savedNode = response.data;
            
            // Refetch horizon to get updated data
            await refetchHorizon();
            consoleLogRef.current?.addLog('info', `Added agent node: ${draggedItem.data.name}`);
          } else if (draggedItem.type === 'portfolio') {
            const response = await nodeApi.create({
              horizonId: currentHorizonId,
              type: 'portfolioNode',
              position: finalPosition,
              data: {
                portfolio: draggedItem.data,
              },
            });

            const savedNode = response.data;
            
            // Refetch horizon to get updated data
            await refetchHorizon();

            toast({
              title: 'Portfolio added',
              description: `${draggedItem.data.name} data source added`,
              status: 'success',
              duration: 2000,
              isClosable: true,
            });
          } else if (draggedItem.type === 'block') {
            const response = await nodeApi.create({
              horizonId: currentHorizonId,
              type: 'block',
              position: finalPosition,
              data: {},
              childNodeIds: [],
            });

            const savedNode = response.data;
            
            // Refetch horizon to get updated data
            await refetchHorizon();

            toast({
              title: 'Block added',
              description: 'Block container created',
              status: 'success',
              duration: 2000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error('Failed to create node:', error);
          toast({
            title: 'Failed to add node',
            description: error.message || 'Could not create node',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }

      // Clean up drag state
      setIsDragging(false);
      setDraggedItem(null);
      setDragPreviewNodeId(null);
      setExtractingChild(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragPreviewNodeId, draggedItem, extractingChild, screenToFlowPosition, setNodes, getNodes, currentHorizonId, handleNodeDelete, refetchHorizon, handleAddChildNode, toast]);

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

    // AUTO-GENERATE system prompt using Google GenAI API (CRITICAL FIX)
    let systemPrompt = (newAgent.systemPrompt || '').trim();
    if (!systemPrompt && !editingAgent) {
      try {
        setIsGeneratingPrompt(true);
        // Call Google GenAI endpoint: POST /api/agents/generate-agent-system-prompt
        const response = await generateAgentSystemPrompt(
          newAgent.name,
          newAgent.description || '',
          newAgent.system === 'data' ? 'data_retriever' : 'custom_analyzer'
        );

        if (response.success && response.data?.systemPrompt) {
          systemPrompt = response.data.systemPrompt;

          // Validate it's not empty
          if (!systemPrompt.trim()) {
            throw new Error('Generated system prompt is empty');
          }

          // Update form to show generated prompt
          setNewAgent(prev => ({ ...prev, systemPrompt }));
        } else {
          throw new Error('Failed to generate system prompt');
        }
      } catch (error) {
        toast({
          title: 'Generation failed',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsGeneratingPrompt(false);
        return; // STOP - don't create agent without prompt
      } finally {
        setIsGeneratingPrompt(false);
      }
    }

    try {
      const agentData = {
        name: newAgent.name.trim(),
        description: (newAgent.description || '').trim(),
        type: 'custom_agent',
        system: newAgent.system,
        model: newAgent.model,
        systemPrompt: systemPrompt || (newAgent.systemPrompt || '').trim(),
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

  const handleSaveNodeConfig = async () => {
    if (!selectedNode) return;

    // Check if this is a child node being edited (inside a block)
    if (selectedNode._isChildNode) {
      const { _blockId } = selectedNode;
      const childNodeId = selectedNode.id; // Use actual node ID
      
      try {
        // Update the child node directly in backend
        await nodeApi.update(childNodeId, {
          data: {
            config: nodeConfig,
            agent: selectedNode.data.agent ? {
              ...selectedNode.data.agent,
              name: nodeConfig.name,
              description: nodeConfig.description,
              systemPrompt: nodeConfig.systemPrompt
            } : selectedNode.data.agent,
            portfolio: selectedNode.data.portfolio ? {
              ...selectedNode.data.portfolio,
              name: portfolioConfig.name,
              description: portfolioConfig.description,
              stocks: selectedStocks,
            } : selectedNode.data.portfolio,
          },
        });

        // Refetch horizon to update UI
        await refetchHorizon();

        setSelectedNode(null);
        
        toast({
          title: 'Configuration saved',
          description: 'Child node configuration updated',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Failed to save child node config:', error);
        toast({
          title: 'Failed to save',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      return;
    }

    // Normal node (not child node) - save to backend
    try {
      await nodeApi.update(selectedNode.id, {
        data: {
          ...selectedNode.data,
          config: nodeConfig,
          agent: selectedNode.data.agent ? {
            ...selectedNode.data.agent,
            name: nodeConfig.name,
            description: nodeConfig.description,
            systemPrompt: nodeConfig.systemPrompt
          } : selectedNode.data.agent,
          portfolio: selectedNode.data.portfolio ? {
            ...selectedNode.data.portfolio,
            name: portfolioConfig.name,
            description: portfolioConfig.description,
            stocks: selectedStocks,
          } : selectedNode.data.portfolio,
        },
      });

      // Refetch horizon to update UI
      await refetchHorizon();

      setSelectedNode(null);

      toast({
        title: 'Configuration saved',
        description: 'Node configuration updated successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to save node config:', error);
      toast({
        title: 'Failed to save',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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

  // Track locally-deleted node IDs to prevent ghost nodes reappearing from stale backend data
  const deletedNodeIdsRef = useRef(new Set());

  // Refs for callbacks used in horizonData processing — avoids re-running the effect when callbacks change
  const handleNodeDeleteRef = useRef(handleNodeDelete);
  const refetchHorizonRef = useRef(refetchHorizon);
  const handleAddChildNodeRef = useRef(handleAddChildNode);
  const handleAddToBlockRef = useRef(handleAddToBlock);
  const handleDropToBlockRef = useRef(handleDropToBlock);
  const handleRemoveFromBlockRef = useRef(handleRemoveFromBlock);
  const handleConfigChildNodeRef = useRef(handleConfigChildNode);
  const handleExtractAndDragRef = useRef(handleExtractAndDrag);

  useEffect(() => {
    handleNodeDeleteRef.current = handleNodeDelete;
    refetchHorizonRef.current = refetchHorizon;
    handleAddChildNodeRef.current = handleAddChildNode;
    handleAddToBlockRef.current = handleAddToBlock;
    handleDropToBlockRef.current = handleDropToBlock;
    handleRemoveFromBlockRef.current = handleRemoveFromBlock;
    handleConfigChildNodeRef.current = handleConfigChildNode;
    handleExtractAndDragRef.current = handleExtractAndDrag;
  });

  // Process horizon data when it changes
  useEffect(() => {
    if (horizonData) {
      console.log('[PipelineDetail] Loaded horizon:', horizonData);
      console.log('[PipelineDetail] Horizon ID:', horizonData.id, 'URL ID:', id);
      
      // Debug: Log all nodes and their parentIds
      console.log('[PipelineDetail] Nodes received from backend:', 
        horizonData.nodes.map(n => ({ id: n.id, type: n.type, parentId: n.parentId }))
      );
      
      // Create a set of valid node IDs for quick lookup
      const validNodeIds = new Set((horizonData.nodes || []).map(node => node.id));
      
      // Debug: Find orphaned parentIds
      const orphanedNodes = horizonData.nodes.filter(n => n.parentId && !validNodeIds.has(n.parentId));
      if (orphanedNodes.length > 0) {
        console.warn('[PipelineDetail] Found nodes with orphaned parentIds (backend failed to clean):', 
          orphanedNodes.map(n => ({ id: n.id, parentId: n.parentId }))
        );
      }
      
      // Add horizonId and refetch to all nodes for useRunAgent
      // Also validate and clean parentId references
      // For block nodes, load child nodes from childNodeIds
      const allNodes = horizonData.nodes || [];
      
      const nodesWithHorizonId = allNodes.map(node => {
        // Check if parentId exists and points to a valid node
        const hasValidParent = node.parentId && validNodeIds.has(node.parentId);
        
        if (node.parentId && !hasValidParent) {
          console.warn(`[PipelineDetail] Removing orphaned parentId ${node.parentId} from node ${node.id}`);
        }
        
        // For block nodes, load child nodes based on childNodeIds
        let childNodesData = [];
        if (node.type === 'block' && node.childNodeIds && node.childNodeIds.length > 0) {
          // Find all child nodes
          childNodesData = node.childNodeIds
            .map(childId => allNodes.find(n => n.id === childId))
            .filter(Boolean); // Remove undefined entries
          
          console.log(`[PipelineDetail] Block ${node.id} has ${childNodesData.length} children:`, 
            childNodesData.map(n => ({ id: n.id, type: n.type }))
          );
        }
        
        return {
          ...node,
          // Remove parentId if it points to non-existent node (React Flow validation)
          parentId: hasValidParent ? node.parentId : undefined,
          data: {
            ...node.data,
            // For block nodes, include childNodeIds and loaded childNodes in data
            ...(node.type === 'block' ? { 
              childNodeIds: node.childNodeIds || [],
              childNodes: childNodesData, // Pass actual node objects for rendering
            } : {}),
            horizonId: horizonData.id,
            onDelete: handleNodeDeleteRef.current,
            refetchHorizon: refetchHorizonRef.current,
            onAddChildNode: handleAddChildNodeRef.current,
            ...(node.type === 'block' ? {
              onAddToBlock: handleAddToBlockRef.current,
              onDropToBlock: handleDropToBlockRef.current,
              onRemoveFromBlock: handleRemoveFromBlockRef.current,
              onConfigChildNode: handleConfigChildNodeRef.current,
              onExtractAndDrag: handleExtractAndDragRef.current,
              isHighlighted: false,
            } : {}),
          }
        };
      });
      
      // Filter out nodes that have blockId (they are rendered inside blocks)
      const visibleNodes = nodesWithHorizonId.filter(node => !node.blockId);
      
      console.log('[PipelineDetail] Processed nodes (including hidden):', 
        nodesWithHorizonId.map(n => ({ id: n.id, type: n.type, parentId: n.parentId, blockId: n.blockId }))
      );
      console.log('[PipelineDetail] Visible nodes (excluding children in blocks):',
        visibleNodes.map(n => ({ id: n.id, type: n.type }))
      );

      // Clean up confirmed deletions (nodes the backend no longer returns)
      const backendNodeIds = new Set((horizonData.nodes || []).map(n => n.id));
      for (const deletedId of deletedNodeIdsRef.current) {
        if (!backendNodeIds.has(deletedId)) {
          deletedNodeIdsRef.current.delete(deletedId);
        }
      }

      // Filter out locally-deleted nodes that backend hasn't caught up with yet
      const finalNodes = visibleNodes.filter(n => !deletedNodeIdsRef.current.has(n.id));

      setNodes(finalNodes);
      setEdges(prevEdges => {
        const newEdges = horizonData.edges || [];
        const prevEdgeMap = new Map(prevEdges.map(e => [e.id, e]));
        return newEdges.map(newEdge => {
          const prev = prevEdgeMap.get(newEdge.id);
          // Preserve existing output data if backend doesn't have it
          if (prev?.data?.output && !newEdge.data?.output) {
            return { ...newEdge, data: { ...newEdge.data, output: prev.data.output }, animated: prev.animated };
          }
          return newEdge;
        });
      });
      
      // System 1 & 2: Merge builtin + library-activated + activated custom agents
      // Custom agents from horizonData only includes agents saved to THIS horizon.
      // We also need to fetch global library custom agents so they appear on new horizons too.
      const loadedDataAgents = horizonData.dataAgents || horizonData.availableAgents || [];
      const horizonCustomData = loadedDataAgents.filter(a => !a.isBuiltin && !a.isLibrary);
      const loadedAnalyzerAgents = horizonData.analyzerAgents || [];
      const horizonCustomAnalyzers = loadedAnalyzerAgents.filter(a => !a.isBuiltin && !a.isLibrary);

      // Fetch global library custom agents from backend
      horizonAgentApi.getAll({ limit: 100 }).then(response => {
        const activatedIds = getActivatedAgentIds();
        let globalCustomData = [];
        let globalCustomAnalyzers = [];

        if (response.success && response.data) {
          const allLibraryAgents = Array.isArray(response.data) ? response.data : response.data.agents || [];
          // Only global library agents (no horizonId) that are activated
          const globalAgents = allLibraryAgents.filter(a => !a.horizonId && activatedIds.includes(a.id));
          globalCustomData = globalAgents.filter(a => a.system === 'data');
          globalCustomAnalyzers = globalAgents.filter(a => a.system === 'analyzer');
        }

        // Merge horizon-specific custom agents (activated) + global library custom agents (activated)
        const horizonCustomDataIds = new Set(horizonCustomData.map(a => a.id));
        const horizonCustomAnalyzerIds = new Set(horizonCustomAnalyzers.map(a => a.id));
        const activatedHorizonData = horizonCustomData.filter(a => activatedIds.includes(a.id));
        const activatedHorizonAnalyzers = horizonCustomAnalyzers.filter(a => activatedIds.includes(a.id));
        // Avoid duplicates: only add global agents not already in horizon data
        const extraData = globalCustomData.filter(a => !horizonCustomDataIds.has(a.id));
        const extraAnalyzers = globalCustomAnalyzers.filter(a => !horizonCustomAnalyzerIds.has(a.id));

        setAvailableAgents([...BUILTIN_AGENTS, ...getActivatedDataAgents(), ...activatedHorizonData, ...extraData]);
        setAnalyzerAgents([...DEFAULT_ANALYZERS, ...getActivatedAnalyzerAgents(), ...activatedHorizonAnalyzers, ...extraAnalyzers]);
      }).catch(() => {
        // Fallback: just use horizon data if fetch fails
        const activatedIds = getActivatedAgentIds();
        const activatedCustomData = horizonCustomData.filter(a => activatedIds.includes(a.id));
        const activatedCustomAnalyzers = horizonCustomAnalyzers.filter(a => activatedIds.includes(a.id));
        setAvailableAgents([...BUILTIN_AGENTS, ...getActivatedDataAgents(), ...activatedCustomData]);
        setAnalyzerAgents([...DEFAULT_ANALYZERS, ...getActivatedAnalyzerAgents(), ...activatedCustomAnalyzers]);
      });
      
      setCustomAgents(horizonData.customAgents || []);
      setCurrentHorizonName(horizonData.name);
      setCurrentHorizonId(horizonData.id);
      setPortfolios(horizonData.portfolios || []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizonData, id]);

  // Update block nodes highlight state when dragging
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'block') {
          return {
            ...node,
            data: {
              ...node.data,
              isHighlighted: node.id === highlightedBlockId,
            },
          };
        }
        return node;
      })
    );
  }, [highlightedBlockId, setNodes]);

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
          pointerEvents="auto"
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
          pointerEvents="auto"
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
          pointerEvents="auto"
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
                    {agent.isLibrary && (
                      <Badge colorScheme="teal" fontSize="xs">
                        Library
                      </Badge>
                    )}
                  </HStack>

                  {!agent.isBuiltin && !agent.isLibrary && (
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
          pointerEvents="auto"
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
                      {agent.isLibrary && (
                        <Badge colorScheme="teal" fontSize="xs">
                          Library
                        </Badge>
                      )}
                    </HStack>

                    {!agent.isBuiltin && !agent.isLibrary && (
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

        {/* 5. Create Block Button */}
        <Tooltip label="Hold and drag to create block" placement="right" hasArrow>
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
            cursor="grab"
            _active={{ cursor: 'grabbing' }}
            _hover={{ borderColor: 'purple.400', boxShadow: 'lg', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            onMouseDown={handleBlockMouseDown}
            pointerEvents="auto"
          >
            <Icon as={MdAccountTree} color="purple.600" boxSize="24px" />
            <Text fontSize="sm" fontWeight="600" color="gray.800">
              Block
            </Text>
          </HStack>
        </Tooltip>
      </VStack>

      {/* Main Canvas */}
      <Box h="100%" position="relative" transition="all 0.3s">
        <ReactFlowErrorBoundary 
          nodes={nodes} 
          onError={(error) => {
            console.log('[ReactFlowErrorBoundary] Error handler called, triggering refetch');
            setReactFlowError(error);
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onNodeDrag={handleNodeDrag}
            onNodeDragStop={handleNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
            minZoom={0.1}
            maxZoom={2}
            panOnDrag={[0]}
            selectionKeyCode="Shift"
            multiSelectionKeyCode="Shift"
            selectionMode={SelectionMode.Partial}
            deleteKeyCode={null}
          >
            <Controls style={{marginLeft: "220px"}} />
            <MiniMap position='bottom-left'/>
            <Background variant="dots" gap={16} size={1} />

            <Panel position="top-right">
              <HStack spacing={2}>
                <Tooltip label="Auto Layout" placement="left" hasArrow>
                  <IconButton
                    icon={<Icon as={MdAccountTree} />}
                    size="md"
                    colorScheme="purple"
                    variant="solid"
                    aria-label="Auto layout"
                    onClick={handleAutoLayout}
                    boxShadow="lg"
                  />
                </Tooltip>
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
              </HStack>
            </Panel>
          </ReactFlow>
        </ReactFlowErrorBoundary>
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

                {/* System Prompt - show for all agents */}
                <FormControl>
                  <HStack justify="space-between" mb="8px">
                    <FormLabel fontSize="sm" fontWeight="600" mb="0">
                      System Prompt
                    </FormLabel>
                    {selectedNode?.data?.agent && !selectedNode.data.agent.isBuiltin && !selectedNode.data.agent.isLibrary && (
                      <Button
                        size="xs"
                        leftIcon={<Icon as={MdRefresh} />}
                        variant="outline"
                        colorScheme="purple"
                        isLoading={isGeneratingPrompt}
                        loadingText="Generating..."
                        isDisabled={isGeneratingPrompt}
                        onClick={async () => {
                          if (!nodeConfig.name || !nodeConfig.description) {
                            toast({
                              title: 'Missing information',
                              description: 'Please enter name and description first',
                              status: 'warning',
                              duration: 3000,
                              isClosable: true,
                            });
                            return;
                          }
                          setIsGeneratingPrompt(true);
                          try {
                            const response = await generateAgentSystemPrompt(
                              nodeConfig.name,
                              nodeConfig.description,
                              selectedNode.data.agent.stage || selectedNode.data.agent.category
                            );
                            if (response.success && response.data?.systemPrompt) {
                              setNodeConfig({
                                ...nodeConfig,
                                systemPrompt: response.data.systemPrompt,
                              });
                              toast({
                                title: 'System prompt regenerated',
                                status: 'success',
                                duration: 2000,
                                isClosable: true,
                              });
                            }
                          } catch (error) {
                            toast({
                              title: 'Failed to regenerate',
                              description: error.message,
                              status: 'error',
                              duration: 3000,
                              isClosable: true,
                            });
                          } finally {
                            setIsGeneratingPrompt(false);
                          }
                        }}
                      >
                        Regenerate
                      </Button>
                    )}
                  </HStack>
                  <Textarea
                    value={nodeConfig.systemPrompt}
                    onChange={(e) =>
                      setNodeConfig({ ...nodeConfig, systemPrompt: e.target.value })
                    }
                    rows={6}
                    fontSize="sm"
                    placeholder={
                      selectedNode?.data?.agent?.isBuiltin
                        ? "Built-in agent — pre-configured system prompts"
                        : selectedNode?.data?.agent?.isLibrary
                        ? "Library agent — pre-configured system prompts"
                        : "Define the agent's behavior..."
                    }
                    isReadOnly={selectedNode?.data?.agent?.isBuiltin || selectedNode?.data?.agent?.isLibrary}
                    bg={selectedNode?.data?.agent?.isBuiltin || selectedNode?.data?.agent?.isLibrary ? 'gray.50' : 'white'}
                  />
                  <Text fontSize="xs" color="gray.500" mt="4px">
                    {selectedNode?.data?.agent?.isBuiltin
                      ? 'Built-in agents have pre-configured system prompts (read-only)'
                      : selectedNode?.data?.agent?.isLibrary
                      ? 'Library agents have pre-configured system prompts (read-only)'
                      : 'The core instruction that defines this agent\'s behavior. Click "Regenerate" after changing the description.'}
                  </Text>
                </FormControl>
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
                  <Button
                    size="xs"
                    ml="8px"
                    onClick={async () => {
                      if (!newAgent.name?.trim()) {
                        toast({
                          title: 'Please enter agent name first',
                          status: 'warning',
                          duration: 2000,
                          isClosable: true,
                        });
                        return;
                      }
                      setIsGeneratingPrompt(true);
                      try {
                        const response = await generateAgentSystemPrompt(
                          newAgent.name,
                          newAgent.description || '',
                          newAgent.system === 'data' ? 'data_retriever' : 'custom_analyzer'
                        );
                        if (response.success && response.data?.systemPrompt) {
                          setNewAgent(prev => ({
                            ...prev,
                            systemPrompt: response.data.systemPrompt
                          }));
                          toast({
                            title: 'System prompt generated',
                            status: 'success',
                            duration: 2000,
                            isClosable: true,
                          });
                        }
                      } catch (error) {
                        toast({
                          title: 'Generation failed',
                          description: error.message,
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      } finally {
                        setIsGeneratingPrompt(false);
                      }
                    }}
                    isLoading={isGeneratingPrompt}
                    colorScheme="purple"
                    variant="outline"
                  >
                    {newAgent.systemPrompt ? 'Regenerate' : 'Generate'}
                  </Button>
                </FormLabel>
                <Textarea
                  value={newAgent.systemPrompt || ''}
                  onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                  placeholder="Will be auto-generated from name and description when you create the agent"
                  rows={6}
                  fontFamily="mono"
                  fontSize="xs"
                />
                <Text fontSize="xs" color="gray.500" mt="4px">
                  System prompt will be auto-generated if left empty
                </Text>
              </FormControl>

              {/* Progress Indicator */}
              {isGeneratingPrompt && (
                <Box>
                  <Alert status="info" borderRadius="8px" mb="8px">
                    <AlertIcon>
                      <Spinner size="sm" />
                    </AlertIcon>
                    <AlertDescription fontSize="sm" fontWeight="500">
                      Generating system prompt...
                    </AlertDescription>
                  </Alert>
                  <Progress
                    size="xs"
                    isIndeterminate
                    colorScheme="teal"
                    borderRadius="full"
                  />
                </Box>
              )}

              <Button
                colorScheme="teal"
                onClick={handleCreateAgent}
                size="lg"
                w="full"
                isLoading={isGeneratingPrompt}
                loadingText={isGeneratingPrompt ? 'Generating...' : 'Creating...'}
                isDisabled={isGeneratingPrompt}
              >
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
                          // Helper to detect what type of agent data is present
                          const detectDataType = (result) => {
                            if (!result) return null;

                            if (result.chart_data_by_symbol || result.chart_data) return 'candlestick';
                            if (result.earnings_data_by_symbol) return 'earnings';
                            if (result.news_data_by_symbol) return 'news';
                            if (result.technical_data_by_symbol) return 'technical';
                            if (result.fundamentals_data_by_symbol) return 'fundamentals';

                            // Custom agents - check if result has any data-like structure
                            // If it's an object with keys, treat as custom JSON
                            if (result && typeof result === 'object' && Object.keys(result).length > 0) {
                              return 'custom';
                            }

                            return null;
                          };

                          // Helper to extract data_by_symbol regardless of field name
                          const extractDataBySymbol = (result) => {
                            if (!result) return {};

                            // Try known agent-specific fields first
                            const knownField = result.chart_data_by_symbol ||
                                   result.earnings_data_by_symbol ||
                                   result.news_data_by_symbol ||
                                   result.technical_data_by_symbol ||
                                   result.fundamentals_data_by_symbol ||
                                   result.chart_data ||
                                   result.data?.chart_data_by_symbol ||
                                   result.result?.chart_data_by_symbol;

                            if (knownField) return knownField;

                            // For custom agents: look for any field ending in _by_symbol or _data
                            const symbolField = Object.keys(result).find(key =>
                              key.endsWith('_by_symbol') || key.endsWith('_data')
                            );
                            if (symbolField) return result[symbolField];

                            // If result looks like an AnalysisResponse (has analysis text + status), wrap it
                            // so the renderer can display the analysis text instead of iterating raw fields
                            if (result.analysis && result.status) {
                              return { _analysis: result };
                            }

                            // If no structured field found, return the entire result for custom rendering
                            // This handles arbitrary JSON from custom agents
                            return result;
                          };

                          // Earnings Data Renderer
                          const EarningsDataRenderer = ({ symbol, data }) => (
                            <Box p="16px" bg="white" borderRadius="12px" border="1px solid" borderColor="gray.200" mb="12px">
                              <VStack align="start" spacing="8px">
                                <HStack justify="space-between" w="full">
                                  <Text fontWeight="700" fontSize="md">{symbol}</Text>
                                  {data.security_type && (
                                    <Badge colorScheme="blue">{data.security_type}</Badge>
                                  )}
                                </HStack>

                                {data.name && (
                                  <Text fontSize="sm" color="gray.600">{data.name}</Text>
                                )}

                                {/* Financial Statements */}
                                {data.financial_statements && (
                                  <Box w="full">
                                    <Text fontWeight="600" fontSize="sm" mb="8px" color="teal.700">
                                      Financial Statements
                                    </Text>
                                    <SimpleGrid columns={3} spacing="8px" w="full">
                                      {data.financial_statements.income_statement && (
                                        <Box bg="gray.50" p="8px" borderRadius="6px">
                                          <Text fontSize="xs" fontWeight="600" mb="4px">Income Statement</Text>
                                          <VStack align="start" spacing="2px" fontSize="xs">
                                            <Text>Revenue: ${(data.financial_statements.income_statement.total_revenue / 1e9).toFixed(2)}B</Text>
                                            <Text>Net Income: ${(data.financial_statements.income_statement.net_income / 1e9).toFixed(2)}B</Text>
                                          </VStack>
                                        </Box>
                                      )}
                                      {data.financial_statements.balance_sheet && (
                                        <Box bg="gray.50" p="8px" borderRadius="6px">
                                          <Text fontSize="xs" fontWeight="600" mb="4px">Balance Sheet</Text>
                                          <VStack align="start" spacing="2px" fontSize="xs">
                                            <Text>Assets: ${(data.financial_statements.balance_sheet.total_assets / 1e9).toFixed(2)}B</Text>
                                            <Text>Cash: ${(data.financial_statements.balance_sheet.cash / 1e9).toFixed(2)}B</Text>
                                          </VStack>
                                        </Box>
                                      )}
                                      {data.financial_statements.cash_flow && (
                                        <Box bg="gray.50" p="8px" borderRadius="6px">
                                          <Text fontSize="xs" fontWeight="600" mb="4px">Cash Flow</Text>
                                          <VStack align="start" spacing="2px" fontSize="xs">
                                            <Text>Operating CF: ${(data.financial_statements.cash_flow.operating_cash_flow / 1e9).toFixed(2)}B</Text>
                                            <Text>Free CF: ${(data.financial_statements.cash_flow.free_cash_flow / 1e9).toFixed(2)}B</Text>
                                          </VStack>
                                        </Box>
                                      )}
                                    </SimpleGrid>
                                  </Box>
                                )}

                                {/* Key Metrics */}
                                {data.metrics && (
                                  <Box w="full">
                                    <Text fontWeight="600" fontSize="sm" mb="8px" color="teal.700">
                                      Key Metrics
                                    </Text>
                                    <SimpleGrid columns={2} spacing="6px">
                                      {Object.entries(data.metrics).slice(0, 8).map(([key, value]) => (
                                        <HStack key={key} justify="space-between" fontSize="xs" bg="gray.50" p="6px" borderRadius="4px">
                                          <Text color="gray.600">{key.replace(/_/g, ' ')}:</Text>
                                          <Text fontWeight="600">
                                            {typeof value === 'number'
                                              ? (value > 1e9 ? `$${(value / 1e9).toFixed(2)}B` : value.toLocaleString())
                                              : value}
                                          </Text>
                                        </HStack>
                                      ))}
                                    </SimpleGrid>
                                  </Box>
                                )}

                                {data.error && (
                                  <Alert status="error" fontSize="xs">
                                    <AlertIcon />
                                    {data.error}
                                  </Alert>
                                )}
                              </VStack>
                            </Box>
                          );

                          // News Data Renderer
                          const NewsDataRenderer = ({ symbol, data }) => (
                            <Box p="16px" bg="white" borderRadius="12px" border="1px solid" borderColor="gray.200" mb="12px">
                              <VStack align="start" spacing="8px">
                                <HStack justify="space-between" w="full">
                                  <Text fontWeight="700" fontSize="md">{symbol}</Text>
                                  <Badge colorScheme="purple">{data.total_articles || 0} articles</Badge>
                                </HStack>

                                {data.articles?.slice(0, 5).map((article, idx) => (
                                  <Box key={idx} p="12px" bg="gray.50" borderRadius="8px" w="full">
                                    <Text fontSize="sm" fontWeight="600" mb="4px" color="gray.800">
                                      {article.title}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600" noOfLines={2} mb="6px">
                                      {article.description || article.summary}
                                    </Text>
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text color="gray.500">{article.source}</Text>
                                      <Text color="gray.500">
                                        {new Date(article.publishedAt || article.date).toLocaleDateString()}
                                      </Text>
                                    </HStack>
                                  </Box>
                                ))}

                                {data.error && (
                                  <Alert status="error" fontSize="xs">
                                    <AlertIcon />
                                    {data.error}
                                  </Alert>
                                )}
                              </VStack>
                            </Box>
                          );

                          // Technical Indicators Renderer
                          const TechnicalDataRenderer = ({ symbol, data }) => (
                            <Box p="16px" bg="white" borderRadius="12px" border="1px solid" borderColor="gray.200" mb="12px">
                              <VStack align="start" spacing="8px">
                                <Text fontWeight="700" fontSize="md">{symbol}</Text>

                                {data.indicators && (
                                  <SimpleGrid columns={2} spacing="8px" w="full">
                                    {Object.entries(data.indicators).map(([indicator, value]) => (
                                      <Box key={indicator} p="10px" bg="teal.50" borderRadius="8px" border="1px solid" borderColor="teal.200">
                                        <Text fontSize="sm" fontWeight="600" color="teal.700" mb="2px">
                                          {indicator}
                                        </Text>
                                        <Text fontSize="xs" color="gray.700" fontFamily="monospace">
                                          {typeof value === 'object' ? JSON.stringify(value) : value}
                                        </Text>
                                      </Box>
                                    ))}
                                  </SimpleGrid>
                                )}

                                {data.error && (
                                  <Alert status="error" fontSize="xs">
                                    <AlertIcon />
                                    {data.error}
                                  </Alert>
                                )}
                              </VStack>
                            </Box>
                          );

                          // Fundamentals Renderer
                          const FundamentalsDataRenderer = ({ symbol, data }) => (
                            <Box p="16px" bg="white" borderRadius="12px" border="1px solid" borderColor="gray.200" mb="12px">
                              <VStack align="start" spacing="8px">
                                <Text fontWeight="700" fontSize="md">{symbol}</Text>

                                {data.fundamentals_text && (
                                  <Box bg="blue.50" p="12px" borderRadius="8px" w="full" border="1px solid" borderColor="blue.200">
                                    <Text fontSize="sm" whiteSpace="pre-wrap" color="gray.800">
                                      {data.fundamentals_text}
                                    </Text>
                                  </Box>
                                )}

                                {data.error && (
                                  <Alert status="error" fontSize="xs">
                                    <AlertIcon />
                                    {data.error}
                                  </Alert>
                                )}
                              </VStack>
                            </Box>
                          );

                          // Generic renderer for custom agents with arbitrary JSON output
                          const CustomAgentRenderer = ({ data, symbol = null }) => {
                            const renderValue = (value, depth = 0) => {
                              // Prevent infinite recursion
                              if (depth > 5) return <Text fontSize="xs" color="gray.500">[Max depth reached]</Text>;

                              // Handle null/undefined
                              if (value === null || value === undefined) {
                                return <Text fontSize="xs" color="gray.500">null</Text>;
                              }

                              // Handle primitives
                              if (typeof value !== 'object') {
                                return (
                                  <Text fontSize="xs" color="gray.800" fontFamily="monospace">
                                    {String(value)}
                                  </Text>
                                );
                              }

                              // Handle arrays
                              if (Array.isArray(value)) {
                                if (value.length === 0) return <Text fontSize="xs" color="gray.500">[]</Text>;

                                return (
                                  <VStack align="start" spacing="4px" pl="16px">
                                    {value.slice(0, 10).map((item, idx) => (
                                      <HStack key={idx} align="start" spacing="8px">
                                        <Badge colorScheme="gray" fontSize="9px">{idx}</Badge>
                                        {renderValue(item, depth + 1)}
                                      </HStack>
                                    ))}
                                    {value.length > 10 && (
                                      <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                        ... and {value.length - 10} more items
                                      </Text>
                                    )}
                                  </VStack>
                                );
                              }

                              // Handle objects
                              const entries = Object.entries(value);
                              if (entries.length === 0) return <Text fontSize="xs" color="gray.500">{'{}'}</Text>;

                              return (
                                <VStack align="start" spacing="4px" pl="16px" w="full">
                                  {entries.slice(0, 20).map(([key, val]) => (
                                    <Box key={key} w="full">
                                      <HStack align="start" spacing="8px">
                                        <Text fontSize="xs" fontWeight="600" color="purple.600" minW="120px">
                                          {key}:
                                        </Text>
                                        <Box flex="1">{renderValue(val, depth + 1)}</Box>
                                      </HStack>
                                    </Box>
                                  ))}
                                  {entries.length > 20 && (
                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                      ... and {entries.length - 20} more fields
                                    </Text>
                                  )}
                                </VStack>
                              );
                            };

                            return (
                              <Box p="16px" bg="white" borderRadius="12px" border="1px solid" borderColor="purple.200" mb="12px">
                                <VStack align="start" spacing="12px" w="full">
                                  <HStack justify="space-between" w="full">
                                    <Text fontWeight="700" fontSize="md" color="purple.700">
                                      {symbol || 'Custom Agent Output'}
                                    </Text>
                                    <Badge colorScheme="purple">Custom JSON</Badge>
                                  </HStack>

                                  <Box
                                    w="full"
                                    bg="purple.50"
                                    p="12px"
                                    borderRadius="8px"
                                    border="1px solid"
                                    borderColor="purple.200"
                                    maxH="600px"
                                    overflowY="auto"
                                  >
                                    {renderValue(data)}
                                  </Box>

                                  {/* Collapsible raw JSON view for debugging */}
                                  <details style={{ width: '100%' }}>
                                    <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#718096' }}>
                                      Show Raw JSON
                                    </summary>
                                    <Box
                                      mt="8px"
                                      bg="gray.100"
                                      p="12px"
                                      borderRadius="6px"
                                      maxH="300px"
                                      overflowY="auto"
                                      w="full"
                                    >
                                      <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {JSON.stringify(data, null, 2)}
                                      </pre>
                                    </Box>
                                  </details>
                                </VStack>
                              </Box>
                            );
                          };

                          console.log('[Sidebar Render] Full result:', displayResult);
                          console.log('[Sidebar Render] result keys:', displayResult && typeof displayResult === 'object' ? Object.keys(displayResult) : 'no result');

                          const dataType = detectDataType(displayResult);
                          const dataBySymbol = extractDataBySymbol(displayResult);

                          console.log('[Sidebar Render] Detected type:', dataType);
                          console.log('[Sidebar Render] Data by symbol keys:', Object.keys(dataBySymbol));

                          if (!dataBySymbol || Object.keys(dataBySymbol).length === 0) {
                            return (
                              <Box p="16px" bg="yellow.50" borderRadius="12px" border="1px solid" borderColor="yellow.200">
                                <VStack align="start" spacing="8px">
                                  <HStack>
                                    <Icon as={MdWarning} color="yellow.600" />
                                    <Text fontSize="sm" fontWeight="600" color="yellow.800">
                                      No Data Available
                                    </Text>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.600">
                                    The agent output doesn't contain expected data structure.
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" fontFamily="monospace">
                                    Looking for: *_data_by_symbol or chart_data
                                  </Text>
                                  <Divider />
                                  <Text fontSize="xs" fontWeight="600" color="gray.700">
                                    Raw Output (for debugging):
                                  </Text>
                                  <Box bg="gray.100" p="12px" borderRadius="8px" maxH="300px" overflowY="auto" w="full">
                                    <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                      {JSON.stringify(displayResult, null, 2)}
                                    </pre>
                                  </Box>
                                </VStack>
                              </Box>
                            );
                          }

                          return (
                            <VStack spacing="20px" align="stretch">
                              <HStack justify="space-between">
                                <Text fontSize="md" fontWeight="700" color="gray.800">
                                  {dataType === 'candlestick' && `Candlestick Charts (${Object.keys(dataBySymbol).length} symbols)`}
                                  {dataType === 'earnings' && `Earnings Data (${Object.keys(dataBySymbol).length} symbols)`}
                                  {dataType === 'news' && `News Articles (${Object.keys(dataBySymbol).length} symbols)`}
                                  {dataType === 'technical' && `Technical Analysis (${Object.keys(dataBySymbol).length} symbols)`}
                                  {dataType === 'fundamentals' && `Fundamentals (${Object.keys(dataBySymbol).length} symbols)`}
                                  {dataType === 'custom' && `Custom Agent Output`}
                                  {!dataType && `Agent Output`}
                                </Text>
                                <Badge colorScheme="purple" textTransform="capitalize">{dataType || 'unknown'}</Badge>
                              </HStack>

                              {Object.keys(dataBySymbol).map((symbol) => {
                                const symbolData = dataBySymbol[symbol];

                                // Skip null/undefined/primitive values to prevent Object.keys(null) crash
                                if (symbolData == null || typeof symbolData !== 'object') return null;

                                // Render based on detected agent type
                                if (dataType === 'candlestick') {
                                  // Keep existing candlestick chart rendering logic
                                  if (!symbolData?.candles || symbolData.candles.length === 0) {
                                    return (
                                      <Box key={symbol} p="16px" bg="gray.50" borderRadius="12px">
                                        <Text fontSize="sm" color="gray.600">
                                          No chart data available for {symbol}
                                        </Text>
                                      </Box>
                                    );
                                  }

                                  const candlestickSeries = [{
                                    data: symbolData.candles.map((candle) => ({
                                      x: new Date(candle.date),
                                      y: [candle.open, candle.high, candle.low, candle.close],
                                    })),
                                  }];

                                  const candlestickOptions = {
                                    chart: { type: 'candlestick', height: 350 },
                                    title: { text: `${symbol} - ${symbolData.timeframe || ''}`, align: 'left' },
                                    xaxis: { type: 'datetime' },
                                    yaxis: { tooltip: { enabled: true } },
                                  };

                                  return (
                                    <Box key={symbol} p="16px" bg="white" borderRadius="12px" border="1px solid" borderColor="gray.200">
                                      <Chart options={candlestickOptions} series={candlestickSeries} type="candlestick" height={350} />
                                    </Box>
                                  );
                                } else if (dataType === 'earnings') {
                                  return <EarningsDataRenderer key={symbol} symbol={symbol} data={symbolData} />;
                                } else if (dataType === 'news') {
                                  return <NewsDataRenderer key={symbol} symbol={symbol} data={symbolData} />;
                                } else if (dataType === 'technical') {
                                  return <TechnicalDataRenderer key={symbol} symbol={symbol} data={symbolData} />;
                                } else if (dataType === 'fundamentals') {
                                  return <FundamentalsDataRenderer key={symbol} symbol={symbol} data={symbolData} />;
                                } else if (dataType === 'custom') {
                                  // Handle AnalysisResponse wrapper — render analysis text directly
                                  if (symbol === '_analysis' && symbolData.analysis) {
                                    const analysisText = typeof symbolData.analysis === 'string'
                                      ? symbolData.analysis
                                      : JSON.stringify(symbolData.analysis, null, 2);
                                    return (
                                      <Box key={symbol} p="16px" bg="white" borderRadius="12px" border="1px solid" borderColor="purple.200" mb="12px">
                                        <VStack align="start" spacing="8px">
                                          <HStack>
                                            <Badge colorScheme="green">{symbolData.status || 'complete'}</Badge>
                                            {symbolData.agent_name && (
                                              <Text fontSize="xs" color="gray.500">Agent: {symbolData.agent_name}</Text>
                                            )}
                                            {symbolData.model && (
                                              <Text fontSize="xs" color="gray.500">Model: {symbolData.model}</Text>
                                            )}
                                          </HStack>
                                          <Box bg="gray.50" p="12px" borderRadius="8px" w="full" maxH="500px" overflowY="auto">
                                            <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5', fontFamily: 'inherit' }}>
                                              {analysisText}
                                            </pre>
                                          </Box>
                                        </VStack>
                                      </Box>
                                    );
                                  }

                                  // Custom agents - use generic JSON renderer
                                  // If dataBySymbol has multiple keys, render each separately
                                  // Otherwise render the whole result
                                  const isMultiSymbol = symbolData != null &&
                                                        typeof symbolData === 'object' &&
                                                        !Array.isArray(symbolData) &&
                                                        Object.keys(symbolData).length > 1;

                                  if (isMultiSymbol) {
                                    return <CustomAgentRenderer key={symbol} symbol={symbol} data={symbolData} />;
                                  } else {
                                    // Single output - render without symbol prefix
                                    return <CustomAgentRenderer key={symbol} data={symbolData} />;
                                  }
                                } else {
                                  // Fallback for truly unknown formats - show raw JSON
                                  return (
                                    <Box key={symbol} p="16px" bg="gray.100" borderRadius="12px" border="1px solid" borderColor="gray.300">
                                      <VStack align="start" spacing="8px">
                                        <HStack>
                                          <Icon as={MdWarning} color="orange.500" />
                                          <Text fontWeight="700" fontSize="md" color="gray.700">
                                            {symbol || 'Unknown Format'}
                                          </Text>
                                        </HStack>
                                        <Box bg="white" p="12px" borderRadius="8px" maxH="400px" overflowY="auto" w="full">
                                          <pre style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                            {JSON.stringify(symbolData, null, 2)}
                                          </pre>
                                        </Box>
                                      </VStack>
                                    </Box>
                                  );
                                }
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


      {/* Console Log Component */}
      <ConsoleLog ref={consoleLogRef} />

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
