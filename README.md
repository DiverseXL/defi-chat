# DeFi-Chat

> **The AI Agent that executes DeFi from plain English.**

DeFi-Chat is an intent-based AI agent for Meteora liquidity pools on Solana. Instead of navigating complex DeFi interfaces, users simply tell DeFi-Chat what they want — the AI analyzes live pool data, recommends the optimal strategy, and executes the transaction in a single wallet signature.

Built for the **LP Agent Hackathon** — leveraging LP Agent's data infrastructure to power the next generation of DeFi UX.

**Live Demo:** [https://defi-chat-xi.vercel.app/](https://defi-chat-xi.vercel.app/)

---

## The Problem

Providing liquidity on Solana requires:

- Understanding DLMM vs DAMM pools
- Analyzing TVL, APR, organic scores, and volume
- Manually executing multiple transactions
- Monitoring positions for rebalancing

**Most users give up before they start.**

---

## The Solution

```
User types: "I have 1 SOL and want the highest yield with low risk"
         ↓
AI queries LP Agent API for live pool data
         ↓
AI analyzes pools, runs security checks via Birdeye
         ↓
AI recommends optimal strategy with full explanation
         ↓
User clicks "Execute" → signs ONE transaction
         ↓
Liquidity deployed on Meteora
```

**Complex DeFi → Plain English → One Signature**

---

## Features

### Intent Detection

The AI automatically detects what the user wants and responds with the right action:

| User says                            | AI does                                         |
| ------------------------------------ | ----------------------------------------------- |
| "Find me the best pool"              | Returns Strategy Card with real pool data       |
| "Move my liquidity to a better pool" | Returns Execute Card with Zap Out → Zap In plan |
| "What are whales doing?"             | Returns Smart Money Card with top LPer data     |
| "What is impermanent loss?"          | Explains clearly with examples                  |

### One-Click Execution

- Multi-step DeFi operations bundled into one signature
- Zap In and Zap Out powered by LP Agent API
- Jupiter Ultra routing for optimal swap prices

### Token Security

- Automatic Birdeye security check before every execution
- Holder concentration analysis
- Freeze/mint authority detection
- Risk level assessment (Low/Medium/High)

### Smart Money Tracking

- Real-time top LPer wallet data from LP Agent
- See what the best performers are investing in
- One-click copy strategy

### Live Market Data

- Real-time SOL price from Jupiter API
- Live pool TVL and 24h volume from LP Agent
- Live/Demo mode indicator

### Full Chat Experience

- ChatGPT-style interface optimized for DeFi
- Persistent chat history per wallet address
- Suggested prompts for quick exploration
- Word-by-word AI response streaming
- Mobile responsive with hamburger sidebar

### Wallet Integration

- Phantom and Solflare support
- Non-custodial — read-only mode available without connecting
- Chat history scoped per wallet address

---

## Tech Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Frontend       | React + Vite + Tailwind CSS v3             |
| Routing        | React Router DOM                           |
| Animations     | Framer Motion                              |
| AI Brain       | OpenAI GPT-4o-mini                         |
| LP Data        | LP Agent API                               |
| Token Security | Birdeye API                                |
| Price Feed     | Jupiter Price API v3                       |
| Wallet         | Solana Wallet Adapter (Phantom + Solflare) |
| Deployment     | Vercel                                     |

---

## LP Agent API Integration

DeFi-Chat uses the following LP Agent endpoints:

```
GET  /pools/discover              → Fetch top Meteora pools by volume
GET  /pools/{poolId}/top-lpers    → Smart Money tracking
GET  /lp-positions/opening        → User's open positions
GET  /lp-positions/overview       → Portfolio metrics
POST /pools/{poolId}/add-tx       → Zap In transaction generation
POST /pools/{poolId}/landing-add-tx → Submit signed Zap In
POST /position/decrease-quotes    → Zap Out quote
POST /position/decrease-tx        → Zap Out transaction generation
POST /position/landing-decrease-tx → Submit signed Zap Out
```

### Zap In Flow

```
User clicks "Execute Strategy"
         ↓
Birdeye security check
         ↓
LP Agent generates transaction (POST /add-tx)
         ↓
Phantom/Solflare receives transaction
         ↓
User signs → transaction lands on Solana
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A Solana wallet (Phantom or Solflare)

### Installation

```bash
git clone https://github.com/DiverseXL/defi-chat.git
cd defi-chat
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_LP_AGENT_KEY=your_lp_agent_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_BIRDEYE_KEY=your_birdeye_key
VITE_JUPITER_API_KEY=your_jupiter_key
```

**Get your keys:**

- LP Agent: https://portal.lpagent.io
- OpenAI: https://platform.openai.com
- Birdeye: https://birdeye.so/api
- Jupiter: https://portal.jup.ag

### Run Locally

```bash
npm run dev
```

Open http://localhost:5173

---

## How to Use

### Try these prompts:

**Strategy:**

```
I have 1 SOL and want the highest yield right now
```

**Execute:**

```
Move my liquidity to the best performing pool
```

**Smart Money:**

```
What are top LPers investing in on Meteora?
```

**Security Check:**

```
Is this pool safe to enter? Run a full security check
```

**DeFi Education:**

```
Explain impermanent loss and how to minimize it
```

---

## Project Structure

```
defi-chat/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx          # Landing page with Framer Motion
│   │   └── Chat.jsx             # Main chat interface
│   ├── components/
│   │   ├── ExecuteCard.jsx      # Intent execution card
│   │   ├── StrategyCard.jsx     # Pool recommendation card
│   │   ├── SmartMoneyCard.jsx   # Whale tracking card
│   │   ├── TokenSecurityCard.jsx # Birdeye security report
│   │   └── WalletModal.jsx      # Wallet connect modal
│   ├── services/
│   │   ├── lpAgent.js           # LP Agent API integration
│   │   ├── ai.js                # OpenAI integration + intent detection
│   │   ├── birdeye.js           # Token security analysis
│   │   ├── jupiter.js           # Price feed
│   │   └── knowledge.js         # DeFi knowledge base
│   ├── App.jsx
│   └── main.jsx
├── .env                         # API keys (never commit)
└── README.md
```

---

## Why DeFi-Chat Wins

### Fulfillment of Requirements

- Uses 9+ LP Agent endpoints
- Zap In confirmed working (Phantom popup with real transaction)
- Zap Out implemented
- Clear demo of LP Agent usage throughout entire UX

### Quality/Effectiveness of LP Agent Use

- Real pool data powers every AI response
- Pool IDs flow directly from API -> AI -> Transaction
- Top LPer data used for Smart Money feature
- Portfolio overview from LP Agent displayed to users

### Creativity & User Experience

- Intent-based natural language interface — nobody else is doing this
- Three card types adapting to user intent
- Mobile responsive with full sidebar navigation
- Wallet-scoped persistent chat history
- Token security check before every transaction
- Animated landing page with live typewriter demos

### Innovation

- "Say it -> Sign once -> Done" — genuinely new DeFi UX paradigm
- AI agent that detects intent and routes to correct on-chain action
- Smart Money tracking inside a conversational interface
- Multi-API intelligence (LP Agent + Birdeye + Jupiter) unified under one chat

---

## Links

-
- **LP Agent**: https://lpagent.io
- **Meteora**: https://meteora.ag
- **Built by**: [@theyclonedsam](https://twitter.com/theyclonedsam)

---

## License

MIT License — feel free to fork and build on top of this.

---

> _"We believe AI Agents will be the next huge wave"_ — LP Agent
>
> DeFi-Chat is that wave.
