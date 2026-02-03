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
import {
  MdAccountBalance,
  MdAdd,
  MdArticle,
  MdDelete,
  MdEdit,
  MdGroups,
  MdHome,
  MdHub,
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
  MiniMap,
  Panel,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Built-in agents organized by system
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

// System 2: Default Teams with their agents
const DEFAULT_TEAMS = [
  {
    id: 'team1',
    name: 'Team 1: Analysts',
    description: 'Multi-perspective analysis team',
    agents: [
      // Placeholder - to be implemented
    ],
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
    agents: [
      // Placeholder - to be implemented
    ],
  },
  {
    id: 'team4',
    name: 'Team 4: Trader',
    description: 'Final decision and execution',
    agents: [
      // Placeholder - to be implemented
    ],
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

export default function PipelineBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [availableAgents, setAvailableAgents] = useState([...BUILTIN_AGENTS]); // System 1 agents
  const [availableTeams, setAvailableTeams] = useState([...DEFAULT_TEAMS]); // System 2 teams
  const [customAgents, setCustomAgents] = useState([]);
  const [savedHorizons, setSavedHorizons] = useState([]);
  const [currentHorizonName, setCurrentHorizonName] = useState('');
  const [showHomeView, setShowHomeView] = useState(true); // Show home view by default

  const { isOpen: isAgentOpen, onOpen: onAgentOpen, onClose: onAgentClose } = useDisclosure();
  const { isOpen: isTeamOpen, onOpen: onTeamOpen, onClose: onTeamClose } = useDisclosure();
  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();

  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    category: 'data_retriever',
    system: 'data',
    teamId: null,
    model: 'gpt-4',
  });

  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [editingAgent, setEditingAgent] = useState(null); // Track which agent is being edited
  const [selectedTeamForAgent, setSelectedTeamForAgent] = useState(null); // Track which team to add agent to
  const [horizonName, setHorizonName] = useState('');
  const [isEditingHorizonName, setIsEditingHorizonName] = useState(false);
  const [tempHorizonName, setTempHorizonName] = useState('');
  const [showDataAgents, setShowDataAgents] = useState(false);
  const [showTeams, setShowTeams] = useState(false);

  const toast = useToast();

  // Auto-save functionality
  useEffect(() => {
    // Don't auto-save if canvas is empty and no agents
    if (nodes.length === 0 && edges.length === 0 && availableAgents.length === BUILTIN_AGENTS.length) return;

    // Auto-save the current state
    const saveTimeout = setTimeout(() => {
      const horizonName = currentHorizonName || 'Untitled';

      // Find existing horizon with this name
      const existingIndex = savedHorizons.findIndex(h => h.name === horizonName);

      const horizon = {
        id: existingIndex >= 0 ? savedHorizons[existingIndex].id : Date.now(),
        name: horizonName,
        nodes,
        edges,
        availableAgents, // System 1: Data Pipeline agents
        availableTeams, // System 2: Team Network
        customAgents,
        savedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Update existing horizon
        const updated = [...savedHorizons];
        updated[existingIndex] = horizon;
        setSavedHorizons(updated);
      } else {
        // Add new horizon
        setSavedHorizons([...savedHorizons, horizon]);
        setCurrentHorizonName(horizonName);
      }
    }, 1000); // Debounce auto-save by 1 second

    return () => clearTimeout(saveTimeout);
  }, [nodes, edges, availableAgents, availableTeams, customAgents]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Delete selected nodes with keyboard (Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Find selected nodes
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          // Prevent deleting fixed nodes (data-pipeline, team nodes)
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

  // Drag and drop handlers
  const onDragStart = (event, agent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(agent));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const agent = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      const position = {
        x: event.clientX - 280,
        y: event.clientY - 100,
      };

      const nodeId = `agent-${Date.now()}`;
      
      const newNode = {
        id: nodeId,
        type: 'default',
        position,
        data: {
          label: (
            <Box
              p="15px"
              bg="white"
              borderRadius="12px"
              border="3px solid"
              borderColor={`${agent.color}.400`}
              boxShadow="lg"
              minW="150px"
            >
              <HStack spacing="10px" mb="8px">
                <Icon as={agent.icon} color={`${agent.color}.600`} boxSize="20px" />
                <Text fontSize="sm" fontWeight="700">
                  {agent.name}
                </Text>
              </HStack>
              <Badge colorScheme={agent.color} fontSize="xs">
                {agent.isBuiltin ? 'Built-in' : 'Custom'}
              </Badge>
            </Box>
          ),
        },
      };

      setNodes((nds) => nds.concat(newNode));
      toast({
        title: 'Agent added',
        description: `${agent.name} added to pipeline`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    [setNodes, toast]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Create custom agent
  const handleCreateAgent = () => {
    if (!newAgent.name.trim()) {
      toast({
        title: 'Name required',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (editingAgent) {
      // Update existing agent
      const updatedAgent = {
        ...editingAgent,
        name: newAgent.name,
        description: newAgent.description,
        type: newAgent.category,
        system: newAgent.system,
        teamId: newAgent.teamId,
        model: newAgent.model,
        color: newAgent.system === 'data' ? 'blue' : 'pink',
      };

      if (newAgent.system === 'data') {
        setAvailableAgents(availableAgents.map(a => a.id === editingAgent.id ? updatedAgent : a));
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
      setCustomAgents(customAgents.map(a => a.id === editingAgent.id ? updatedAgent : a));

      toast({
        title: 'Agent updated',
        description: `${updatedAgent.name} has been updated`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } else {
      // Create new agent
      const agent = {
        id: `custom-${Date.now()}`,
        name: newAgent.name,
        description: newAgent.description,
        type: newAgent.category,
        system: newAgent.system,
        teamId: newAgent.teamId,
        icon: MdSmartToy,
        color: newAgent.system === 'data' ? 'blue' : 'purple',
        isBuiltin: false,
        model: newAgent.model,
      };

      if (newAgent.system === 'data') {
        // Add to data agents
        setAvailableAgents([...availableAgents, agent]);
      } else if (newAgent.system === 'team' && newAgent.teamId) {
        // Add to specific team
        setAvailableTeams(availableTeams.map(team => {
          if (team.id === newAgent.teamId) {
            return { ...team, agents: [...team.agents, agent] };
          }
          return team;
        }));
      }

      setCustomAgents([...customAgents, agent]);

      toast({
        title: 'Agent created',
        description: `${agent.name} added`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }

    setNewAgent({
      name: '',
      description: '',
      category: 'data_retriever',
      system: 'data',
      teamId: null,
      model: 'gpt-4',
    });
    setEditingAgent(null);
    setSelectedTeamForAgent(null);
    onAgentClose();
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setNewAgent({
      name: agent.name,
      description: agent.description || '',
      category: agent.type,
      system: agent.system,
      teamId: agent.teamId || null,
      model: agent.model || 'gpt-4',
    });
    onAgentOpen();
  };

  const handleAddAgentToTeam = (teamId) => {
    setSelectedTeamForAgent(teamId);
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

  const handleCreateTeam = () => {
    if (!newTeam.name.trim()) {
      toast({
        title: 'Team name required',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const team = {
      id: `team-${Date.now()}`,
      name: newTeam.name,
      description: newTeam.description,
      agents: [],
    };

    setAvailableTeams([...availableTeams, team]);
    setNewTeam({ name: '', description: '' });
    onTeamClose();

    toast({
      title: 'Team created',
      description: `${team.name} added`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };


  const handleDeleteAgent = (agentId) => {
    setAvailableAgents(availableAgents.filter(a => a.id !== agentId));
    setCustomAgents(customAgents.filter(a => a.id !== agentId));
    toast({
      title: 'Agent deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleStartEditingName = () => {
    setTempHorizonName(currentHorizonName || 'Untitled');
    onRenameOpen();
  };

  const handleSaveHorizonName = () => {
    const newName = tempHorizonName.trim();
    if (!newName) {
      onRenameClose();
      return;
    }

    const oldName = currentHorizonName || 'Untitled';
    const existingIndex = savedHorizons.findIndex(h => h.name === oldName);

    if (existingIndex >= 0) {
      const updated = [...savedHorizons];
      updated[existingIndex] = { ...updated[existingIndex], name: newName };
      setSavedHorizons(updated);
    }

    setCurrentHorizonName(newName);
    onRenameClose();

    toast({
      title: 'Renamed',
      status: 'success',
      duration: 1500,
      isClosable: true,
    });
  };

  const handleLoadHorizon = (horizon) => {
    setNodes(horizon.nodes);
    setEdges(horizon.edges);
    setAvailableAgents(horizon.availableAgents || [...BUILTIN_AGENTS]);
    setAvailableTeams(horizon.availableTeams || [...DEFAULT_TEAMS]);
    setCustomAgents(horizon.customAgents || []);
    setCurrentHorizonName(horizon.name);
    setShowHomeView(false); // Exit home view when loading a horizon

    toast({
      title: 'Horizon loaded',
      description: `${horizon.name} is now active`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteHorizon = (horizonId) => {
    setSavedHorizons(savedHorizons.filter(h => h.id !== horizonId));
    toast({
      title: 'Horizon deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleNewHorizon = () => {
    const newHorizonName = `Untitled ${savedHorizons.length + 1}`;

    // Create and immediately save the new horizon
    const newHorizon = {
      id: Date.now(),
      name: newHorizonName,
      nodes: [],
      edges: [],
      availableAgents: [...BUILTIN_AGENTS],
      availableTeams: [...DEFAULT_TEAMS],
      customAgents: [],
      savedAt: new Date().toISOString(),
    };

    setSavedHorizons([...savedHorizons, newHorizon]);

    setNodes([]);
    setEdges([]);
    setAvailableAgents([...BUILTIN_AGENTS]);
    setAvailableTeams([...DEFAULT_TEAMS]);
    setCustomAgents([]);
    setCurrentHorizonName(newHorizonName);
    setShowHomeView(false);

    toast({
      title: 'New horizon created',
      description: newHorizonName,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Home View - Show all horizons
  if (showHomeView) {
    return (
      <Box h="100vh" bg="gray.50" p="40px">
        <VStack spacing="30px" maxW="1200px" mx="auto">
          {/* Header */}
          <HStack justify="space-between" w="full">
            <VStack align="start" spacing="5px">
              <HStack spacing="12px">
                <Icon as={MdHub} color="teal.600" boxSize="32px" />
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                  Horizons
                </Text>
              </HStack>
              <Text fontSize="md" color="gray.600">
                Select a horizon to work on or create a new one
              </Text>
            </VStack>
            <Button
              leftIcon={<Icon as={MdAdd} />}
              colorScheme="teal"
              size="lg"
              onClick={handleNewHorizon}
            >
              New Horizon
            </Button>
          </HStack>

          {/* Horizons Grid */}
          {savedHorizons.length === 0 ? (
            <Box
              w="full"
              py="80px"
              textAlign="center"
              bg="white"
              borderRadius="16px"
              border="2px dashed"
              borderColor="gray.300"
            >
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
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
              gap="20px"
              w="full"
            >
              {savedHorizons.map((horizon) => (
                <Box
                  key={horizon.id}
                  p="20px"
                  bg="white"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="gray.200"
                  cursor="pointer"
                  _hover={{ borderColor: 'teal.400', boxShadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                  onClick={() => handleLoadHorizon(horizon)}
                >
                  <HStack justify="space-between" mb="12px">
                    <HStack spacing="10px">
                      <Icon as={MdHub} color="teal.600" boxSize="24px" />
                      <Text fontSize="lg" fontWeight="bold" color="gray.800" noOfLines={1}>
                        {horizon.name}
                      </Text>
                    </HStack>
                    <IconButton
                      icon={<Icon as={MdDelete} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHorizon(horizon.id);
                      }}
                    />
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb="12px">
                    Last modified: {new Date(horizon.savedAt).toLocaleDateString()}
                  </Text>
                  <HStack spacing="8px">
                    <Badge colorScheme="blue" fontSize="xs">
                      {horizon.nodes?.length || 0} nodes
                    </Badge>
                    <Badge colorScheme="purple" fontSize="xs">
                      {horizon.availableAgents?.length || 0} agents
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </Box>
          )}
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

        {/* 2. Data Agents - with Dropdown */}
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
                <Box
                  key={agent.id}
                  p="10px"
                  bg="white"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                  cursor="grab"
                  _hover={{ bg: 'blue.50', borderColor: 'blue.400', boxShadow: 'sm' }}
                  draggable
                  onDragStart={(e) => onDragStart(e, agent)}
                  w="full"
                >
                  <HStack spacing="10px">
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
                </Box>
              ))}
              </VStack>
            </Box>
          )}
        </Box>

        {/* 3. Teams - with Dropdown */}
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
                    <IconButton
                      icon={<Icon as={MdAdd} />}
                      size="xs"
                      variant="ghost"
                      colorScheme="purple"
                      aria-label="Add agent to team"
                      onClick={() => handleAddAgentToTeam(team.id)}
                    />
                  </HStack>
                  {team.agents.length > 0 ? (
                    team.agents.map((agent) => (
                      <Box
                        key={agent.id}
                        p="10px"
                        bg="white"
                        borderRadius="8px"
                        border="1px solid"
                        borderColor="gray.200"
                        cursor="grab"
                        _hover={{ bg: 'purple.50', borderColor: 'purple.400', boxShadow: 'sm' }}
                        draggable
                        onDragStart={(e) => onDragStart(e, agent)}
                      >
                        <HStack spacing="10px">
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
                      </Box>
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
      <Box h="100%">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={16} size={1} />
          
          {/* Bottom hint text */}
          <Panel position="bottom-center">
            <Box
              bg="whiteAlpha.900"
              backdropFilter="blur(10px)"
              borderRadius="8px"
              px="12px"
              py="6px"
              border="1px solid"
              borderColor="whiteAlpha.400"
              boxShadow="sm"
            >
              <Text fontSize="xs" color="gray.600">
                💡 Select nodes and press <Badge colorScheme="gray" fontSize="2xs">Delete</Badge> or <Badge colorScheme="gray" fontSize="2xs">Backspace</Badge> to remove them
              </Text>
            </Box>
          </Panel>

          <Panel position="top-right">
            <Tooltip label="Back to Horizons" placement="left" hasArrow>
              <IconButton
                icon={<Icon as={MdHome} />}
                size="md"
                colorScheme="teal"
                variant="solid"
                aria-label="Back to horizons"
                onClick={() => setShowHomeView(true)}
                boxShadow="lg"
              />
            </Tooltip>
          </Panel>
        </ReactFlow>
      </Box>

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

    </Box>
  );
}
