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
  MdRefresh,
  MdGroups,
} from 'react-icons/md';

// Agent types available in library
const AGENT_LIBRARY = [
  // System 1 agents
  {
    id: 'candlestick',
    name: 'Candlestick Agent',
    type: 'data_retriever',
    system: 1,
    icon: MdShowChart,
    color: 'blue',
  },
  {
    id: 'earnings',
    name: 'Earnings Agent',
    type: 'data_retriever',
    system: 1,
    icon: MdAccountBalance,
    color: 'green',
  },
  {
    id: 'news',
    name: 'News Agent',
    type: 'news_agent',
    system: 1,
    icon: MdArticle,
    color: 'orange',
  },
  {
    id: 'technical',
    name: 'Technical Agent',
    type: 'technical_agent',
    system: 1,
    icon: MdSpeed,
    color: 'purple',
  },
  {
    id: 'fundamentals',
    name: 'Fundamentals Agent',
    type: 'financial_metrics',
    system: 1,
    icon: MdAccountBalance,
    color: 'teal',
  },
  // System 2 agents
  {
    id: 'bull_researcher',
    name: 'Bull Researcher',
    type: 'strategy_agent',
    system: 2,
    icon: MdTrendingUp,
    color: 'green',
  },
  {
    id: 'bear_researcher',
    name: 'Bear Researcher',
    type: 'strategy_agent',
    system: 2,
    icon: MdWarning,
    color: 'red',
  },
  {
    id: 'risk_manager',
    name: 'Risk Manager',
    type: 'risk_manager',
    system: 2,
    icon: MdWarning,
    color: 'orange',
  },
];

// Initial pipeline structure
const initialNodes = [
  // System 1 - Fixed Stages
  {
    id: 'stage1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: {
      label: (
        <Box p="15px" bg="blue.50" borderRadius="8px" border="2px solid" borderColor="blue.400">
          <Text fontSize="sm" fontWeight="bold" color="blue.800">
            Stage 1: Data Retrieval
          </Text>
          <Badge colorScheme="blue" fontSize="xs" mt="4px">
            Drop agents here
          </Badge>
        </Box>
      ),
    },
    draggable: false,
  },
  {
    id: 'stage2',
    type: 'default',
    position: { x: 400, y: 100 },
    data: {
      label: (
        <Box p="15px" bg="purple.50" borderRadius="8px" border="2px solid" borderColor="purple.400">
          <Text fontSize="sm" fontWeight="bold" color="purple.800">
            Stage 2: Normalization
          </Text>
          <Badge colorScheme="purple" fontSize="xs" mt="4px">
            Fixed pipeline
          </Badge>
        </Box>
      ),
    },
    draggable: false,
  },
  {
    id: 'stage3',
    type: 'default',
    position: { x: 700, y: 100 },
    data: {
      label: (
        <Box p="15px" bg="green.50" borderRadius="8px" border="2px solid" borderColor="green.400">
          <Text fontSize="sm" fontWeight="bold" color="green.800">
            Stage 3: LLM Features
          </Text>
          <Badge colorScheme="green" fontSize="xs" mt="4px">
            Fixed pipeline
          </Badge>
        </Box>
      ),
    },
    draggable: false,
  },
  // System 2 - Default Teams
  {
    id: 'team1',
    type: 'default',
    position: { x: 100, y: 400 },
    data: {
      label: (
        <Box p="15px" bg="orange.50" borderRadius="8px" border="2px solid" borderColor="orange.400" minW="150px">
          <Text fontSize="sm" fontWeight="bold" color="orange.800">
            Team 1: Analysts
          </Text>
          <Badge colorScheme="orange" fontSize="xs" mt="4px">
            4 agents
          </Badge>
        </Box>
      ),
    },
  },
  {
    id: 'team2',
    type: 'default',
    position: { x: 300, y: 400 },
    data: {
      label: (
        <Box p="15px" bg="orange.50" borderRadius="8px" border="2px solid" borderColor="orange.400" minW="150px">
          <Text fontSize="sm" fontWeight="bold" color="orange.800">
            Team 2: Researchers
          </Text>
          <Badge colorScheme="orange" fontSize="xs" mt="4px">
            Drop agents here
          </Badge>
        </Box>
      ),
    },
  },
  {
    id: 'team3',
    type: 'default',
    position: { x: 500, y: 400 },
    data: {
      label: (
        <Box p="15px" bg="orange.50" borderRadius="8px" border="2px solid" borderColor="orange.400" minW="150px">
          <Text fontSize="sm" fontWeight="bold" color="orange.800">
            Team 3: Risk Mgmt
          </Text>
          <Badge colorScheme="orange" fontSize="xs" mt="4px">
            Drop agents here
          </Badge>
        </Box>
      ),
    },
  },
  {
    id: 'team4',
    type: 'default',
    position: { x: 700, y: 400 },
    data: {
      label: (
        <Box p="15px" bg="orange.50" borderRadius="8px" border="2px solid" borderColor="orange.400" minW="150px">
          <Text fontSize="sm" fontWeight="bold" color="orange.800">
            Team 4: Trader
          </Text>
          <Badge colorScheme="orange" fontSize="xs" mt="4px">
            Final decision
          </Badge>
        </Box>
      ),
    },
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'stage1', target: 'stage2', animated: true },
  { id: 'e2-3', source: 'stage2', target: 'stage3', animated: true },
];

export default function PipelineBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTeamName, setNewTeamName] = useState('');
  const toast = useToast();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle drag start from library
  const onDragStart = (event, agent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(agent));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop on canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const agent = JSON.parse(
        event.dataTransfer.getData('application/reactflow')
      );

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };

      const newNode = {
        id: `${agent.id}-${Date.now()}`,
        type: 'default',
        position,
        data: {
          label: (
            <Box
              p="12px"
              bg="white"
              borderRadius="8px"
              border="2px solid"
              borderColor={`${agent.color}.400`}
              boxShadow="md"
              minW="120px"
            >
              <HStack spacing="8px">
                <Icon as={agent.icon} color={`${agent.color}.600`} boxSize="16px" />
                <Text fontSize="xs" fontWeight="600">
                  {agent.name}
                </Text>
              </HStack>
              <Badge colorScheme={agent.color} fontSize="2xs" mt="4px">
                System {agent.system}
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

  // Create new team
  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast({
        title: 'Team name required',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const newTeam = {
      id: `team-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500 + 100, y: Math.random() * 200 + 400 },
      data: {
        label: (
          <Box
            p="15px"
            bg="pink.50"
            borderRadius="8px"
            border="2px solid"
            borderColor="pink.400"
            minW="150px"
          >
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="bold" color="pink.800">
                {newTeamName}
              </Text>
              <Icon as={MdGroups} color="pink.600" />
            </HStack>
            <Badge colorScheme="pink" fontSize="xs" mt="4px">
              Custom team
            </Badge>
          </Box>
        ),
      },
    };

    setNodes((nds) => nds.concat(newTeam));
    setNewTeamName('');
    onClose();
    toast({
      title: 'Team created',
      description: `${newTeamName} added to System 2`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Save pipeline
  const handleSavePipeline = () => {
    const pipeline = { nodes, edges };
    console.log('Saving pipeline:', pipeline);
    // TODO: Send to backend
    toast({
      title: 'Pipeline saved',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Reset pipeline
  const handleResetPipeline = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    toast({
      title: 'Pipeline reset',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box h="100vh" position="relative">
      {/* Left Sidebar - Agent Library */}
      <Box
        position="absolute"
        left="0"
        top="0"
        h="100%"
        w="250px"
        bg="white"
        borderRight="2px solid"
        borderColor="gray.200"
        zIndex="10"
        overflowY="auto"
      >
        <VStack spacing="0" align="stretch" h="full">
          <Box p="20px" borderBottom="2px solid" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mb="5px">
              Agent Library
            </Text>
            <Text fontSize="xs" color="gray.600">
              Drag agents to canvas
            </Text>
          </Box>

          <VStack spacing="10px" p="15px" align="stretch">
            <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
              System 1 Agents
            </Text>
            {AGENT_LIBRARY.filter((a) => a.system === 1).map((agent) => (
              <Box
                key={agent.id}
                p="12px"
                bg="gray.50"
                borderRadius="8px"
                border="1px solid"
                borderColor="gray.200"
                cursor="grab"
                _hover={{ bg: 'gray.100', boxShadow: 'md' }}
                draggable
                onDragStart={(e) => onDragStart(e, agent)}
              >
                <HStack spacing="8px">
                  <Icon as={agent.icon} color={`${agent.color}.600`} boxSize="18px" />
                  <Text fontSize="xs" fontWeight="600">
                    {agent.name}
                  </Text>
                </HStack>
              </Box>
            ))}

            <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" mt="15px">
              System 2 Agents
            </Text>
            {AGENT_LIBRARY.filter((a) => a.system === 2).map((agent) => (
              <Box
                key={agent.id}
                p="12px"
                bg="gray.50"
                borderRadius="8px"
                border="1px solid"
                borderColor="gray.200"
                cursor="grab"
                _hover={{ bg: 'gray.100', boxShadow: 'md' }}
                draggable
                onDragStart={(e) => onDragStart(e, agent)}
              >
                <HStack spacing="8px">
                  <Icon as={agent.icon} color={`${agent.color}.600`} boxSize="18px" />
                  <Text fontSize="xs" fontWeight="600">
                    {agent.name}
                  </Text>
                </HStack>
              </Box>
            ))}
          </VStack>

          <Box mt="auto" p="15px" borderTop="2px solid" borderColor="gray.200">
            <Button
              leftIcon={<Icon as={MdAdd} />}
              size="sm"
              colorScheme="teal"
              w="full"
              onClick={onOpen}
            >
              Create Team
            </Button>
          </Box>
        </VStack>
      </Box>

      {/* Main Canvas */}
      <Box ml="250px" h="100%">
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
            <Box bg="white" p="15px" borderRadius="8px" boxShadow="md">
              <Text fontSize="lg" fontWeight="bold" color="gray.800" mb="5px">
                Event Horizon Pipeline
              </Text>
              <Text fontSize="xs" color="gray.600">
                Drag agents from library, connect with lines
              </Text>
            </Box>
          </Panel>

          <Panel position="top-right">
            <HStack spacing="10px">
              <Tooltip label="Save Pipeline">
                <IconButton
                  icon={<Icon as={MdSave} />}
                  colorScheme="teal"
                  onClick={handleSavePipeline}
                  size="md"
                />
              </Tooltip>
              <Tooltip label="Reset Pipeline">
                <IconButton
                  icon={<Icon as={MdRefresh} />}
                  colorScheme="gray"
                  onClick={handleResetPipeline}
                  size="md"
                />
              </Tooltip>
            </HStack>
          </Panel>

          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </Box>

      {/* Create Team Modal */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create New Team</DrawerHeader>

          <DrawerBody>
            <VStack spacing="20px" align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  Team Name
                </FormLabel>
                <Input
                  placeholder="e.g., Custom Strategy Team"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  size="md"
                />
              </FormControl>

              <Button
                leftIcon={<Icon as={MdGroups} />}
                colorScheme="teal"
                onClick={handleCreateTeam}
              >
                Create Team
              </Button>

              <Box p="15px" bg="blue.50" borderRadius="8px" border="1px solid" borderColor="blue.200">
                <Text fontSize="xs" color="blue.800">
                  <strong>Tip:</strong> After creating a team, drag agents from the library
                  onto the canvas and connect them to your team using lines.
                </Text>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
