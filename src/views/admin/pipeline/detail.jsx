/* eslint-disable */
import {
  Badge,
  Box,
  Button,
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
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// useMutation removed - now used in CustomAgentNode component
import {
  MdAccountBalance,
  MdAdd,
  MdArticle,
  MdClose,
  MdDelete,
  MdEdit,
  MdGroups,
  MdHome,
  MdHub,
  MdMoreVert,
  MdPlayArrow,
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
import teamApi from 'lib/teamApi';
import { CustomAgentNode } from 'components/pipeline/CustomAgentNode';

const BUILTIN_AGENTS = [
  // System 1: Data Pipeline Agents
  {
    id: 'candlestick',
    name: 'Candlestick',
    type: 'data_retriever',
    system: 'data',
    icon: MdShowChart,
    color: 'blue',
    isBuiltin: true,
  },
  {
    id: 'earnings',
    name: 'Earnings',
    type: 'data_retriever',
    system: 'data',
    icon: MdAccountBalance,
    color: 'green',
    isBuiltin: true,
  },
  {
    id: 'news',
    name: 'News',
    type: 'news_agent',
    system: 'data',
    icon: MdArticle,
    color: 'orange',
    isBuiltin: true,
  },
  {
    id: 'technical',
    name: 'Technical',
    type: 'technical_agent',
    system: 'data',
    icon: MdSpeed,
    color: 'purple',
    isBuiltin: true,
  },
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    type: 'financial_metrics',
    system: 'data',
    icon: MdAccountBalance,
    color: 'teal',
    isBuiltin: true,
  },
];

const DEFAULT_TEAMS = [
  {
    id: 'team1',
    name: 'Team 1: Analysts',
    description: 'Multi-perspective analysis team',
    agents: [],
  },
  {
    id: 'team2',
    name: 'Team 2: Researchers',
    description: 'Bull vs Bear debate team',
    agents: [
      {
        id: 'bull_researcher',
        name: 'Bull Researcher',
        type: 'researcher',
        system: 'team',
        teamId: 'team2',
        icon: MdTrendingUp,
        color: 'green',
        isBuiltin: true,
      },
      {
        id: 'bear_researcher',
        name: 'Bear Researcher',
        type: 'researcher',
        system: 'team',
        teamId: 'team2',
        icon: MdWarning,
        color: 'red',
        isBuiltin: true,
      },
      {
        id: 'research_manager',
        name: 'Research Manager',
        type: 'manager',
        system: 'team',
        teamId: 'team2',
        icon: MdSmartToy,
        color: 'purple',
        isBuiltin: true,
      },
    ],
  },
  {
    id: 'team3',
    name: 'Team 3: Risk Management',
    description: 'Position sizing and risk analysis',
    agents: [],
  },
  {
    id: 'team4',
    name: 'Team 4: Trader',
    description: 'Final decision and execution',
    agents: [],
  },
];

const AGENT_CATEGORIES = [
  { value: 'data_retriever', label: '📊 Data Retriever', system: 'data' },
  { value: 'news_agent', label: '📰 News Agent', system: 'data' },
  { value: 'technical_agent', label: '📈 Technical Agent', system: 'data' },
  { value: 'financial_metrics', label: '💰 Financial Metrics', system: 'data' },
  { value: 'api_connector', label: '🔗 API Connector', system: 'data' },
  { value: 'strategy_agent', label: '🎯 Strategy Agent', system: 'analyzer' },
  { value: 'risk_manager', label: '⚖️ Risk Manager', system: 'analyzer' },
  { value: 'custom_analyzer', label: '🤖 Custom Analyzer', system: 'analyzer' },
];

const MODELS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
];

const initialNodes = [];
const initialEdges = [];

// CustomAgentNode moved to components/pipeline/CustomAgentNode.jsx
// This component now uses useMutation hook for better loading state management
/*
function CustomAgentNode({ data, id, selected }) {
  const handlePlay = (e) => {
    e.stopPropagation();
    if (data.onPlay) {
      data.onPlay(id);
    }
  };

  const isLoading = data.isLoading || false;

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
          isLoading={isLoading}
          isDisabled={isLoading}
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
      >
        <HStack spacing="12px">
          <Icon as={data.agent?.icon || MdSmartToy} color={`${data.agent?.color || 'blue'}.600`} boxSize="24px" />
          <Text fontSize="md" fontWeight="700">
            {data.agent?.name || 'Agent'}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
*/

function CustomPortfolioNode({ data, id, selected }) {
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
            <IconButton
              icon={<Icon as={isExpanded ? MdClose : MdWarning} />}
              size="xs"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            />
          </HStack>

          <Badge colorScheme="teal" fontSize="xs">
            📤 Result
          </Badge>

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
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [availableAgents, setAvailableAgents] = useState([...BUILTIN_AGENTS]); // System 1 agents
  const [availableTeams, setAvailableTeams] = useState([...DEFAULT_TEAMS]); // System 2 teams
  const [customAgents, setCustomAgents] = useState([]);
  const [currentHorizonName, setCurrentHorizonName] = useState('');
  const [currentHorizonId, setCurrentHorizonId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isOpen: isAgentOpen, onOpen: onAgentOpen, onClose: onAgentClose } = useDisclosure();
  const { isOpen: isTeamOpen, onOpen: onTeamOpen, onClose: onTeamClose } = useDisclosure();
  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();
  const { isOpen: isPortfolioOpen, onOpen: onPortfolioOpen, onClose: onPortfolioClose } = useDisclosure();

  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    category: 'data_retriever',
    system: 'data',
    teamId: null,
    model: 'gpt-4',
  });

  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [editingAgent, setEditingAgent] = useState(null);
  const [tempHorizonName, setTempHorizonName] = useState('');
  const [showDataAgents, setShowDataAgents] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
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
  });

  const [draggingAgent, setDraggingAgent] = useState(null);

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
  
  // loadingNodes state removed - now managed internally by CustomAgentNode with useMutation

  useEffect(() => {
    if (!currentHorizonId || isLoading) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await request.put(`/horizons/${currentHorizonId}`, {
          name: currentHorizonName,
          nodes,
          edges,
        });
        console.log('[Auto-save] Horizon saved successfully');
      } catch (error) {
        console.error('[Auto-save] Failed to sync horizon to backend:', error);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [nodes, edges, currentHorizonName, currentHorizonId, isLoading]);

  const onConnect = useCallback(
    (params) => {
      console.log('[onConnect] Connection params:', params);
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
    },
    [setEdges]
  );

  useEffect(() => {
    const selected = nodes.find((node) => node.selected);
    if (selected && selected.type === 'agentNode') {
      setSelectedNode(selected);
      setNodeConfig({
        name: selected.data?.config?.name || selected.data?.agent?.name || '',
        description: selected.data?.config?.description || selected.data?.agent?.description || '',
        model: selected.data?.config?.model || 'gpt-4',
        temperature: selected.data?.config?.temperature || 0.7,
        maxTokens: selected.data?.config?.maxTokens || 2000,
      });
    } else if (selected && selected.type === 'portfolioNode') {
      setSelectedNode(selected);
      setPortfolioConfig({
        name: selected.data?.portfolio?.name || '',
        description: selected.data?.portfolio?.description || '',
      });
      setSelectedStocks(selected.data?.portfolio?.stocks || []);
    } else {
      setSelectedNode(null);
    }
  }, [nodes]);

  useEffect(() => {
    const handleKeyDown = (event) => {
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
        name: node.data?.agent?.name || '',
        description: node.data?.agent?.description || '',
        model: node.data?.config?.model || 'gpt-4',
        temperature: node.data?.config?.temperature || 0.7,
        maxTokens: node.data?.config?.maxTokens || 2000,
      });
    }
  }, []);

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

  // handleNodePlay is no longer needed - logic moved to CustomAgentNode component with useMutation hook
  /*
  const handleNodePlay = useCallback(async (nodeId) => {
    ...
  }, [getNodes, getEdges, setNodes, toast]);
  */

  const handleAgentMouseDown = useCallback(async (event, agent) => {
    event.preventDefault();
    
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const nodeId = `agent-${Date.now()}`;
    
    const newNode = {
      id: nodeId,
      type: 'agentNode',
      position,
      data: {
        agent: agent,
        onDelete: handleNodeDelete,
        // onPlay removed - now handled internally by CustomAgentNode with useMutation
        config: {
          name: agent.name,
          description: agent.description || '',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
        },
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setDraggingAgent(agent);
    setTempNodeId(nodeId);
    
    toast({
      title: 'Agent added',
      description: `${agent.name} added to pipeline`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });

  }, [screenToFlowPosition, setNodes, toast, handleNodeDelete]);

  const handlePortfolioMouseDown = useCallback((event, portfolio) => {
    event.preventDefault();

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const nodeId = `portfolio-${Date.now()}`;

    const newNode = {
      id: nodeId,
      type: 'portfolioNode',
      position,
      data: {
        portfolio: portfolio,
        onDelete: handleNodeDelete,
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setDraggingAgent(portfolio);
    setTempNodeId(nodeId);

    toast({
      title: 'Portfolio added',
      description: `${portfolio.name} data source added`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [screenToFlowPosition, setNodes, toast, handleNodeDelete]);

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
        description: newAgent.description.trim(),
        type: newAgent.category,
        system: newAgent.system,
        teamId: newAgent.teamId,
        model: newAgent.model,
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
          } else if (newAgent.system === 'team' && newAgent.teamId) {
            setAvailableTeams(availableTeams.map(team => {
              if (team.id === newAgent.teamId) {
                return {
                  ...team,
                  agents: team.agents.map(a => a.id === editingAgent.id ? updatedAgent : a),
                };
              }
              return team;
            }));
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
          } else if (newAgent.system === 'team' && newAgent.teamId) {
            setAvailableTeams(availableTeams.map(team => {
              if (team.id === newAgent.teamId) {
                return { ...team, agents: [...team.agents, createdAgent] };
              }
              return team;
            }));
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
        teamId: null,
        model: 'gpt-4',
      });
      setEditingAgent(null);
      onAgentClose();
    } catch (error) {
      console.error('[Agent] Save error:', error);
      toast({
        title: 'Failed to save agent',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddAgentToTeam = (teamId) => {
    setNewAgent({
      name: '',
      description: '',
      category: 'researcher',
      system: 'team',
      teamId: teamId,
      model: 'gpt-4',
    });
    onAgentOpen();
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) {
      toast({
        title: 'Team name required',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await teamApi.create(currentHorizonId, {
        name: newTeam.name,
        description: newTeam.description,
      });

      const team = response.data;
      setAvailableTeams([...availableTeams, team]);
      setNewTeam({ name: '', description: '' });
      onTeamClose();

      toast({
        title: 'Team created',
        description: `${team.name} added successfully`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('[Team] Save error:', error);
      toast({
        title: 'Failed to create team',
        description: error.message || 'An error occurred',
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
      
      // Remove from teams in local state (use 'id' not '_id')
      setAvailableTeams(availableTeams.map(team => ({
        ...team,
        agents: team.agents.filter(a => a.id !== agentId),
      })));

      // Also remove from availableAgents (data agents) if it's there
      setAvailableAgents(availableAgents.filter(a => a.id !== agentId));
      
      // Remove any nodes using this agent
      setNodes((nds) => nds.filter(node => {
        if ((node.type === 'agent' || node.type === 'teamAgent') && node.data?.agentId === agentId) {
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

  const handleDeleteTeam = async (teamId) => {
    try {
      await teamApi.delete(teamId);
      
      // Remove from local state (use 'id' not '_id')
      setAvailableTeams(availableTeams.filter(t => t.id !== teamId));
      
      // Remove any nodes using this team
      setNodes((nds) => nds.filter(node => {
        if (node.type === 'team' && node.data?.teamId === teamId) {
          return false;
        }
        // Also remove team agents from this team
        if (node.type === 'teamAgent' && node.data?.teamId === teamId) {
          return false;
        }
        return true;
      }));

      toast({
        title: 'Team deleted',
        description: 'Team and its agents have been removed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('[Team] Delete error:', error);
      toast({
        title: 'Failed to delete team',
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
            data: {
              ...node.data,
              config: nodeConfig,
            },
          };
        }
        return node;
      })
    );

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

  // Load horizon data from backend on mount
  useEffect(() => {
    const loadHorizon = async () => {
      try {
        setIsLoading(true);
        const result = await request.get(`/horizons/${id}`);
        if (result.success && result.data) {
          const horizon = result.data;
          console.log('[PipelineDetail] Loaded horizon:', horizon);
          console.log('[PipelineDetail] Horizon ID:', horizon.id, 'URL ID:', id);
          setNodes(horizon.nodes || []);
          setEdges(horizon.edges || []);
          
          // Merge builtin data agents with custom agents from API
          const loadedDataAgents = horizon.agents || horizon.availableAgents || [];
          const customDataAgents = loadedDataAgents.filter(a => !a.isBuiltin);
          const mergedDataAgents = [...BUILTIN_AGENTS, ...customDataAgents];
          setAvailableAgents(mergedDataAgents);
          
          // Merge builtin teams with custom teams from API
          const loadedTeams = horizon.teams || horizon.availableTeams || [];
          const customTeams = loadedTeams.filter(t => !t.id?.startsWith('team'));
          
          // Merge: keep builtin teams structure, add custom teams, populate agents
          const mergedTeams = DEFAULT_TEAMS.map(builtinTeam => {
            // Find if there are custom team agents for this builtin team
            const customTeamAgents = loadedTeams
              .find(t => t.id === builtinTeam.id)?.agents?.filter(a => !a.isBuiltin) || [];
            
            return {
              ...builtinTeam,
              agents: [...builtinTeam.agents, ...customTeamAgents],
            };
          });
          
          // Add fully custom teams
          setAvailableTeams([...mergedTeams, ...customTeams]);
          
          setCustomAgents(horizon.customAgents || []);
          setCurrentHorizonName(horizon.name);
          setCurrentHorizonId(horizon.id);
          setPortfolios(horizon.portfolios || []);
        }
      } catch (error) {
        console.error('Failed to load horizon:', error);
        toast({
          title: 'Failed to load horizon',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        // Redirect back to list if horizon not found
        navigate('/pipeline');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      loadHorizon();
    }
  }, [id, navigate, toast]);

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
                  setNewAgent({ name: '', description: '', category: 'data_retriever', system: 'data', teamId: null, model: 'gpt-4' });
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
                    <Icon as={agent.icon} color={`${agent.color}.600`} boxSize="20px" />
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
                              teamId: agent.teamId,
                              model: agent.model,
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

        {/* 4. Teams - with Dropdown */}
        <Box
          position="relative"
          onMouseEnter={() => setShowTeams(true)}
          onMouseLeave={() => setShowTeams(false)}
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
            <Tooltip label="Teams" placement="right" hasArrow>
              <Icon as={MdGroups} color="purple.600" boxSize="24px" />
            </Tooltip>
            <Tooltip label="Add team" placement="right" hasArrow>
              <IconButton
                icon={<Icon as={MdAdd} />}
                size="xs"
                variant="ghost"
                colorScheme="purple"
                aria-label="Add team"
                onClick={(e) => {
                  e.stopPropagation();
                  onTeamOpen();
                }}
              />
            </Tooltip>
          </HStack>

          {/* Teams Dropdown - Positioned to the right */}
          {showTeams && (
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
              {availableTeams.map((team) => (
                <VStack key={team.id} align="stretch" spacing="6px" w="full">
                  <HStack justify="space-between" px="8px">
                    <Text fontSize="xs" fontWeight="700" color="purple.700">
                      {team.name}
                    </Text>
                    <HStack spacing="2px">
                      <IconButton
                        icon={<Icon as={MdAdd} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="purple"
                        aria-label="Add agent to team"
                        onClick={() => handleAddAgentToTeam(team.id)}
                      />
                      {/* Only show delete for custom teams (not builtin) */}
                      {!team.id?.startsWith('team') && (
                        <IconButton
                          icon={<Icon as={MdDelete} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Delete team"
                          onClick={() => {
                            if (window.confirm(`Delete team "${team.name}" and all its agents?`)) {
                              handleDeleteTeam(team.id);
                            }
                          }}
                        />
                      )}
                    </HStack>
                  </HStack>
                  {team.agents.length > 0 ? (
                    team.agents.map((agent) => (
                      <HStack
                        key={agent.id}
                        p="10px"
                        bg="white"
                        borderRadius="8px"
                        border="1px solid"
                        borderColor="gray.200"
                        _hover={{ bg: 'purple.50', borderColor: 'purple.400', boxShadow: 'sm' }}
                        spacing="8px"
                      >
                        <HStack
                          flex="1"
                          spacing="10px"
                          cursor="grab"
                          _active={{ cursor: 'grabbing' }}
                          onMouseDown={(e) => handleAgentMouseDown(e, agent)}
                        >
                          <Icon as={agent.icon} color={`${agent.color}.600`} boxSize="20px" />
                          <Text fontSize="sm" fontWeight="600" flex="1">
                            {agent.name}
                          </Text>
                          {agent.isBuiltin && (
                            <Badge colorScheme="purple" fontSize="xs">
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
                                    teamId: agent.teamId,
                                    model: agent.model,
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
                    ))
                  ) : (
                    <Text fontSize="xs" color="gray.500" px="8px" py="4px">
                      No agents yet
                    </Text>
                  )}
                  <Divider />
                </VStack>
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
          onNodeDoubleClick={handleNodeDoubleClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          minZoom={0.1}
          maxZoom={2}
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

      {/* Right Side Configuration Panel */}
      {selectedNode && selectedNode.type === 'agentNode' && (
        <Box
          position="absolute"
          right="0"
          top="0"
          h="100vh"
          w="33.33%"
          bg="white"
          borderLeft="2px solid"
          borderColor="gray.200"
          overflowY="auto"
          zIndex="20"
          boxShadow="xl"
        >
          <VStack spacing="0" align="stretch" h="full">
            {/* Header */}
            <Box
              p="20px"
              borderBottom="2px solid"
              borderColor="gray.200"
              bg="teal.50"
            >
              <HStack justify="space-between" mb="8px">
                <HStack spacing="10px">
                  <Icon as={MdSmartToy} color="teal.600" boxSize="24px" />
                  <Text fontSize="lg" fontWeight="bold" color="teal.900" noOfLines={1}>
                    {nodeConfig.name || 'Node Configuration'}
                  </Text>
                </HStack>
                <IconButton
                  icon={<Icon as={MdClose} />}
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  aria-label="Close panel"
                  onClick={() => {
                    setNodes((nds) =>
                      nds.map((n) => ({ ...n, selected: false }))
                    );
                  }}
                />
              </HStack>
              <Text fontSize="xs" color="teal.700">
                Configure settings for this agent
              </Text>
            </Box>

            {/* Configuration Form */}
            <Box flex="1" p="20px">
              <VStack spacing="20px" align="stretch">
                {/* Node ID */}
                <Box>
                  <Text fontSize="xs" color="gray.500" mb="4px">
                    Node ID
                  </Text>
                  <Badge colorScheme="gray" fontSize="xs">
                    {selectedNode.id}
                  </Badge>
                </Box>

                {/* Name */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Agent Name
                  </FormLabel>
                  <Input
                    placeholder="Enter agent name"
                    value={nodeConfig.name}
                    onChange={(e) =>
                      setNodeConfig({ ...nodeConfig, name: e.target.value })
                    }
                    size="sm"
                  />
                </FormControl>

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

                {/* AI Model */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    AI Model
                  </FormLabel>
                  <Select
                    value={nodeConfig.model}
                    onChange={(e) =>
                      setNodeConfig({ ...nodeConfig, model: e.target.value })
                    }
                    size="sm"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </Select>
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
              </VStack>
            </Box>

            {/* Footer with Save Button */}
            <Box
              p="20px"
              borderTop="2px solid"
              borderColor="gray.200"
              bg="gray.50"
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
      )}

      {/* Portfolio Configuration Panel - Simple version without stock list */}
      {selectedNode && selectedNode.type === 'portfolioNode' && (
        <Box
          position="absolute"
          right="0"
          top="0"
          h="100vh"
          w="33.33%"
          bg="white"
          borderLeft="2px solid"
          borderColor="gray.200"
          overflowY="auto"
          zIndex="20"
          boxShadow="xl"
        >
          <VStack spacing="0" align="stretch" h="full">
            {/* Header */}
            <Box
              p="20px"
              borderBottom="2px solid"
              borderColor="gray.200"
              bg="green.50"
            >
              <HStack justify="space-between" mb="8px">
                <HStack spacing="10px">
                  <Icon as={MdShowChart} color="green.600" boxSize="24px" />
                  <Text fontSize="lg" fontWeight="bold" color="green.900" noOfLines={1}>
                    {portfolioConfig.name || 'Portfolio Configuration'}
                  </Text>
                </HStack>
                <IconButton
                  icon={<Icon as={MdClose} />}
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  aria-label="Close panel"
                  onClick={() => {
                    setNodes((nds) =>
                      nds.map((n) => ({ ...n, selected: false }))
                    );
                  }}
                />
              </HStack>
              <Text fontSize="xs" color="green.700">
                Configure settings for this portfolio
              </Text>
            </Box>

            {/* Configuration Form */}
            <Box flex="1" p="20px">
              <VStack spacing="20px" align="stretch">
                {/* Node ID */}
                <Box>
                  <Text fontSize="xs" color="gray.500" mb="4px">
                    Node ID
                  </Text>
                  <Badge colorScheme="gray" fontSize="xs">
                    {selectedNode.id}
                  </Badge>
                </Box>

                {/* Portfolio Name */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Portfolio Name
                  </FormLabel>
                  <Input
                    placeholder="Enter portfolio name"
                    value={portfolioConfig.name}
                    onChange={(e) =>
                      setPortfolioConfig({ ...portfolioConfig, name: e.target.value })
                    }
                    size="sm"
                  />
                </FormControl>

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

                    if (existingPortfolio && existingPortfolio.id && existingPortfolio.id.match(/^[0-9a-fA-F]{24}$/)) {
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
                  Category
                </FormLabel>
                <Select
                  value={newAgent.category}
                  onChange={(e) => setNewAgent({ ...newAgent, category: e.target.value })}
                >
                  {AGENT_CATEGORIES.filter(c => c.system === newAgent.system).map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Model
                </FormLabel>
                <Select
                  value={newAgent.model}
                  onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                >
                  {MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Button colorScheme="teal" onClick={handleCreateAgent} size="lg" w="full">
                {editingAgent ? 'Update Agent' : 'Create Agent'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Create Team Modal */}
      <Modal isOpen={isTeamOpen} onClose={onTeamClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="20px">
          <ModalCloseButton />
          <ModalHeader>Create Team</ModalHeader>

          <ModalBody pb="20px">
            <VStack spacing="15px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Team Name
                </FormLabel>
                <Input
                  placeholder="e.g., Risk Analysts"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  autoFocus
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  Description
                </FormLabel>
                <Textarea
                  placeholder="What does this team do?"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  rows={2}
                />
              </FormControl>

              <Button colorScheme="purple" onClick={handleCreateTeam} size="md" w="full">
                Create Team
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
