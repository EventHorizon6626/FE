import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  VStack,
  Badge,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  Tab,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Select,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  MdAdd,
  MdSearch,
  MdSmartToy,
  MdDelete,
  MdEdit,
} from 'react-icons/md';
import Card from 'components/card/Card.js';

// Mock data for agents
const INITIAL_AGENTS = [
  {
    id: '1',
    name: 'portfolio-analyzer',
    description: 'Analyzes portfolio performance and provides recommendations',
    source: 'System 1 - Stage 3',
    model: 'gpt-4',
    created: '5 days ago',
    apiId: 'agent_port_001',
    status: 'active',
  },
  {
    id: '2',
    name: 'risk-assessor',
    description: 'Evaluates investment risk based on market data',
    source: 'System 1 - All Stages',
    model: 'gpt-4-turbo',
    created: '12 days ago',
    apiId: 'agent_risk_002',
    status: 'active',
  },
];

const DATA_SOURCES = [
  { value: 'stage1', label: 'Stage 1 - Data Retrieval' },
  { value: 'stage2', label: 'Stage 2 - Normalization' },
  { value: 'stage3', label: 'Stage 3 - LLM Features' },
  { value: 'all', label: 'All Stages' },
];

const MODELS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // New agent form state
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    source: 'all',
    model: 'gpt-4',
  });

  // Colors
  const textColor = '#1F2937';
  const textColorSecondary = 'gray.600';
  const brandColor = 'teal.600';
  const cardBg = 'white';
  const borderColor = 'gray.200';

  const handleCreateAgent = () => {
    if (!newAgent.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter an agent name.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const agent = {
      id: Date.now().toString(),
      name: newAgent.name.toLowerCase().replace(/\s+/g, '-'),
      description: newAgent.description,
      source: DATA_SOURCES.find((s) => s.value === newAgent.source)?.label || 'All Stages',
      model: newAgent.model,
      created: 'Just now',
      apiId: `agent_${newAgent.name.slice(0, 4)}_${Math.random().toString(36).slice(2, 5)}`,
      status: 'active',
    };

    setAgents([agent, ...agents]);
    setNewAgent({ name: '', description: '', source: 'all', model: 'gpt-4' });
    onClose();

    toast({
      title: 'Agent created',
      description: `${agent.name} is now ready to use.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteAgent = (id) => {
    setAgents(agents.filter((a) => a.id !== id));
    toast({
      title: 'Agent deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box minH="100vh" bg="#FAFAFA" p={{ base: '20px', md: '40px' }}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Box mb="30px">
          <HStack justify="space-between" mb="10px">
            <Box>
              <Text color={textColor} fontSize="3xl" fontWeight="600" mb="5px">
                Agents
              </Text>
              <Text color={textColorSecondary} fontSize="sm">
                Specialized AI assistants trained on Event Horizon System 1 data
              </Text>
            </Box>

            <Button
              leftIcon={<Icon as={MdAdd} />}
              bg={brandColor}
              color="white"
              size="md"
              onClick={onOpen}
              _hover={{ bg: 'teal.700' }}
              fontWeight="600"
            >
              Create agent
            </Button>
          </HStack>
        </Box>

        {/* Main Card */}
        <Card
          bg={cardBg}
          p="0"
          borderRadius="12px"
          border="1px solid"
          borderColor={borderColor}
        >
          {/* Tabs and Search */}
          <Box p="20px" borderBottom="1px solid" borderColor={borderColor}>
            <HStack justify="space-between" mb="15px">
              <Tabs
                size="sm"
                variant="unstyled"
                index={activeTab}
                onChange={setActiveTab}
              >
                <TabList>
                  <Tab
                    _selected={{
                      color: brandColor,
                      borderBottom: '2px solid',
                      borderColor: brandColor,
                    }}
                    color={textColorSecondary}
                    fontWeight="500"
                    fontSize="sm"
                  >
                    Source
                  </Tab>
                  <Tab
                    _selected={{
                      color: brandColor,
                      borderBottom: '2px solid',
                      borderColor: brandColor,
                    }}
                    color={textColorSecondary}
                    fontWeight="500"
                    fontSize="sm"
                  >
                    Metadata
                  </Tab>
                </TabList>
              </Tabs>

              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="sm"
                  borderRadius="6px"
                  bg="white"
                  borderColor={borderColor}
                />
              </InputGroup>
            </HStack>
          </Box>

          {/* Agents Table */}
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th
                    borderColor={borderColor}
                    color={textColorSecondary}
                    fontSize="xs"
                    textTransform="none"
                  >
                    Agent name
                  </Th>
                  <Th
                    borderColor={borderColor}
                    color={textColorSecondary}
                    fontSize="xs"
                    textTransform="none"
                  >
                    Source
                  </Th>
                  <Th
                    borderColor={borderColor}
                    color={textColorSecondary}
                    fontSize="xs"
                    textTransform="none"
                  >
                    Model
                  </Th>
                  <Th
                    borderColor={borderColor}
                    color={textColorSecondary}
                    fontSize="xs"
                    textTransform="none"
                  >
                    Created
                  </Th>
                  <Th
                    borderColor={borderColor}
                    color={textColorSecondary}
                    fontSize="xs"
                    textTransform="none"
                  >
                    API ID
                  </Th>
                  <Th
                    borderColor={borderColor}
                    color={textColorSecondary}
                    fontSize="xs"
                    textTransform="none"
                  >
                    Status
                  </Th>
                  <Th borderColor={borderColor} w="100px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAgents.map((agent) => (
                  <Tr
                    key={agent.id}
                    _hover={{ bg: 'gray.50' }}
                    cursor="pointer"
                  >
                    <Td borderColor={borderColor}>
                      <VStack align="start" spacing="2px">
                        <HStack spacing="8px">
                          <Icon as={MdSmartToy} color={brandColor} />
                          <Text
                            color={textColor}
                            fontSize="sm"
                            fontWeight="600"
                          >
                            {agent.name}
                          </Text>
                        </HStack>
                        {agent.description && (
                          <Text
                            color={textColorSecondary}
                            fontSize="xs"
                            noOfLines={1}
                          >
                            {agent.description}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme="blue"
                        fontSize="xs"
                        variant="subtle"
                      >
                        {agent.source}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge colorScheme="purple" fontSize="xs" variant="subtle">
                        {agent.model}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text color={textColorSecondary} fontSize="xs">
                        {agent.created}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text
                        color={textColorSecondary}
                        fontSize="xs"
                        fontFamily="mono"
                      >
                        {agent.apiId}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={agent.status === 'active' ? 'green' : 'gray'}
                        fontSize="xs"
                      >
                        {agent.status}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <HStack spacing="4px">
                        <Button
                          size="xs"
                          variant="ghost"
                          color={textColorSecondary}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit functionality
                          }}
                        >
                          <Icon as={MdEdit} />
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="red.500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAgent(agent.id);
                          }}
                        >
                          <Icon as={MdDelete} />
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {filteredAgents.length === 0 && (
              <Box p="40px" textAlign="center">
                <Icon
                  as={MdSmartToy}
                  boxSize="48px"
                  color="gray.300"
                  mb="10px"
                />
                <Text color={textColorSecondary} fontSize="sm">
                  {searchQuery ? 'No agents found' : 'No agents created yet'}
                </Text>
                {!searchQuery && (
                  <Button
                    size="sm"
                    variant="link"
                    color={brandColor}
                    mt="10px"
                    onClick={onOpen}
                  >
                    Create your first agent
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Card>

        {/* Info Card */}
        <Card
          bg="blue.50"
          p="20px"
          mt="20px"
          borderRadius="12px"
          border="1px solid"
          borderColor="blue.200"
        >
          <Text color="blue.900" fontSize="sm" fontWeight="600" mb="5px">
            About Event Horizon Agents
          </Text>
          <Text color="blue.800" fontSize="xs">
            Agents are specialized AI assistants trained on data from Event Horizon System 1
            (data pipeline). They can analyze stocks, assess risk, generate reports, and more
            based on real-time market data, technical indicators, and news sentiment.
          </Text>
        </Card>
      </Box>

      {/* Create Agent Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Agent</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="20px">
            <VStack spacing="20px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Agent Name
                </FormLabel>
                <Input
                  placeholder="e.g., portfolio-optimizer"
                  value={newAgent.name}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, name: e.target.value })
                  }
                  size="md"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  Description
                </FormLabel>
                <Textarea
                  placeholder="What does this agent do?"
                  value={newAgent.description}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, description: e.target.value })
                  }
                  size="md"
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Data Source
                </FormLabel>
                <Select
                  value={newAgent.source}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, source: e.target.value })
                  }
                  size="md"
                >
                  {DATA_SOURCES.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
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
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, model: e.target.value })
                  }
                  size="md"
                >
                  {MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack justify="flex-end" spacing="10px" pt="10px">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  bg={brandColor}
                  color="white"
                  onClick={handleCreateAgent}
                  _hover={{ bg: 'teal.700' }}
                >
                  Create Agent
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
