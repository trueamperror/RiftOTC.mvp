# Rift OTC Module — Project Map

> Complete project map for Technical Product Manager

## Quick Links

| Document | Description |
|----------|-------------|
| [01-BUSINESS-LOGIC.md](./01-BUSINESS-LOGIC.md) | Business logic, user flows, economics |
| [02-SYSTEM-ARCHITECTURE.md](./02-SYSTEM-ARCHITECTURE.md) | Architecture, stack, data flows |
| [03-AI-SCORING-SYSTEM.md](./03-AI-SCORING-SYSTEM.md) | AI algorithms, weights, formulas |
| [04-API-REFERENCE.md](./04-API-REFERENCE.md) | API endpoints, requests/responses |

---

## 1. Executive Summary

### What Is It?
AI module for OTC token trading with short locks (1-8 weeks) on the Rift.ai platform.

### Key Problem
Large holders cannot sell tokens on exchanges without crashing the price (slippage, front-running).

### Solution
OTC platform where sellers get instant liquidity, and buyers get a discount in exchange for a short lock.

### Unique Features
- AI analysis of every deal (GPT-4o with JSON mode)
- Interactive AI chat for token questions
- Short locks instead of standard 6-24 months
- Low entry threshold ($100+)
- Automatic risk/reward calculation
- Interactive charts with 1-year history

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│                                                                  │
│   [Seller]                                    [Buyer]            │
│      │                                           │               │
│      │ Creates deal                              │ Browses deals │
│      │ Sets discount                             │ Views AI score│
│      │ Receives payment                          │ Accepts deal  │
│      │                                           │ Claims tokens │
│      ▼                                           ▼               │
├─────────────────────────────────────────────────────────────────┤
│                       FRONTEND (Next.js)                         │
│                                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│   │Dashboard │  │ Analyzer │  │ Create   │  │  Detail  │       │
│   │          │  │          │  │ Deal     │  │  Page    │       │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                       BACKEND (FastAPI)                          │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │   /analyze   │  │    /deals    │  │   /tokens    │         │
│   │  AI Scoring  │  │ CRUD, State  │  │ Market Data  │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│   ┌──────────────┐                                              │
│   │    /chat     │                                              │
│   │  AI Q&A      │                                              │
│   └──────────────┘                                              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      EXTERNAL SERVICES                           │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │   OpenAI     │  │  CoinGecko   │  │  Blockchain  │         │
│   │   GPT-4o     │  │     API      │  │   (Future)   │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Flows

### 3.1 Deal Lifecycle

```
CREATED → OPEN → FUNDED → COMPLETED
              ↘ CANCELLED
```

| Status | Description | Actions |
|--------|-------------|---------|
| OPEN | Deal created, awaiting buyer | Accept, Cancel |
| FUNDED | Paid, tokens in escrow | Claim (after lock) |
| COMPLETED | Tokens received by buyer | - |
| CANCELLED | Cancelled by seller | - |

### 3.2 AI Analysis Flow

```
Token ID → CoinGecko API → Market Data → GPT-4o → Scores + Risks → Recommendation
```

### 3.3 Scoring Output

```
┌─────────────────────────────────────┐
│  TOKEN: UNI                         │
│  Lock: 4 weeks                      │
├─────────────────────────────────────┤
│  Technical:    ████████░░  7.2/10   │
│  Risk:         ████░░░░░░  4.2/10 ⚠️│
│  Sentiment:    █████████░  8.5/10   │
│  On-Chain:     ██████░░░░  6.0/10   │
│  Fundamental:  ███████░░░  6.8/10   │
├─────────────────────────────────────┤
│  OVERALL: 6.8/10                    │
│  RECOMMENDATION: BUY                │
│                                     │
│  Labels: STRONG_BUY, BUY, HOLD,     │
│          HIGH_RISK, EXTREME_RISK    │
└─────────────────────────────────────┘
```

---

## 4. Technology Stack

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| Next.js | 15.0 | React framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | UI components |
| Recharts | 2.x | Interactive charts |
| react-markdown | 9.x | AI response formatting |

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| FastAPI | 0.109 | API framework |
| Python | 3.11 | Language |
| Pydantic | 2.5 | Validation |
| OpenAI | 1.10 | AI integration (GPT-4o) |

### Infrastructure
| Tech | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Orchestration |

---

## 5. AI Scoring Weights

```
SHORT-TERM ANALYSIS (1-8 weeks):

Technical    ███████████  30%  ← Price momentum, volatility
Risk         ███████████  30%  ← Unlocks, events, whales
Sentiment    ███████      20%  ← Social, news
On-Chain     █████        15%  ← Exchange flows
Fundamental  ██            5%  ← Project health
```

**Key Insight:** Fundamentals matter less for short-term. A team won't ship a new product in 4 weeks.

---

## 6. Key Business Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| Instant Equity | (Market Value - Total Cost) / Total Cost | >10% |
| Break-even Drop | -Discount% | Shows safety margin |
| Risk/Reward | Expected Profit / Potential Loss | >1.5 |
| Deal Quality | (R/R * 2 + Equity% / 5) / 2 | >6 |

---

## 7. File Structure

```
RiftOTC.mvp/
├── docs/                      # Documentation
│   ├── 00-PROJECT-MAP.md      # This file
│   ├── 01-BUSINESS-LOGIC.md   # Business logic
│   ├── 02-SYSTEM-ARCHITECTURE.md # Tech architecture
│   ├── 03-AI-SCORING-SYSTEM.md # AI algorithms
│   └── 04-API-REFERENCE.md    # API docs
│
├── backend/                   # FastAPI backend
│   ├── main.py               # Entry point
│   ├── api/                  # Routers
│   │   ├── analyze.py        # AI analysis
│   │   ├── deals.py          # Deal CRUD
│   │   └── tokens.py         # Token data
│   ├── services/             # Business logic
│   │   ├── ai_scoring.py     # OpenAI integration
│   │   ├── coingecko.py      # Market data
│   │   └── deal_calculator.py # Calculations
│   ├── models/               # Pydantic schemas
│   └── database/             # In-memory storage
│
├── frontend/                  # Next.js frontend
│   └── src/
│       ├── app/              # Pages
│       │   ├── page.tsx      # Dashboard
│       │   ├── analyze/      # AI Analyzer
│       │   └── deals/        # Deal pages
│       ├── components/       # React components
│       │   ├── ChatInterface.tsx    # AI chat with presets
│       │   ├── PriceChart.tsx       # Interactive Recharts
│       │   ├── RiskBadge.tsx        # Recommendation badge
│       │   └── Header.tsx           # Wallet button
│       ├── lib/              # API client
│       └── types/            # TypeScript types
│
├── docker-compose.yml         # Docker orchestration
└── README.md                  # Quick start guide
```

---

## 8. Running Locally

### Prerequisites
- Docker Desktop
- OpenAI API key

### Quick Start
```bash
# 1. Clone and navigate
cd RiftOTC.mvp

# 2. Add OpenAI key to backend/.env
echo "OPENAI_API_KEY=sk-..." > backend/.env

# 3. Start with Docker
docker-compose up -d

# 4. Open browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## 9. MVP Limitations

| What's NOT included | Why |
|--------------------|-----|
| Real blockchain transactions | MVP scope |
| Real wallet integration | Mock UI added |
| User authentication | MVP scope |
| Persistent database | In-memory for simplicity |
| Real escrow contracts | Would need audit |

---

## 10. Roadmap (Post-MVP)

### Phase 1: Core
- [ ] Wallet authentication (Solana/EVM)
- [ ] PostgreSQL database
- [ ] Real escrow smart contracts
- [ ] Audit

### Phase 2: Enhancement
- [x] Interactive charts (Recharts)
- [x] AI Chat functionality
- [x] Markdown rendering in chat
- [x] Mobile responsive
- [ ] More data sources (Nansen, TokenUnlocks)
- [ ] Real-time price updates
- [ ] Notification system

### Phase 3: Scale
- [ ] Multi-chain support
- [ ] $RIFT token integration
- [ ] Governance features
- [ ] API for external integrations

---

## 11. Key Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Short locks (1-8 weeks) | Differentiation from traditional OTC | Day 1 |
| GPT-4o for scoring | Best quality, JSON mode | Day 1 |
| Fallback scoring | Reliability when AI unavailable | Day 1 |
| In-memory storage | MVP simplicity | Day 1 |
| Dark theme | Crypto industry standard | Day 1 |

---

## 12. Contacts

**Project:** Rift OTC Module
**Company:** Rift.ai (Faraway)
**Status:** MVP / Prototype
**Deadline:** December 16, 2025
