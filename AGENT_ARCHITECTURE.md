# Agent Architecture Strategy

## Overview

Event Horizon uses a flexible, modular agent architecture where each agent can be powered by different LLM backends (API-based or local GPU-based).

## Agent Structure

```javascript
Agent = {
  // Identity
  id: "bull_researcher_001",
  name: "Bull Researcher",
  description: "Generates bullish investment thesis",
  type: "strategy_agent",
  system: "team",

  // LLM Configuration
  llm: {
    backend: "claude" | "openai" | "gemini" | "local-llama" | "local-mistral",
    model: "claude-3-opus",
    parameters: {
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1.0,
    }
  },

  // System Prompt (Agent's instructions)
  systemPrompt: "You are a bullish investment researcher...",

  // Agent-specific config
  config: {
    // Any custom settings for this agent
  }
}
```

## LLM Backend Options

### 1. API-Based LLMs (Cloud)

#### **Claude (Anthropic)**
- ✅ Claude Opus 4.5 - Most capable
- ✅ Claude Sonnet 4.5 - Balanced performance
- ✅ Claude Haiku 3 - Fast & cost-effective
- **Pros**: Highest quality, no infrastructure needed
- **Cons**: Cost per token, API latency

#### **OpenAI (GPT)**
- ✅ GPT-4 Turbo - Most capable
- ✅ O1 - Reasoning model
- ✅ GPT-3.5 Turbo - Fast & cheap
- **Pros**: Well-documented, reliable
- **Cons**: Cost, data privacy concerns

#### **Google Gemini**
- ✅ Gemini 2.0 Flash - Ultra-fast
- ✅ Gemini 1.5 Pro - Huge context (2M tokens)
- **Pros**: Massive context window, multimodal
- **Cons**: Less proven for finance

### 2. Local GPU-Based LLMs

#### **Llama (Meta)**
- ✅ Llama 3.3 70B - Best open-source
- ✅ Llama 3.1 405B - Largest (needs multi-GPU)
- **Pros**: Free after setup, data privacy, customizable
- **Cons**: Requires GPU infrastructure, setup complexity

#### **Mistral**
- ✅ Mistral Large 2 - Competitive with GPT-4
- ✅ Mixtral 8x22B - Mixture of experts
- **Pros**: Strong performance, efficient
- **Cons**: GPU requirements

#### **Qwen (Alibaba)**
- ✅ Qwen 2.5 72B - Excellent reasoning
- ✅ Qwen2-VL 72B - Vision + Language
- **Pros**: Vision capabilities, multilingual
- **Cons**: Less Western finance training

#### **DeepSeek**
- ✅ DeepSeek V3 - Strong reasoning
- ✅ DeepSeek Coder - Code specialist
- **Pros**: Very cost-effective
- **Cons**: Newer, less tested

## Agent Execution Flow

```
┌─────────────────┐
│  Portfolio Data │
│  [AAPL, TSLA]   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Agent: Candlestick Analyzer    │
│  ┌──────────────────────────┐   │
│  │ System Prompt:           │   │
│  │ "You are a candlestick   │   │
│  │  chart expert..."        │   │
│  └──────────────────────────┘   │
│                                  │
│  LLM Backend: Claude             │
│  Model: claude-3-sonnet          │
│  Temperature: 0.7                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  LLM Router                      │
│  ┌──────────┐  ┌──────────────┐ │
│  │ If API:  │  │ If Local:    │ │
│  │ HTTP req │  │ vLLM/Ollama  │ │
│  └──────────┘  └──────────────┘ │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│  JSON Output    │
│  {              │
│    analysis: {} │
│    signals: []  │
│  }              │
└─────────────────┘
```

## Backend Infrastructure

### API-Based Setup (Simple)

```yaml
# .env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
```

**Pros**:
- ✅ No infrastructure management
- ✅ Auto-scaling
- ✅ Always latest models

**Cons**:
- ❌ Pay per token (~$0.003/1K tokens)
- ❌ Data sent to third party
- ❌ API rate limits

### Local GPU Setup (Advanced)

```yaml
# Hardware Requirements
GPU: NVIDIA A100 (80GB) or 2x RTX 4090
RAM: 128GB+ recommended
Storage: 500GB+ SSD

# Software Stack
- vLLM (inference server)
- OR Ollama (simpler alternative)
- OR llama.cpp (CPU fallback)
```

**Pros**:
- ✅ $0 per inference (after setup)
- ✅ Complete data privacy
- ✅ No rate limits
- ✅ Custom fine-tuning possible

**Cons**:
- ❌ Hardware investment ($5K-$30K)
- ❌ Setup complexity
- ❌ Maintenance required
- ❌ Electricity costs (~$0.50/hr)

## Cost Comparison Example

**Scenario**: Analyze 10 stocks daily with 5 agents

### API-Based (Claude Sonnet)
```
Per analysis:
- Input: ~1000 tokens × 5 agents × 10 stocks = 50K tokens
- Output: ~500 tokens × 5 agents × 10 stocks = 25K tokens
- Cost: (50K × $3/1M) + (25K × $15/1M) = $0.525 per analysis

Monthly (30 days): $15.75/month
Annual: $189/year
```

### Local GPU (Llama 3.3 70B)
```
Initial Setup:
- 2x RTX 4090: $3,200
- Server build: $1,500
- Total: $4,700

Operating Costs:
- Electricity: ~$0.50/hr × 2hr/day = $1/day
- Monthly: $30/month
- Annual: $360/year + $4,700 amortized = $5,060 first year

Break-even: ~30 months vs API
```

## Strategy Recommendation

### Phase 1: Start with APIs
- Use Claude Sonnet for critical agents (bull/bear researchers)
- Use GPT-3.5 or Gemini Flash for data agents
- Validate product-market fit
- Estimated cost: $20-50/month

### Phase 2: Hybrid Approach
- Keep strategic agents on Claude/GPT-4
- Move data agents (candlestick, news) to local GPU
- Best of both worlds
- Estimated cost: $10/month API + GPU electricity

### Phase 3: Full Local (Optional)
- Custom fine-tuned models for finance
- Complete data privacy
- Zero marginal cost
- Requires technical expertise

## Implementation Checklist

- [x] Define agent configuration schema
- [x] Create LLM backend registry
- [x] Default system prompts for each agent type
- [ ] Update agent creation UI with LLM backend selection
- [ ] Implement LLM router in backend
- [ ] Add vLLM/Ollama integration for local models
- [ ] Add cost tracking and monitoring
- [ ] Add agent performance metrics (accuracy, speed)

## Next Steps

1. **Backend**: Create LLM router that handles both API and local requests
2. **Frontend**: Update agent creation modal to select backend + model
3. **Infrastructure**: Set up vLLM server for local models
4. **Testing**: Benchmark performance across different backends
5. **Monitoring**: Add cost tracking and performance dashboards
