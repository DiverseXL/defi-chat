React 18 Vite Tailwind CSS OpenAI LP Agent API Birdeye Jupiter

DeFi-Chat

Submission Details
Field: Value
Project Name: DeFi-Chat
Repository: github.com/DiverseXL/defi-chat
Deployment URL: defi-chat.vercel.app
Video Demo: YouTube Demo Placeholder
LinkedIn: LinkedIn Post Placeholder
Solana Address: User Solana Address Placeholder
Stack: React + LP Agent API + Birdeye + Jupiter

Project Overview
DeFi-Chat is an intent-based AI agent designed for the Meteora liquidity protocol on Solana. It transforms natural language financial goals into complex on-chain executions. By leveraging the LP Agent API, the platform provides users with a conversational interface to discover, analyze, and deploy liquidity into high-yield pools with a single wallet signature.

Key Highlights
Natural Language Intent Processing: Plan and execute DeFi strategies by typing simple commands like "invest 1 SOL in the best yielding pool".
Multi-API Intelligence: Combines real-time liquidity data from LP Agent, security analytics from Birdeye, and pricing from Jupiter.
One-Click Execution: Bundles multiple transaction steps into a single signature using LP Agent's Zap In and Zap Out infrastructure.
Real-Time Security Auditing: Automatically runs token security checks (mint authority, freeze authority, holder concentration) before any transaction.
Smart Money Analysis: Tracks top-performing LPer wallets to provide "copy-trading" insights directly within the chat interface.
Persistent Wallet Context: Maintains chat history and portfolio state scoped to individual Solana wallet addresses.

Quick Start
# Clone the repository
git clone https://github.com/DiverseXL/defi-chat.git
cd defi-chat

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your API keys for LP Agent, OpenAI, and Birdeye

# Run development server
npm run dev
Open http://localhost:5173 to access the interface.

How It Works
1. User Input: The user provides a mission or goal via the chat interface (e.g., "Find me a low-risk stable pool").
2. Intent Detection: OpenAI GPT-4o-mini parses the intent and identifies the required action (Strategy, Execute, Smart Money, or Security).
3. Data Enrichment: The orchestrator queries the LP Agent API for live pool metrics and Birdeye for security data.
4. Strategy Recommendation: The AI presents a "Strategy Card" or "Execute Card" with a detailed breakdown of the proposed actions.
5. Execution: Upon user approval, the app calls the LP Agent Zap In/Out API to generate a transaction bundle.
6. On-Chain Landing: The user signs the transaction via Phantom or Solflare, and the assets are deployed to Meteora.

Architecture

User Interface (React + Tailwind)
       |
AI Orchestrator (GPT-4o-mini)
       |
--------------------------------------------------
|                |               |               |
LP Agent API   Birdeye API    Jupiter API    Solana RPC
(Liquidity)    (Security)     (Pricing)      (Execution)

Key Features
Intent-Based Natural Language Interface. The core UX replaces complex dashboards with a conversational agent. It supports complex queries regarding yield, risk management, and market trends.

Automated Token Security. Every recommended pool undergoes a real-time audit via Birdeye. The system flags dangerous mint/freeze authorities and high holder concentration to protect user capital.

Smart Money Insights. By querying the LP Agent top-lpers endpoint, the agent identifies what the most successful liquidity providers are currently holding, allowing users to follow "whale" movements.

One-Click Zap Infrastructure. Utilizing LP Agent's transaction generation endpoints, the app handles the complex math of balancing assets and routing swaps through Jupiter to ensure minimal slippage during deployment.

Interactive Execution Cards. Instead of plain text, the AI generates interactive UI components that break down multi-step strategies into clear, actionable steps.

LP Agent API Integration
DeFi-Chat fulfills all LP Agent Hackathon requirements by integrating the following endpoints:

GET /pools/discover: Used for live pool discovery and ranking.
GET /pools/{poolId}/top-lpers: Powers the Smart Money tracking feature.
GET /lp-positions/opening: Injects user portfolio state into AI context.
GET /lp-positions/overview: Provides high-level portfolio performance metrics.
POST /pools/{poolId}/add-tx: Generates Zap In transaction bundles.
POST /pools/landing-add-tx: Submits signed transactions to the relayer.
POST /position/decrease-quotes: Calculates Zap Out returns.
POST /position/decrease-tx: Generates Zap Out transaction bundles.
POST /position/landing-decrease-tx: Finalizes liquidity removals.

Project Structure
src/
  pages/
    Chat.jsx             # Main conversational interface and execution logic
    Landing.jsx          # Animated product overview and entry point
  components/
    ExecuteCard.jsx      # UI for multi-step transaction plans
    StrategyCard.jsx     # Pool recommendation and metrics display
    SmartMoneyCard.jsx   # Top LPer and whale tracking UI
    TokenSecurityCard.jsx # Birdeye security audit reports
    WalletModal.jsx      # Solana wallet connection management
  services/
    lpAgent.js           # Centralized LP Agent API client
    ai.js                # OpenAI orchestration and intent mapping
    birdeye.js           # Token security and risk analysis
    jupiter.js           # Real-time price feeds
    knowledge.js         # DeFi education and FAQ base

Environment Variables
Variable: Description
VITE_LP_AGENT_KEY: API key from portal.lpagent.io (Required)
VITE_OPENAI_API_KEY: API key from platform.openai.com (Required)
VITE_BIRDEYE_KEY: API key from birdeye.so (Required for security checks)
VITE_JUPITER_API_KEY: API key from jup.ag (Optional)

Documentation
ARCHITECTURE.md: Detailed breakdown of the intent-execution pipeline.
API_INTEGRATION.md: Mapping of LP Agent endpoints to frontend features.

License
MIT License.
