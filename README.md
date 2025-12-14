# Rift OTC Module

AI-powered token analysis and OTC deal management platform for Rift.ai.

## Overview

The Rift OTC Module enables discounted token trading with short-term lock periods (1-8 weeks). Key features:

- **AI Token Analysis**: GPT-4o powered scoring across 5 dimensions (Technical, Risk, Sentiment, On-Chain, Fundamental)
- **Interactive AI Chat**: Ask follow-up questions about any token. Beginner-friendly explanations.
- **1-Year Price Charts**: Interactive Recharts-based visualization with tooltips.
- **Deal Management**: Create, browse, and accept OTC deals with automatic AI analysis.
- **Mock Wallet UI**: Simulates "Connect Wallet" flow for demo purposes.

## Project Structure

```
RiftOTC.mvp/
├── backend/           # FastAPI backend
│   ├── api/          # API endpoints (analyze, chat, deals, tokens)
│   ├── services/     # Business logic (AI scoring, CoinGecko, Chat)
│   ├── models/       # Pydantic schemas (TokenAnalysis, Deal)
│   └── database/     # In-memory storage
│
└── frontend/          # Next.js frontend
    ├── src/app/      # Pages (Dashboard, Analyzer, Deals)
    ├── src/components/ # UI components (PriceChart, ChatInterface, RiskBadge)
    └── src/lib/      # API client, utilities
```

## Quick Start (Docker)

The easiest way to run the project:

```bash
# Clone and navigate
cd RiftOTC.mvp

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your OPENAI_API_KEY

# Build and run
docker-compose up -d --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

## Manual Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Analysis
- `POST /api/analyze` - AI token analysis (returns scores, recommendation, reasoning)
- `POST /api/chat` - AI chat with token context

### Deals
- `GET /api/deals` - List all deals
- `POST /api/deals` - Create new deal
- `GET /api/deals/{id}` - Get deal details
- `POST /api/deals/{id}/accept` - Accept a deal
- `POST /api/deals/{id}/claim` - Claim tokens after lock

### Tokens
- `GET /api/tokens/search?q=` - Search tokens (CoinGecko)
- `GET /api/tokens/{id}` - Get token data with 1-year price history
- `POST /api/tokens/{id}/calculate` - Calculate deal metrics

## How It Works

### Deal Flow

1. **Seller creates deal**: Specifies token, amount, discount (AI suggested), and lock period
2. **AI analyzes**: System scores the deal, generates beginner-friendly explanation
3. **Buyer reviews**: Uses AI chat to ask questions, views interactive charts
4. **Buyer accepts**: Pays discounted price, tokens lock in escrow
5. **Lock period passes**: Buyer claims tokens

### AI Scoring (Short-term focus)

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| Technical | 30% | Price momentum, volatility, RSI |
| Risk | 30% | Token age, market cap, liquidity |
| Sentiment | 20% | Social volume, news |
| On-Chain | 15% | Exchange flows, smart money |
| Fundamental | 5% | TVL, revenue, team |

### Recommendation Labels

- **STRONG_BUY**: Score >= 7.5
- **BUY**: Score >= 6.0
- **HOLD**: Score >= 4.5
- **HIGH_RISK**: Score >= 3.0
- **EXTREME_RISK**: Score < 3.0

## Tech Stack

**Backend:**
- FastAPI (Python 3.11)
- OpenAI GPT-4o (JSON mode)
- CoinGecko API (with caching)
- Pydantic v2

**Frontend:**
- Next.js 15 (App Router)
- Tailwind CSS v4 + shadcn/ui
- Recharts (Interactive charts)
- React-Markdown (AI chat formatting)
- TypeScript

## Demo Mode

The prototype runs in demo mode without real blockchain integration:
- Wallet connection is simulated (mock "0x71C...9A21")
- Deals use mock addresses
- No actual token transfers
- In-memory storage (resets on restart)

## V2 Roadmap (Future)

- [ ] Real Web3 wallet integration (RainbowKit/Web3Modal)
- [ ] Smart contract escrow (Solidity)
- [ ] Multi-chain support (EVM chains)
- [ ] Real-time price feeds (WebSocket)
- [ ] Notification system (Email/Telegram)
- [ ] Portfolio tracking

## License

MIT
