import {
  Box,
  Button,
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
  TabPanels,
  Tab,
  TabPanel,
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
  Switch,
  SimpleGrid,
  Flex,
  Spinner,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import {
  createAgent,
  getAgents,
  updateAgent,
  deleteAgent,
  generateAgentPrompt,
} from 'lib/agentApi';
import {
  MdAdd,
  MdSearch,
  MdSmartToy,
  MdDelete,
  MdShowChart,
  MdArticle,
  MdSpeed,
  MdTrendingUp,
  MdWarning,
  MdApi,
  MdSettings,
  MdCheckCircle,
  MdAccountBalance,
  MdSentimentSatisfied,
  MdInsights,
  MdGavel,
  MdShield,
  MdSwapHoriz,
  MdBalance,
  MdAssessment,
  MdAutoAwesome,
  MdEdit,
  MdExpandMore,
  MdExpandLess,
  MdRefresh,
  MdPsychology,
} from 'react-icons/md';
import Card from 'components/card/Card.js';

// Built-in System 1 Agents
// IMPORTANT: 'type' field must match the switch cases in agentApi.js
const BUILTIN_SYSTEM1_AGENTS = [
  {
    id: 'builtin_1',
    name: 'Price Data Retriever',
    type: 'candlestick', // API endpoint type
    description: 'Fetches real-time and historical price data from Yahoo Finance',
    category: 'Data Retriever',
    system: 'System 1',
    stage: 'Stage 1',
    icon: MdShowChart,
    status: 'active',
    isBuiltin: true,
  },
  {
    id: 'builtin_2',
    name: 'News Sentiment Analyzer',
    type: 'news',
    description: 'Analyzes market news sentiment using NLP',
    category: 'News Agent',
    system: 'System 1',
    stage: 'Stage 1',
    icon: MdArticle,
    status: 'active',
    isBuiltin: true,
  },
  {
    id: 'builtin_3',
    name: 'Technical Indicator Engine',
    type: 'technical',
    description: 'Calculates RSI, MACD, Moving Averages, and more',
    category: 'Technical Agent',
    system: 'System 1',
    stage: 'Stage 2',
    icon: MdSpeed,
    status: 'active',
    isBuiltin: true,
  },
];

// Built-in System 2 Agents (Based on TradingAgents Multi-Agent Framework)
// IMPORTANT: 'type' field must match the switch cases in agentApi.js
const BUILTIN_SYSTEM2_AGENTS = [
  // ===== TEAM 1: MARKET ANALYSIS (Analyst Team) =====
  {
    id: 'builtin_4',
    name: 'Fundamentals Analyst',
    type: 'fundamentals_analyst', // API endpoint type
    description: 'Assesses company financials, performance metrics, and intrinsic values using fundamental analysis',
    category: 'Strategy Agent',
    system: 'System 2',
    stage: 'Team 1',
    icon: MdAccountBalance,
    status: 'active',
    isBuiltin: true,
  },
  {
    id: 'builtin_5',
    name: 'Sentiment Analyst',
    type: 'sentiment_analyst',
    description: 'Examines social media, public opinion, and market sentiment using sentiment algorithms',
    category: 'Strategy Agent',
    system: 'System 2',
    stage: 'Team 1',
    icon: MdSentimentSatisfied,
    status: 'active',
    isBuiltin: true,
  },
  {
    id: 'builtin_6',
    name: 'News Analyst',
    type: 'news_analyst',
    description: 'Tracks global news and macroeconomic indicators for market impact assessment',
    category: 'Strategy Agent',
    system: 'System 2',
    stage: 'Team 1',
    icon: MdArticle,
    status: 'active',
    isBuiltin: true,
  },
  {
    id: 'builtin_7',
    name: 'Technical Analyst',
    type: 'technical_analyst',
    description: 'Applies technical indicators (MACD, RSI, patterns) to detect trends and forecast movements',
    category: 'Strategy Agent',
    system: 'System 2',
    stage: 'Team 1',
    icon: MdInsights,
    status: 'active',
    isBuiltin: true,
  },

  // ===== TEAM 2: BULL/BEAR DEBATE (Researcher Team) =====
  {
    id: 'builtin_8',
    name: 'Bull Researcher',
    type: 'bull_researcher',
    description: 'Builds the strongest possible bullish case by critically evaluating analyst insights',
    category: 'Strategy Agent',
    system: 'System 2',
    stage: 'Team 2',
    icon: MdTrendingUp,
    status: 'active',
    isBuiltin: true,
  },
  {
    id: 'builtin_9',
    name: 'Bear Researcher',
    type: 'bear_researcher',
    description: 'Builds the strongest possible bearish case through structured counter-arguments',
    category: 'Strategy Agent',
    system: 'System 2',
    stage: 'Team 2',
    icon: MdWarning,
    status: 'active',
    isBuiltin: true,
  },
  {
    id: 'builtin_10',
    name: 'Research Manager',
    type: 'research_manager',
    description: 'Synthesizes bull and bear arguments through dynamic discussions to determine optimal strategy',
    category: 'Strategy Agent',
    system: 'System 2',
    stage: 'Team 2',
    icon: MdGavel,
    status: 'active',
    isBuiltin: true,
  },

  // ===== TEAM 3: PORTFOLIO OPTIMIZATION =====
  {
    id: 'builtin_11',
    name: 'Portfolio Manager',
    type: 'portfolio_manager',
    description: 'Evaluates portfolio-level decisions, position sizing, and asset allocation strategies',
    category: 'Strategy Agent',
    system: 'System 2',
    stage: 'Team 3',
    icon: MdBalance,
    status: 'active',
    isBuiltin: true,
  },

  // ===== TEAM 4: RISK ASSESSMENT =====
  {
    id: 'builtin_12',
    name: 'Risk Manager',
    type: 'risk_manager',
    description: 'Evaluates portfolio risk, volatility, and liquidity before approving or rejecting transactions',
    category: 'Risk Manager',
    system: 'System 2',
    stage: 'Team 4',
    icon: MdShield,
    status: 'active',
    isBuiltin: true,
  },
  {
    id: 'builtin_13',
    name: 'Trader Agent',
    type: 'trader_agent',
    description: 'Synthesizes analyst and researcher reports to determine trade timing, sizing, and execution',
    category: 'Strategy Agent',
    system: 'System 2',
    stage: 'Team 4',
    icon: MdSwapHoriz,
    status: 'active',
    isBuiltin: true,
  },
];

const AGENT_CATEGORIES = [
  { value: 'data_retriever', label: 'Data Retriever', system: 'System 1' },
  { value: 'news_agent', label: 'News Agent', system: 'System 1' },
  { value: 'technical_agent', label: 'Technical Agent', system: 'System 1' },
  { value: 'financial_metrics', label: 'Financial Metrics', system: 'System 1' },
  { value: 'api_connector', label: 'API Connector', system: 'System 1' },
  { value: 'strategy_agent', label: 'Strategy Agent', system: 'System 2' },
  { value: 'risk_manager', label: 'Risk Manager', system: 'System 2' },
  { value: 'custom_analyzer', label: 'Custom Analyzer', system: 'System 2' },
];

const SYSTEM1_STAGES = [
  { value: 'Stage 1', label: 'Stage 1 - Data Retrieval' },
  { value: 'Stage 2', label: 'Stage 2 - Normalization' },
  { value: 'Stage 3', label: 'Stage 3 - LLM Features' },
];

const SYSTEM2_TEAMS = [
  { value: 'Team 1', label: 'Team 1 - Market Analysis', description: 'Analyst role: analyze market data and provide insights' },
  { value: 'Team 2', label: 'Team 2 - Bull/Bear Debate', description: 'Researcher role: build investment cases and debate' },
  { value: 'Team 3', label: 'Team 3 - Portfolio', description: 'Manager role: portfolio allocation and position sizing' },
  { value: 'Team 4', label: 'Team 4 - Risk', description: 'Risk/Execution role: evaluate risk and execute trades' },
];


export default function AgentsPage() {
  const [customAgents, setCustomAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // New agent form state - simplified without LLM config
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    category: 'strategy_agent',
    system: 'System 2',
    stage: 'Team 1',
    systemPrompt: '',
    enableThinking: true,
    maxIterations: 5,
    status: 'active',
  });

  // Fetch custom agents on mount
  useEffect(() => {
    fetchCustomAgents();
  }, []);

  const fetchCustomAgents = async () => {
    try {
      setIsLoading(true);
      const response = await getAgents();
      if (response.success) {
        const agents = response.data.map((agent) => ({
          ...agent,
          icon: MdSmartToy,
          isBuiltin: false,
        }));
        setCustomAgents(agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Error loading agents',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate system prompt when name or description changes
  const handleGeneratePrompt = useCallback(async () => {
    if (!newAgent.name.trim() || !newAgent.description.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter both name and description first.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsGenerating(true);
      const response = await generateAgentPrompt(
        newAgent.name,
        newAgent.description,
        newAgent.stage,
        newAgent.category
      );

      if (response.success && response.data?.systemPrompt) {
        setNewAgent((prev) => ({
          ...prev,
          systemPrompt: response.data.systemPrompt,
        }));
        setShowSystemPrompt(true);
        toast({
          title: 'System prompt generated',
          description: 'You can review and edit the prompt below.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: 'Generation failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [newAgent.name, newAgent.description, newAgent.stage, newAgent.category, toast]);

  const resetForm = () => {
    setNewAgent({
      name: '',
      description: '',
      category: 'strategy_agent',
      system: 'System 2',
      stage: 'Team 1',
      systemPrompt: '',
      enableThinking: true,
      maxIterations: 5,
      status: 'active',
    });
    setShowSystemPrompt(false);
    setEditingAgent(null);
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  // Colors
  const textColor = '#1F2937';
  const textColorSecondary = 'gray.600';
  const brandColor = 'teal.600';
  const cardBg = 'white';
  const borderColor = 'gray.200';

  const allAgents = [...BUILTIN_SYSTEM1_AGENTS, ...BUILTIN_SYSTEM2_AGENTS, ...customAgents];

  const handleCreateAgent = async () => {
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

    // Generate prompt if not already generated
    let systemPrompt = newAgent.systemPrompt;
    if (!systemPrompt.trim()) {
      if (!newAgent.description.trim()) {
        toast({
          title: 'Description required',
          description: 'Please enter a description to generate the system prompt.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        setIsGenerating(true);
        const response = await generateAgentPrompt(
          newAgent.name,
          newAgent.description,
          newAgent.stage,
          newAgent.category
        );
        if (response.success && response.data?.systemPrompt) {
          systemPrompt = response.data.systemPrompt;
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
        setIsGenerating(false);
        return;
      } finally {
        setIsGenerating(false);
      }
    }

    try {
      setIsLoading(true);

      if (editingAgent) {
        // Update existing agent
        const response = await updateAgent(editingAgent.id, {
          name: newAgent.name.trim(),
          description: newAgent.description,
          type: 'custom_agent',
          category: newAgent.category,
          system: newAgent.system,
          stage: newAgent.stage,
          systemPrompt: systemPrompt,
          enableThinking: newAgent.enableThinking,
          maxIterations: newAgent.maxIterations,
          status: newAgent.status,
        });

        if (response.success) {
          await fetchCustomAgents();
          handleCloseModal();
          toast({
            title: 'Agent updated',
            description: `${newAgent.name} has been updated.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Create new agent
        const response = await createAgent({
          name: newAgent.name.trim(),
          description: newAgent.description,
          type: 'custom_agent',
          category: newAgent.category,
          system: newAgent.system,
          stage: newAgent.stage,
          systemPrompt: systemPrompt,
          enableThinking: newAgent.enableThinking,
          maxIterations: newAgent.maxIterations,
        });

        if (response.success) {
          await fetchCustomAgents();
          handleCloseModal();
          toast({
            title: 'Agent created',
            description: `${newAgent.name} is ready to use in your pipeline.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: 'Error saving agent',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAgent = async (id) => {
    const agent = customAgents.find((a) => a.id === id);
    if (!agent) return;

    const newStatus = agent.status === 'active' ? 'inactive' : 'active';

    try {
      const response = await updateAgent(id, { status: newStatus });
      if (response.success) {
        setCustomAgents(
          customAgents.map((a) =>
            a.id === id ? { ...a, status: newStatus } : a
          )
        );
      }
    } catch (error) {
      toast({
        title: 'Error updating agent',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAgent = async (id) => {
    try {
      const response = await deleteAgent(id);
      if (response.success) {
        setCustomAgents(customAgents.filter((a) => a.id !== id));
        toast({
          title: 'Agent deleted',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error deleting agent',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setNewAgent({
      name: agent.name,
      description: agent.description || '',
      category: agent.category || 'strategy_agent',
      system: agent.system || 'System 2',
      stage: agent.stage || 'Team 1',
      systemPrompt: agent.systemPrompt || '',
      enableThinking: agent.enableThinking !== false,
      maxIterations: agent.maxIterations || 5,
      status: agent.status || 'active',
    });
    setShowSystemPrompt(!!agent.systemPrompt);
    onOpen();
  };

  const filteredAgents = (system) => {
    return allAgents.filter(
      (agent) =>
        agent.system === system &&
        (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const AgentCard = ({ agent, showToggle = false }) => (
    <Card
      bg={cardBg}
      p="20px"
      borderRadius="12px"
      border="1px solid"
      borderColor={agent.status === 'active' ? 'teal.200' : borderColor}
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start">
        <HStack spacing="12px" align="start" flex="1">
          <Icon
            as={agent.icon}
            boxSize="24px"
            color={agent.status === 'active' ? brandColor : 'gray.400'}
          />
          <VStack align="start" spacing="4px" flex="1">
            <HStack>
              <Text color={textColor} fontSize="md" fontWeight="600">
                {agent.name}
              </Text>
              {agent.isBuiltin && (
                <Badge colorScheme="blue" fontSize="xs">
                  Built-in
                </Badge>
              )}
            </HStack>
            <Text color={textColorSecondary} fontSize="xs">
              {agent.description}
            </Text>
            <HStack spacing="8px" mt="8px">
              <Badge colorScheme="purple" fontSize="xs" variant="subtle">
                {agent.category}
              </Badge>
              <Badge colorScheme="gray" fontSize="xs" variant="subtle">
                {agent.stage}
              </Badge>
            </HStack>
          </VStack>
        </HStack>

        <VStack spacing="8px" align="end">
          {showToggle && !agent.isBuiltin && (
            <Switch
              colorScheme="teal"
              isChecked={agent.status === 'active'}
              onChange={() => handleToggleAgent(agent.id)}
              size="sm"
            />
          )}
          {agent.isBuiltin && (
            <Badge
              colorScheme={agent.status === 'active' ? 'green' : 'gray'}
              fontSize="xs"
            >
              {agent.status === 'active' ? 'Always Active' : 'Inactive'}
            </Badge>
          )}
          {!agent.isBuiltin && (
            <HStack spacing="4px">
              <Button
                size="xs"
                variant="ghost"
                color={textColorSecondary}
                onClick={() => handleEditAgent(agent)}
                title="Edit agent"
              >
                <Icon as={MdEdit} />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                color="red.500"
                onClick={() => handleDeleteAgent(agent.id)}
                title="Delete agent"
              >
                <Icon as={MdDelete} />
              </Button>
            </HStack>
          )}
        </VStack>
      </Flex>
    </Card>
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
                Build your custom pipeline by plugging agents in or out
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
              Create Agent
            </Button>
          </HStack>
        </Box>

        {/* Tabs */}
        <Tabs
          colorScheme="teal"
          index={activeTab}
          onChange={setActiveTab}
          variant="enclosed"
        >
          <TabList borderColor={borderColor}>
            <Tab
              _selected={{
                color: brandColor,
                borderColor: borderColor,
                borderBottomColor: 'white',
                fontWeight: '600',
              }}
            >
              <HStack spacing="6px">
                <Icon as={MdShowChart} />
                <Text fontSize="sm">System 1 Pipeline</Text>
                <Badge colorScheme="blue" fontSize="xs" variant="subtle">
                  {filteredAgents('System 1').length}
                </Badge>
              </HStack>
            </Tab>
            <Tab
              _selected={{
                color: brandColor,
                borderColor: borderColor,
                borderBottomColor: 'white',
                fontWeight: '600',
              }}
            >
              <HStack spacing="6px">
                <Icon as={MdTrendingUp} />
                <Text fontSize="sm">System 2 Decision</Text>
                <Badge colorScheme="purple" fontSize="xs" variant="subtle">
                  {filteredAgents('System 2').length}
                </Badge>
              </HStack>
            </Tab>
            <Tab
              _selected={{
                color: brandColor,
                borderColor: borderColor,
                borderBottomColor: 'white',
                fontWeight: '600',
              }}
            >
              <HStack spacing="6px">
                <Icon as={MdApi} />
                <Text fontSize="sm">Pipeline View</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* System 1 Tab */}
            <TabPanel p="0" pt="20px">
              <Card
                bg={cardBg}
                p="20px"
                borderRadius="12px"
                border="1px solid"
                borderColor={borderColor}
              >
                <InputGroup mb="20px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search System 1 agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="8px"
                    bg="white"
                    borderColor={borderColor}
                  />
                </InputGroup>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="15px">
                  {filteredAgents('System 1').map((agent) => (
                    <AgentCard key={agent.id} agent={agent} showToggle={true} />
                  ))}
                </SimpleGrid>

                {filteredAgents('System 1').length === 0 && (
                  <Box p="40px" textAlign="center">
                    <Text color={textColorSecondary} fontSize="sm">
                      No System 1 agents found
                    </Text>
                  </Box>
                )}
              </Card>
            </TabPanel>

            {/* System 2 Tab */}
            <TabPanel p="0" pt="20px">
              <Card
                bg={cardBg}
                p="20px"
                borderRadius="12px"
                border="1px solid"
                borderColor={borderColor}
              >
                <InputGroup mb="20px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search System 2 agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="8px"
                    bg="white"
                    borderColor={borderColor}
                  />
                </InputGroup>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="15px">
                  {filteredAgents('System 2').map((agent) => (
                    <AgentCard key={agent.id} agent={agent} showToggle={true} />
                  ))}
                </SimpleGrid>

                {filteredAgents('System 2').length === 0 && (
                  <Box p="40px" textAlign="center">
                    <Text color={textColorSecondary} fontSize="sm">
                      No System 2 agents found
                    </Text>
                  </Box>
                )}
              </Card>
            </TabPanel>

            {/* Pipeline View Tab */}
            <TabPanel p="0" pt="20px">
              <VStack spacing="20px" align="stretch">
                {/* System 1 Pipeline */}
                <Card
                  bg={cardBg}
                  p="20px"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Text color={textColor} fontSize="lg" fontWeight="600" mb="15px">
                    System 1: Data Pipeline
                  </Text>
                  <HStack spacing="15px" mb="15px" align="center">
                    <VStack spacing="4px">
                      <Box
                        w="100px"
                        h="60px"
                        bg="blue.50"
                        borderRadius="8px"
                        border="2px solid"
                        borderColor="blue.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" fontWeight="600" color="blue.700">
                          Stage 1
                        </Text>
                      </Box>
                      <Badge colorScheme="blue" fontSize="2xs">
                        {allAgents.filter(a => a.stage?.includes('Stage 1')).length} agents
                      </Badge>
                    </VStack>
                    <Text color="gray.400" fontSize="2xl">→</Text>
                    <VStack spacing="4px">
                      <Box
                        w="100px"
                        h="60px"
                        bg="purple.50"
                        borderRadius="8px"
                        border="2px solid"
                        borderColor="purple.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" fontWeight="600" color="purple.700">
                          Stage 2
                        </Text>
                      </Box>
                      <Badge colorScheme="purple" fontSize="2xs">
                        {allAgents.filter(a => a.stage?.includes('Stage 2')).length} agents
                      </Badge>
                    </VStack>
                    <Text color="gray.400" fontSize="2xl">→</Text>
                    <VStack spacing="4px">
                      <Box
                        w="100px"
                        h="60px"
                        bg="green.50"
                        borderRadius="8px"
                        border="2px solid"
                        borderColor="green.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" fontWeight="600" color="green.700">
                          Stage 3
                        </Text>
                      </Box>
                      <Badge colorScheme="green" fontSize="2xs">
                        {allAgents.filter(a => a.stage?.includes('Stage 3')).length} agents
                      </Badge>
                    </VStack>
                    <Text color="gray.400" fontSize="2xl">→</Text>
                    <VStack spacing="4px">
                      <Box
                        w="100px"
                        h="60px"
                        bg="teal.50"
                        borderRadius="8px"
                        border="2px solid"
                        borderColor="teal.300"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={MdCheckCircle} boxSize="24px" color="teal.600" />
                      </Box>
                      <Badge colorScheme="teal" fontSize="2xs">
                        Output
                      </Badge>
                    </VStack>
                  </HStack>
                </Card>

                {/* System 2 Pipeline */}
                <Card
                  bg={cardBg}
                  p="20px"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Text color={textColor} fontSize="lg" fontWeight="600" mb="15px">
                    System 2: Decision Making
                  </Text>
                  <SimpleGrid columns={4} spacing="10px">
                    {['Team 1', 'Team 2', 'Team 3', 'Team 4'].map((team, idx) => (
                      <VStack key={team} spacing="4px">
                        <Box
                          w="full"
                          h="60px"
                          bg="orange.50"
                          borderRadius="8px"
                          border="2px solid"
                          borderColor="orange.300"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="xs" fontWeight="600" color="orange.700">
                            {team}
                          </Text>
                        </Box>
                        <Badge colorScheme="orange" fontSize="2xs">
                          {allAgents.filter(a => a.stage?.includes(team)).length} agents
                        </Badge>
                      </VStack>
                    ))}
                  </SimpleGrid>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Info Card */}
        <Card
          bg="blue.50"
          p="20px"
          mt="20px"
          borderRadius="12px"
          border="1px solid"
          borderColor="blue.200"
        >
          <HStack spacing="12px" align="start">
            <Icon as={MdApi} boxSize="20px" color="blue.600" />
            <VStack align="start" spacing="4px">
              <Text color="blue.900" fontSize="sm" fontWeight="600">
                Modular Pipeline Architecture
              </Text>
              <Text color="blue.800" fontSize="xs">
                <strong>System 1:</strong> Plug agents into data retrieval, normalization, or feature extraction stages.
                Create custom agents to fetch unique data sources or calculate proprietary financial metrics.
              </Text>
              <Text color="blue.800" fontSize="xs">
                <strong>System 2:</strong> Add custom decision-making agents alongside built-in researchers.
                Your agents work together with Event Horizon's AI teams to generate trading signals.
              </Text>
            </VStack>
          </HStack>
        </Card>
      </Box>

      {/* Create Agent Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingAgent ? 'Edit Custom Agent' : 'Create Custom Agent'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="20px">
            <VStack spacing="16px" align="stretch">
              {/* Name */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Name
                </FormLabel>
                <Input
                  placeholder="e.g., Dividend Hunter"
                  value={newAgent.name}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, name: e.target.value })
                  }
                  size="md"
                />
              </FormControl>

              {/* Description */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Description
                </FormLabel>
                <Textarea
                  placeholder="Describe what this agent does, e.g., 'An agent that finds high-yield dividend stocks with sustainable payout ratios'"
                  value={newAgent.description}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, description: e.target.value })
                  }
                  size="md"
                  rows={3}
                />
                <Text fontSize="xs" color="gray.500" mt="4px">
                  This description will be used to generate the system prompt
                </Text>
              </FormControl>

              {/* Category and Team in a row */}
              <SimpleGrid columns={2} spacing="15px">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Category
                  </FormLabel>
                  <Select
                    value={newAgent.category}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, category: e.target.value })
                    }
                    size="md"
                  >
                    {AGENT_CATEGORIES.filter((c) => c.system === newAgent.system).map(
                      (cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      )
                    )}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Team
                  </FormLabel>
                  <Select
                    value={newAgent.stage}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, stage: e.target.value })
                    }
                    size="md"
                  >
                    {newAgent.system === 'System 1'
                      ? SYSTEM1_STAGES.map((stage) => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))
                      : SYSTEM2_TEAMS.map((team) => (
                          <option key={team.value} value={team.value}>
                            {team.label}
                          </option>
                        ))}
                  </Select>
                  {newAgent.system === 'System 2' && (
                    <Text fontSize="xs" color="gray.500" mt="4px">
                      {SYSTEM2_TEAMS.find((t) => t.value === newAgent.stage)?.description}
                    </Text>
                  )}
                </FormControl>
              </SimpleGrid>

              {/* Thinking Mode Section */}
              <Box
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
                p="16px"
                bg="purple.50"
              >
                <HStack justify="space-between" mb="12px">
                  <HStack spacing="8px">
                    <Icon as={MdPsychology} color="purple.600" boxSize="20px" />
                    <VStack align="start" spacing="0">
                      <Text fontSize="sm" fontWeight="600" color={textColor}>
                        Enable Iterative Thinking
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Agent will reason about what data it needs and can request tools
                      </Text>
                    </VStack>
                  </HStack>
                  <Switch
                    colorScheme="purple"
                    isChecked={newAgent.enableThinking}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, enableThinking: e.target.checked })
                    }
                    size="md"
                  />
                </HStack>

                {newAgent.enableThinking && (
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">
                      Max Iterations
                    </FormLabel>
                    <Select
                      value={newAgent.maxIterations}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, maxIterations: parseInt(e.target.value) })
                      }
                      size="sm"
                      bg="white"
                    >
                      <option value={3}>3 (Fast)</option>
                      <option value={5}>5 (Balanced)</option>
                      <option value={10}>10 (Thorough)</option>
                    </Select>
                    <Text fontSize="xs" color="gray.500" mt="4px">
                      Higher iterations allow more data gathering but take longer
                    </Text>
                  </FormControl>
                )}
              </Box>

              {/* System Prompt Section */}
              <Box
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
                p="16px"
                bg="gray.50"
              >
                <HStack justify="space-between" mb={showSystemPrompt ? '12px' : '0'}>
                  <HStack spacing="8px">
                    <Icon as={MdAutoAwesome} color="purple.500" />
                    <Text fontSize="sm" fontWeight="600" color={textColor}>
                      System Prompt
                    </Text>
                    {newAgent.systemPrompt && (
                      <Badge colorScheme="green" fontSize="xs">
                        Generated
                      </Badge>
                    )}
                  </HStack>
                  <HStack spacing="8px">
                    <Button
                      size="sm"
                      leftIcon={isGenerating ? <Spinner size="xs" /> : <Icon as={MdRefresh} />}
                      onClick={handleGeneratePrompt}
                      isLoading={isGenerating}
                      loadingText="Generating..."
                      variant="outline"
                      colorScheme="purple"
                      isDisabled={!newAgent.name.trim() || !newAgent.description.trim()}
                    >
                      {newAgent.systemPrompt ? 'Regenerate' : 'Generate'}
                    </Button>
                    {newAgent.systemPrompt && (
                      <IconButton
                        size="sm"
                        icon={<Icon as={showSystemPrompt ? MdExpandLess : MdExpandMore} />}
                        onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                        variant="ghost"
                        aria-label="Toggle system prompt"
                      />
                    )}
                  </HStack>
                </HStack>

                <Collapse in={showSystemPrompt} animateOpacity>
                  <FormControl>
                    <Textarea
                      value={newAgent.systemPrompt}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, systemPrompt: e.target.value })
                      }
                      placeholder="System prompt will be generated based on name, description, and team..."
                      size="md"
                      rows={8}
                      fontFamily="mono"
                      fontSize="xs"
                      bg="white"
                    />
                    <Text fontSize="xs" color="gray.500" mt="4px">
                      You can edit the generated prompt to customize the agent's behavior
                    </Text>
                  </FormControl>
                </Collapse>

                {!showSystemPrompt && !newAgent.systemPrompt && (
                  <Text fontSize="xs" color="gray.500">
                    Click "Generate" to create a system prompt based on your name and description
                  </Text>
                )}
              </Box>

              {/* Action Buttons */}
              <HStack justify="space-between" pt="10px">
                <Button
                  variant="outline"
                  leftIcon={<Icon as={MdAutoAwesome} />}
                  onClick={handleGeneratePrompt}
                  isLoading={isGenerating}
                  isDisabled={!newAgent.name.trim() || !newAgent.description.trim()}
                >
                  Save Config
                </Button>
                <HStack spacing="10px">
                  <Button variant="ghost" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    bg={brandColor}
                    color="white"
                    onClick={handleCreateAgent}
                    _hover={{ bg: 'teal.700' }}
                    isLoading={isLoading}
                    loadingText={editingAgent ? 'Updating...' : 'Creating...'}
                  >
                    {editingAgent ? 'Update Agent' : 'Create Agent'}
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
