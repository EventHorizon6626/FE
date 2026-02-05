# Thinking Agent System - Frontend

## Overview

The frontend provides UI components for creating, configuring, and visualizing thinking agents. Thinking agents use iterative ReAct-style reasoning to gather data and generate analysis.

## Features

1. **Agent Creation** - Toggle to enable thinking mode with configurable iterations
2. **Pipeline Visualization** - Real-time thinking progress display
3. **Thinking Steps** - Collapsible view of agent reasoning
4. **Paused State Handling** - Modal for creating suggested data agents

## API Client

### `runThinkingAgent(stocks, systemPrompt, inputData, maxIterations)`

Execute a thinking agent with iterative reasoning.

```javascript
// src/lib/agentApi.js

export const runThinkingAgent = async (stocks, systemPrompt, inputData = null, maxIterations = 5) => {
  const response = await request.post('/ai/agents/think', {
    stocks,
    system_prompt: systemPrompt,
    input_data: inputData,
    max_iterations: maxIterations,
    available_tools: ['candlestick', 'earnings', 'news', 'technical', 'fundamentals'],
  });
  return response;
};
```

### `runAgent(agentType, inputData, customAgentConfig)`

Updated to automatically use thinking mode when enabled:

```javascript
export const runAgent = async (agentType, inputData, customAgentConfig = null) => {
  const { stocks, data } = inputData;

  // Check if thinking mode is enabled
  if (customAgentConfig?.enableThinking) {
    return await runThinkingAgent(
      stocks,
      customAgentConfig.systemPrompt,
      data,
      customAgentConfig.maxIterations || 5
    );
  }

  // ... standard agent execution
};
```

## Agent Creation Modal

### New State Fields

```javascript
const [newAgent, setNewAgent] = useState({
  name: '',
  description: '',
  category: 'strategy_agent',
  system: 'System 2',
  stage: 'Team 1',
  systemPrompt: '',
  enableThinking: true,    // NEW - default enabled
  maxIterations: 5,         // NEW - default 5 iterations
  status: 'active',
});
```

### Thinking Mode UI

Located in `src/views/admin/agents/index.jsx`:

```jsx
{/* Thinking Mode Section */}
<Box border="1px solid" borderColor={borderColor} borderRadius="8px" p="16px" bg="purple.50">
  <HStack justify="space-between" mb="12px">
    <HStack spacing="8px">
      <Icon as={MdPsychology} color="purple.600" boxSize="20px" />
      <VStack align="start" spacing="0">
        <Text fontSize="sm" fontWeight="600">
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
      onChange={(e) => setNewAgent({ ...newAgent, enableThinking: e.target.checked })}
    />
  </HStack>

  {newAgent.enableThinking && (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight="600">Max Iterations</FormLabel>
      <Select
        value={newAgent.maxIterations}
        onChange={(e) => setNewAgent({ ...newAgent, maxIterations: parseInt(e.target.value) })}
      >
        <option value={3}>3 (Fast)</option>
        <option value={5}>5 (Balanced)</option>
        <option value={10}>10 (Thorough)</option>
      </Select>
    </FormControl>
  )}
</Box>
```

## Pipeline Visualization

### Agent Node Component

Located in `src/views/admin/pipeline/detail.jsx`:

```jsx
function CustomAgentNode({ data, id, selected }) {
  const [showThinking, setShowThinking] = useState(false);
  const isRunning = data.isRunning;
  const thinkingSteps = data.thinkingSteps || [];
  const output = data.output;
  const isPaused = data.status === 'paused';

  return (
    <Box>
      {/* Standard node content */}

      {/* Thinking indicator while running */}
      {isRunning && thinkingSteps.length > 0 && (
        <Box mt="12px" p="10px" bg="purple.50" borderRadius="8px">
          <HStack spacing="8px">
            <Spinner size="xs" color="purple.500" />
            <Text fontSize="xs" color="purple.700" fontWeight="600">
              Thinking... (Step {thinkingSteps.length})
            </Text>
          </HStack>
          <Text fontSize="xs" color="purple.600" mt="6px" noOfLines={2}>
            {thinkingSteps[thinkingSteps.length - 1]?.thought}
          </Text>
        </Box>
      )}

      {/* Paused indicator */}
      {isPaused && (
        <Box mt="12px" p="10px" bg="orange.50" borderRadius="8px">
          <HStack spacing="8px">
            <Icon as={MdWarning} color="orange.500" boxSize="16px" />
            <Text fontSize="xs" color="orange.700" fontWeight="600">Paused</Text>
          </HStack>
          <Text fontSize="xs" color="orange.600">{data.pauseReason}</Text>
        </Box>
      )}

      {/* Completed thinking summary */}
      {output?.thinking_steps && !isRunning && (
        <Box mt="12px">
          <Button
            size="xs"
            variant="ghost"
            colorScheme="purple"
            leftIcon={<Icon as={MdPsychology} />}
            onClick={() => setShowThinking(!showThinking)}
          >
            {showThinking ? 'Hide' : 'Show'} Thinking ({output.iterations_used} steps)
          </Button>
          <Collapse in={showThinking}>
            {output.thinking_steps.map((step, i) => (
              <Box key={i} p="8px" bg="gray.50" borderRadius="6px" fontSize="xs">
                <Badge colorScheme="purple">Step {step.iteration}</Badge>
                <Badge colorScheme={step.action === 'call_tool' ? 'blue' : 'green'}>
                  {step.action}
                </Badge>
                {step.tool && <Badge colorScheme="teal">{step.tool}</Badge>}
                <Text color="gray.700">{step.thought}</Text>
              </Box>
            ))}
          </Collapse>
        </Box>
      )}
    </Box>
  );
}
```

### Handling Execution Results

```javascript
const handleNodePlay = useCallback(async (nodeId) => {
  // ... setup code ...

  const result = await runAgent(agentType, inputData, customAgentConfig);

  // Check for paused state (needs custom data agent)
  if (result?.status === 'paused' && result?.reason === 'need_data_agent') {
    setDataAgentModal({
      nodeId: nodeId,
      suggestedAgent: result.suggested_data_agent,
      thinkingSteps: result.thinking_steps,
      resumeContext: result.resume_context,
    });
    onDataAgentOpen();

    // Update node to show paused state
    setNodes((nds) => nds.map((n) =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, status: 'paused', pauseReason: result.message } }
        : n
    ));
    return;
  }

  // Normal completion
  setNodes((nds) => nds.map((n) =>
    n.id === nodeId
      ? { ...n, data: { ...n.data, output: result, thinkingSteps: result?.thinking_steps || [] } }
      : n
  ));
}, [/* deps */]);
```

## Data Agent Modal

When a thinking agent pauses because it needs data that doesn't exist, a modal appears:

```jsx
<Modal isOpen={isDataAgentOpen} onClose={() => {}} closeOnOverlayClick={false}>
  <ModalContent>
    <ModalHeader>
      <HStack>
        <Icon as={MdPsychology} color="orange.500" />
        <Text>Custom Data Agent Needed</Text>
      </HStack>
    </ModalHeader>
    <ModalBody>
      <Text>The analysis agent needs data that built-in agents don't provide:</Text>

      {/* Missing data info */}
      <Box p="16px" bg="orange.50" borderRadius="12px">
        <Badge colorScheme="orange">Missing Data</Badge>
        <Text fontWeight="700">{dataAgentModal.suggestedAgent?.data_type}</Text>
        <Text fontSize="sm">{dataAgentModal.suggestedAgent?.description}</Text>
      </Box>

      {/* Suggested agent */}
      <Box p="14px" bg="purple.50" borderRadius="12px">
        <Icon as={MdSmartToy} color="purple.600" />
        <Text fontWeight="700">{dataAgentModal.suggestedAgent?.name}</Text>
      </Box>

      {/* Thinking progress so far */}
      {dataAgentModal.thinkingSteps?.map((step, i) => (
        <Box key={i}>...</Box>
      ))}
    </ModalBody>
    <ModalFooter>
      <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
      <Button colorScheme="purple" onClick={handleCreateDataAgent}>
        Create Data Agent
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Creating Suggested Data Agent

```javascript
const handleCreateDataAgent = () => {
  const suggestedAgent = dataAgentModal.suggestedAgent;
  if (suggestedAgent) {
    const newDataAgent = {
      id: `custom-data-${Date.now()}`,
      name: suggestedAgent.name,
      description: suggestedAgent.description,
      type: 'data_retriever',
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
      description: `${newDataAgent.name} has been added. Drag it to the canvas.`,
      status: 'success',
    });
  }

  onDataAgentClose();
};
```

## Node Data Structure

### During Execution

```javascript
{
  agent: { ... },
  isRunning: true,
  thinkingSteps: [
    { iteration: 1, thought: "...", action: "call_tool", tool: "candlestick" },
    { iteration: 2, thought: "...", action: "call_tool", tool: "fundamentals" }
  ],
  status: null
}
```

### After Completion

```javascript
{
  agent: { ... },
  isRunning: false,
  status: 'completed',
  output: {
    status: 'success',
    final_result: { ... },
    thinking_steps: [ ... ],
    tools_used: ['candlestick', 'fundamentals'],
    iterations_used: 3
  }
}
```

### When Paused

```javascript
{
  agent: { ... },
  isRunning: false,
  status: 'paused',
  pauseReason: 'Need data agent to fetch: options chain data',
  thinkingSteps: [ ... ]
}
```

## Visual States

| State | Border Color | Indicator |
|-------|--------------|-----------|
| Normal | Agent color | None |
| Selected | Teal | None |
| Running | Agent color | Purple box with spinner |
| Paused | Orange | Orange warning box |
| Completed (with thinking) | Agent color | Collapsible thinking steps |

## User Flow

1. **Create Agent**: User creates agent with "Enable Iterative Thinking" on
2. **Add to Canvas**: User drags agent to pipeline canvas
3. **Connect**: User connects portfolio to agent
4. **Run**: User clicks play button
5. **Watch Progress**: UI shows thinking steps as they happen
6. **Handle Pause** (if needed): Modal prompts user to create missing data agent
7. **View Results**: Collapsible thinking trace shows reasoning process

## See Also

- [Agent API Documentation](./agent-api.md)
- [Pipeline Builder Guide](./pipeline-builder.md)
- [Component Library](./components.md)
