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
} from '@chakra-ui/react';
import { useState } from 'react';
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
} from 'react-icons/md';
import Card from 'components/card/Card.js';

// Built-in System 1 Agents
const BUILTIN_SYSTEM1_AGENTS = [
  {
    id: 'builtin_1',
    name: 'Price Data Retriever',
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
const BUILTIN_SYSTEM2_AGENTS = [
  // ===== TEAM 1: MARKET ANALYSIS (Analyst Team) =====
  {
    id: 'builtin_4',
    name: 'Fundamentals Analyst',
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
  { value: 'data_retriever', label: '📊 Data Retriever', system: 'System 1' },
  { value: 'news_agent', label: '📰 News Agent', system: 'System 1' },
  { value: 'technical_agent', label: '📈 Technical Agent', system: 'System 1' },
  { value: 'financial_metrics', label: '💰 Financial Metrics', system: 'System 1' },
  { value: 'api_connector', label: '🔗 API Connector', system: 'System 1' },
  { value: 'strategy_agent', label: '🎯 Strategy Agent', system: 'System 2' },
  { value: 'risk_manager', label: '⚖️ Risk Manager', system: 'System 2' },
  { value: 'custom_analyzer', label: '🤖 Custom Analyzer', system: 'System 2' },
];

const SYSTEM1_STAGES = [
  { value: 'stage1', label: 'Stage 1 - Data Retrieval' },
  { value: 'stage2', label: 'Stage 2 - Normalization' },
  { value: 'stage3', label: 'Stage 3 - LLM Features' },
];

const SYSTEM2_TEAMS = [
  { value: 'team1', label: 'Team 1 - Market Analysis' },
  { value: 'team2', label: 'Team 2 - Bull/Bear Debate' },
  { value: 'team3', label: 'Team 3 - Portfolio Optimization' },
  { value: 'team4', label: 'Team 4 - Risk Assessment' },
];

// LLM Providers (TradingAgents compatible)
// Google Gemini has FREE tier, Ollama is FREE (runs locally)
const LLM_PROVIDERS = [
  { value: 'google', label: 'Google Gemini (FREE tier)', icon: '💎', free: true },
  { value: 'ollama', label: 'Ollama (Local - FREE)', icon: '🦙', free: true },
  { value: 'openai', label: 'OpenAI', icon: '✨', free: false },
  { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🤖', free: false },
  { value: 'xai', label: 'xAI (Grok)', icon: '🚀', free: false },
  { value: 'openrouter', label: 'OpenRouter', icon: '🔀', free: false },
];

// Deep Think Models by provider
const DEEP_THINK_MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'o1', label: 'O1' },
  ],
  anthropic: [
    { value: 'claude-opus-4-5', label: 'Claude Opus 4.5' },
    { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
    { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  ],
  google: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  ],
  xai: [
    { value: 'grok-2', label: 'Grok 2' },
  ],
  openrouter: [
    { value: 'openai/gpt-4o', label: 'GPT-4o' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  ],
  ollama: [
    { value: 'llama3.3:70b', label: 'Llama 3.3 70B' },
    { value: 'mixtral:8x7b', label: 'Mixtral 8x7B' },
    { value: 'deepseek-r1:70b', label: 'DeepSeek R1 70B' },
  ],
};

// Quick Think Models by provider
const QUICK_THINK_MODELS = {
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'o1-mini', label: 'O1 Mini' },
    { value: 'o3-mini', label: 'O3 Mini' },
  ],
  anthropic: [
    { value: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku' },
  ],
  google: [
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  xai: [
    { value: 'grok-2-mini', label: 'Grok 2 Mini' },
  ],
  openrouter: [
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
  ],
  ollama: [
    { value: 'llama3.1:8b', label: 'Llama 3.1 8B' },
    { value: 'mistral:7b', label: 'Mistral 7B' },
    { value: 'deepseek-r1:14b', label: 'DeepSeek R1 14B' },
  ],
};

export default function AgentsPage() {
  const [customAgents, setCustomAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // New agent form state (TradingAgents dual-LLM config)
  // Default to Google Gemini (FREE tier available)
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    category: 'data_retriever',
    system: 'System 1',
    stage: 'stage1',
    provider: 'google',
    deepThinkModel: 'gemini-1.5-pro',
    quickThinkModel: 'gemini-2.0-flash',
    status: 'inactive',
  });

  // Colors
  const textColor = '#1F2937';
  const textColorSecondary = 'gray.600';
  const brandColor = 'teal.600';
  const cardBg = 'white';
  const borderColor = 'gray.200';

  const allAgents = [...BUILTIN_SYSTEM1_AGENTS, ...BUILTIN_SYSTEM2_AGENTS, ...customAgents];

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

    const categoryInfo = AGENT_CATEGORIES.find((c) => c.value === newAgent.category);
    const providerInfo = LLM_PROVIDERS.find((p) => p.value === newAgent.provider);
    const agent = {
      id: Date.now().toString(),
      name: newAgent.name,
      description: newAgent.description,
      category: categoryInfo?.label || 'Custom',
      system: newAgent.system,
      stage: newAgent.system === 'System 1'
        ? SYSTEM1_STAGES.find(s => s.value === newAgent.stage)?.label
        : SYSTEM2_TEAMS.find(t => t.value === newAgent.stage)?.label,
      icon: MdSmartToy,
      status: newAgent.status,
      // TradingAgents dual-LLM configuration
      llm: {
        provider: newAgent.provider,
        providerName: providerInfo?.label,
        deepThinkModel: newAgent.deepThinkModel,
        quickThinkModel: newAgent.quickThinkModel,
      },
      isBuiltin: false,
      created: 'Just now',
    };

    setCustomAgents([agent, ...customAgents]);
    setNewAgent({
      name: '',
      description: '',
      category: 'data_retriever',
      system: 'System 1',
      stage: 'stage1',
      provider: 'google',
      deepThinkModel: 'gemini-1.5-pro',
      quickThinkModel: 'gemini-2.0-flash',
      status: 'inactive',
    });
    onClose();

    toast({
      title: 'Agent created',
      description: `${agent.name} is ready. Enable it to add to your pipeline.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleToggleAgent = (id) => {
    setCustomAgents(
      customAgents.map((agent) =>
        agent.id === id
          ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
          : agent
      )
    );
  };

  const handleDeleteAgent = (id) => {
    setCustomAgents(customAgents.filter((a) => a.id !== id));
    toast({
      title: 'Agent deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
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
                onClick={() => {}}
              >
                <Icon as={MdSettings} />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                color="red.500"
                onClick={() => handleDeleteAgent(agent.id)}
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
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Custom Agent</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="20px">
            <VStack spacing="20px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Agent Name
                </FormLabel>
                <Input
                  placeholder="e.g., Custom P/E Calculator"
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
                  System
                </FormLabel>
                <Select
                  value={newAgent.system}
                  onChange={(e) =>
                    setNewAgent({
                      ...newAgent,
                      system: e.target.value,
                      stage: e.target.value === 'System 1' ? 'stage1' : 'team1'
                    })
                  }
                  size="md"
                >
                  <option value="System 1">System 1 - Data Pipeline</option>
                  <option value="System 2">System 2 - Decision Making</option>
                </Select>
              </FormControl>

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
                  {AGENT_CATEGORIES.filter(c => c.system === newAgent.system).map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  {newAgent.system === 'System 1' ? 'Pipeline Stage' : 'Team'}
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
                      ))
                  }
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  LLM Provider
                </FormLabel>
                <Select
                  value={newAgent.provider}
                  onChange={(e) => {
                    const provider = e.target.value;
                    const deepModels = DEEP_THINK_MODELS[provider] || [];
                    const quickModels = QUICK_THINK_MODELS[provider] || [];
                    setNewAgent({
                      ...newAgent,
                      provider,
                      deepThinkModel: deepModels[0]?.value || '',
                      quickThinkModel: quickModels[0]?.value || '',
                    });
                  }}
                  size="md"
                >
                  {LLM_PROVIDERS.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.icon} {provider.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <SimpleGrid columns={2} spacing="15px">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Deep Think Model
                  </FormLabel>
                  <Select
                    value={newAgent.deepThinkModel}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, deepThinkModel: e.target.value })
                    }
                    size="md"
                  >
                    {(DEEP_THINK_MODELS[newAgent.provider] || []).map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </Select>
                  <Text fontSize="xs" color="gray.500" mt="4px">
                    For complex reasoning & synthesis
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Quick Think Model
                  </FormLabel>
                  <Select
                    value={newAgent.quickThinkModel}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, quickThinkModel: e.target.value })
                    }
                    size="md"
                  >
                    {(QUICK_THINK_MODELS[newAgent.provider] || []).map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </Select>
                  <Text fontSize="xs" color="gray.500" mt="4px">
                    For rapid tasks & data processing
                  </Text>
                </FormControl>
              </SimpleGrid>

              <FormControl display="flex" alignItems="center">
                <FormLabel fontSize="sm" fontWeight="600" mb="0">
                  Activate Immediately
                </FormLabel>
                <Switch
                  colorScheme="teal"
                  isChecked={newAgent.status === 'active'}
                  onChange={(e) =>
                    setNewAgent({
                      ...newAgent,
                      status: e.target.checked ? 'active' : 'inactive',
                    })
                  }
                />
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
