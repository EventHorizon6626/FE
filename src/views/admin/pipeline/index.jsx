import { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Badge,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
  Tooltip,
  Textarea,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdShowChart,
  MdArticle,
  MdSpeed,
  MdAccountBalance,
  MdTrendingUp,
  MdWarning,
  MdSave,
  MdDelete,
  MdGroups,
  MdDataset,
  MdHub,
  MdSmartToy,
} from 'react-icons/md';

// Built-in agents
const BUILTIN_AGENTS = [
  {
    id: 'candlestick',
    name: 'Candlestick Agent',
    type: 'data_retriever',
    system: 'data',
    icon: MdShowChart,
    color: 'blue',
    isBuiltin: true,
  },
  {
    id: 'earnings',
    name: 'Earnings Agent',
    type: 'data_retriever',
    system: 'data',
    icon: MdAccountBalance,
    color: 'green',
    isBuiltin: true,
  },
  {
    id: 'news',
    name: 'News Agent',
    type: 'news_agent',
    system: 'data',
    icon: MdArticle,
    color: 'orange',
    isBuiltin: true,
  },
  {
    id: 'technical',
    name: 'Technical Agent',
    type: 'technical_agent',
    system: 'data',
    icon: MdSpeed,
    color: 'purple',
    isBuiltin: true,
  },
  {
    id: 'fundamentals',
    name: 'Fundamentals Agent',
    type: 'financial_metrics',
    system: 'data',
    icon: MdAccountBalance,
    color: 'teal',
    isBuiltin: true,
  },
  {
    id: 'bull_researcher',
    name: 'Bull Researcher',
    type: 'strategy_agent',
    system: 'analyzer',
    icon: MdTrendingUp,
    color: 'green',
    isBuiltin: true,
  },
  {
    id: 'bear_researcher',
    name: 'Bear Researcher',
    type: 'strategy_agent',
    system: 'analyzer',
    icon: MdWarning,
    color: 'red',
    isBuiltin: true,
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

// Initial pipeline structure
const initialNodes = [
  // Event Horizon Data Pipeline (unified System 1)
  {
    id: 'data-pipeline',
    type: 'default',
    position: { x: 250, y: 100 },
    data: {
      label: (
        <Box
          p="30px"
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          borderRadius="16px"
          boxShadow="xl"
          minW="350px"
        >
          <HStack spacing="12px" mb="8px">
            <Icon as={MdDataset} color="white" boxSize="28px" />
            <Text fontSize="lg" fontWeight="bold" color="white">
              Event Horizon Data Pipeline
            </Text>
          </HStack>
          <Text fontSize="xs" color="whiteAlpha.800" mb="12px">
            Stage 1 → Stage 2 → Stage 3 (Unified)
          </Text>
          <HStack spacing="8px">
            <Badge colorScheme="purple" bg="whiteAlpha.300" color="white" fontSize="xs">
              5 Built-in Agents
            </Badge>
            <Badge colorScheme="purple" bg="whiteAlpha.300" color="white" fontSize="xs">
              Drop custom agents here
            </Badge>
          </HStack>
        </Box>
      ),
    },
    draggable: false,
  },
  // Analyzer Network (System 2) - Default Teams
  {
    id: 'team1',
    type: 'default',
    position: { x: 100, y: 350 },
    data: {
      label: (
        <Box
          p="20px"
          bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          borderRadius="12px"
          boxShadow="lg"
          minW="140px"
        >
          <HStack spacing="8px" mb="6px">
            <Icon as={MdGroups} color="white" boxSize="20px" />
            <Text fontSize="sm" fontWeight="bold" color="white">
              Analysts
            </Text>
          </HStack>
          <Badge bg="whiteAlpha.300" color="white" fontSize="2xs">
            Team 1
          </Badge>
        </Box>
      ),
    },
  },
  {
    id: 'team2',
    type: 'default',
    position: { x: 280, y: 350 },
    data: {
      label: (
        <Box
          p="20px"
          bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          borderRadius="12px"
          boxShadow="lg"
          minW="140px"
        >
          <HStack spacing="8px" mb="6px">
            <Icon as={MdGroups} color="white" boxSize="20px" />
            <Text fontSize="sm" fontWeight="bold" color="white">
              Researchers
            </Text>
          </HStack>
          <Badge bg="whiteAlpha.300" color="white" fontSize="2xs">
            Team 2
          </Badge>
        </Box>
      ),
    },
  },
  {
    id: 'team3',
    type: 'default',
    position: { x: 460, y: 350 },
    data: {
      label: (
        <Box
          p="20px"
          bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          borderRadius="12px"
          boxShadow="lg"
          minW="140px"
        >
          <HStack spacing="8px" mb="6px">
            <Icon as={MdGroups} color="white" boxSize="20px" />
            <Text fontSize="sm" fontWeight="bold" color="white">
              Risk Mgmt
            </Text>
          </HStack>
          <Badge bg="whiteAlpha.300" color="white" fontSize="2xs">
            Team 3
          </Badge>
        </Box>
      ),
    },
  },
  {
    id: 'team4',
    type: 'default',
    position: { x: 640, y: 350 },
    data: {
      label: (
        <Box
          p="20px"
          bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          borderRadius="12px"
          boxShadow="lg"
          minW="140px"
        >
          <HStack spacing="8px" mb="6px">
            <Icon as={MdGroups} color="white" boxSize="20px" />
            <Text fontSize="sm" fontWeight="bold" color="white">
              Trader
            </Text>
          </HStack>
          <Badge bg="whiteAlpha.300" color="white" fontSize="2xs">
            Team 4
          </Badge>
        </Box>
      ),
    },
  },
];

const initialEdges = [];

export default function PipelineBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [customAgents, setCustomAgents] = useState([]);
  const [customTeams, setCustomTeams] = useState([]);

  const { isOpen: isAgentOpen, onOpen: onAgentOpen, onClose: onAgentClose } = useDisclosure();
  const { isOpen: isTeamOpen, onOpen: onTeamOpen, onClose: onTeamClose } = useDisclosure();

  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    category: 'data_retriever',
    system: 'data',
    model: 'gpt-4',
  });

  const [newTeam, setNewTeam] = useState({ name: '', description: '' });

  const toast = useToast();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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

      const newNode = {
        id: `agent-${Date.now()}`,
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

    const agent = {
      id: `custom-${Date.now()}`,
      name: newAgent.name,
      description: newAgent.description,
      type: newAgent.category,
      system: newAgent.system,
      icon: MdSmartToy,
      color: newAgent.system === 'data' ? 'blue' : 'pink',
      isBuiltin: false,
      model: newAgent.model,
    };

    setCustomAgents([...customAgents, agent]);
    setNewAgent({
      name: '',
      description: '',
      category: 'data_retriever',
      system: 'data',
      model: 'gpt-4',
    });
    onAgentClose();

    toast({
      title: 'Agent created',
      description: `${agent.name} added to library`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Create custom team
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
      type: 'default',
      position: { x: Math.random() * 400 + 200, y: Math.random() * 100 + 400 },
      data: {
        label: (
          <Box
            p="20px"
            bg="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
            borderRadius="12px"
            boxShadow="lg"
            minW="140px"
          >
            <HStack spacing="8px" mb="6px">
              <Icon as={MdGroups} color="gray.700" boxSize="20px" />
              <Text fontSize="sm" fontWeight="bold" color="gray.800">
                {newTeam.name}
              </Text>
            </HStack>
            <Badge colorScheme="pink" fontSize="2xs">
              Custom Horizon
            </Badge>
          </Box>
        ),
      },
    };

    setNodes((nds) => nds.concat(team));
    setCustomTeams([...customTeams, { name: newTeam.name, description: newTeam.description }]);
    setNewTeam({ name: '', description: '' });
    onTeamClose();

    toast({
      title: 'Horizon created',
      description: `${newTeam.name} added to Analyzer Network`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteAgent = (agentId) => {
    setCustomAgents(customAgents.filter(a => a.id !== agentId));
    toast({
      title: 'Agent deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSavePipeline = () => {
    const pipeline = { nodes, edges, customAgents, customTeams };
    console.log('Saving horizon:', pipeline);
    toast({
      title: 'Horizon saved',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box h="100vh" position="relative" bg="gray.50">
      {/* Left Sidebar - Agent Library */}
      <Box
        position="absolute"
        left="0"
        top="0"
        h="100%"
        w="280px"
        bg="white"
        borderRight="2px solid"
        borderColor="gray.200"
        zIndex="10"
        overflowY="auto"
      >
        <VStack spacing="0" align="stretch" h="full">
          {/* Header */}
          <Box p="20px" borderBottom="2px solid" borderColor="gray.200" bg="teal.50">
            <HStack spacing="10px" mb="8px">
              <Icon as={MdHub} color="teal.600" boxSize="24px" />
              <Text fontSize="lg" fontWeight="bold" color="teal.900">
                Horizon
              </Text>
            </HStack>
            <Text fontSize="xs" color="teal.700">
              Build your multi-agent network
            </Text>
          </Box>

          {/* Tabs for agents */}
          <Tabs size="sm" variant="enclosed" colorScheme="teal">
            <TabList px="10px" pt="10px">
              <Tab fontSize="xs">Built-in</Tab>
              <Tab fontSize="xs">Custom</Tab>
            </TabList>

            <TabPanels>
              {/* Built-in Agents */}
              <TabPanel p="15px">
                <VStack spacing="12px" align="stretch">
                  <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                    Data Agents
                  </Text>
                  {BUILTIN_AGENTS.filter((a) => a.system === 'data').map((agent) => (
                    <Box
                      key={agent.id}
                      p="12px"
                      bg="gray.50"
                      borderRadius="8px"
                      border="2px solid"
                      borderColor="gray.200"
                      cursor="grab"
                      _hover={{ bg: 'gray.100', borderColor: 'teal.400', boxShadow: 'md' }}
                      draggable
                      onDragStart={(e) => onDragStart(e, agent)}
                    >
                      <HStack spacing="10px" justify="space-between">
                        <Text fontSize="xs" fontWeight="600">
                          {agent.name}
                        </Text>
                        <Icon as={agent.icon} color={`${agent.color}.600`} boxSize="20px" />
                      </HStack>
                    </Box>
                  ))}

                  <Divider />

                  <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                    Analyzer Agents
                  </Text>
                  {BUILTIN_AGENTS.filter((a) => a.system === 'analyzer').map((agent) => (
                    <Box
                      key={agent.id}
                      p="12px"
                      bg="gray.50"
                      borderRadius="8px"
                      border="2px solid"
                      borderColor="gray.200"
                      cursor="grab"
                      _hover={{ bg: 'gray.100', borderColor: 'teal.400', boxShadow: 'md' }}
                      draggable
                      onDragStart={(e) => onDragStart(e, agent)}
                    >
                      <HStack spacing="10px" justify="space-between">
                        <Text fontSize="xs" fontWeight="600">
                          {agent.name}
                        </Text>
                        <Icon as={agent.icon} color={`${agent.color}.600`} boxSize="20px" />
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </TabPanel>

              {/* Custom Agents */}
              <TabPanel p="15px">
                <VStack spacing="10px" align="stretch">
                  {customAgents.length === 0 ? (
                    <Box p="20px" textAlign="center">
                      <Text fontSize="xs" color="gray.500">
                        No custom agents yet
                      </Text>
                    </Box>
                  ) : (
                    customAgents.map((agent) => (
                      <Box
                        key={agent.id}
                        p="12px"
                        bg="gray.50"
                        borderRadius="8px"
                        border="2px solid"
                        borderColor="gray.200"
                        cursor="grab"
                        draggable
                        onDragStart={(e) => onDragStart(e, agent)}
                      >
                        <HStack justify="space-between">
                          <Text fontSize="xs" fontWeight="600">
                            {agent.name}
                          </Text>
                          <HStack spacing="8px">
                            <Icon as={agent.icon} color={`${agent.color}.600`} boxSize="18px" />
                            <IconButton
                              icon={<Icon as={MdDelete} />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteAgent(agent.id)}
                            />
                          </HStack>
                        </HStack>
                      </Box>
                    ))
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Action Buttons */}
          <Box mt="auto" p="15px" borderTop="2px solid" borderColor="gray.200">
            <VStack spacing="10px">
              <Button
                leftIcon={<Icon as={MdAdd} />}
                size="sm"
                colorScheme="teal"
                w="full"
                onClick={onAgentOpen}
              >
                Create Agent
              </Button>
              <Button
                leftIcon={<Icon as={MdGroups} />}
                size="sm"
                colorScheme="purple"
                variant="outline"
                w="full"
                onClick={onTeamOpen}
              >
                Create New Horizon
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Main Canvas */}
      <Box ml="280px" h="100%">
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
          <Panel position="top-left">
            <VStack align="start" spacing="10px">
              <Box bg="white" p="15px" borderRadius="12px" boxShadow="md" border="1px solid" borderColor="gray.200">
                <Text fontSize="md" fontWeight="bold" color="gray.800" mb="5px">
                  Event Horizon
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Drop agents → Connect nodes → Save
                </Text>
              </Box>

              <Box bg="purple.50" p="12px" borderRadius="8px" border="1px solid" borderColor="purple.200">
                <Text fontSize="xs" fontWeight="600" color="purple.800" mb="4px">
                  📊 Data Pipeline (Fixed)
                </Text>
                <Text fontSize="2xs" color="purple.700">
                  Stage 1→2→3 unified. Add custom agents to Stage 1.
                </Text>
              </Box>

              <Box bg="pink.50" p="12px" borderRadius="8px" border="1px solid" borderColor="pink.200">
                <Text fontSize="xs" fontWeight="600" color="pink.800" mb="4px">
                  🧠 Analyzer Network (Flexible)
                </Text>
                <Text fontSize="2xs" color="pink.700">
                  4 default teams + create unlimited custom teams.
                </Text>
              </Box>
            </VStack>
          </Panel>

          <Panel position="top-right">
            <Tooltip label="Save Horizon">
              <IconButton
                icon={<Icon as={MdSave} />}
                colorScheme="teal"
                onClick={handleSavePipeline}
                size="lg"
                boxShadow="lg"
              />
            </Tooltip>
          </Panel>

          <Controls />
          <MiniMap />
          <Background variant="dots" gap={16} size={1} />
        </ReactFlow>
      </Box>

      {/* Create Agent Drawer */}
      <Drawer isOpen={isAgentOpen} placement="right" onClose={onAgentClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create Custom Agent</DrawerHeader>

          <DrawerBody>
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
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  System
                </FormLabel>
                <Select
                  value={newAgent.system}
                  onChange={(e) => {
                    const system = e.target.value;
                    setNewAgent({
                      ...newAgent,
                      system,
                      category: system === 'data' ? 'data_retriever' : 'strategy_agent'
                    });
                  }}
                >
                  <option value="data">Event Horizon Data Pipeline</option>
                  <option value="analyzer">Analyzer Network</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
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

              <Button colorScheme="teal" onClick={handleCreateAgent}>
                Create Agent
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Create Team Drawer */}
      <Drawer isOpen={isTeamOpen} placement="right" onClose={onTeamClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create New Horizon</DrawerHeader>

          <DrawerBody>
            <VStack spacing="20px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Horizon Name
                </FormLabel>
                <Input
                  placeholder="e.g., Momentum Traders"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  Description
                </FormLabel>
                <Textarea
                  placeholder="What does this horizon do?"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  rows={3}
                />
              </FormControl>

              <Button colorScheme="purple" onClick={handleCreateTeam}>
                Create Horizon
              </Button>

              <Box p="15px" bg="blue.50" borderRadius="8px" border="1px solid" borderColor="blue.200">
                <Text fontSize="xs" color="blue.800">
                  <strong>Tip:</strong> After creating a horizon, drag agents onto it and
                  connect horizons with lines to build your custom analyzer network.
                </Text>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
