# Rift OTC Module — System Architecture

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                                                                              │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │                     Next.js Frontend                              │     │
│    │                     (localhost:3000)                              │     │
│    │                                                                    │     │
│    │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐              │     │
│    │  │Dashboard│  │Analyzer │  │ Create  │  │ Detail  │              │     │
│    │  │  Page   │  │  Page   │  │  Deal   │  │  Page   │              │     │
│    │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘              │     │
│    │       │            │            │            │                    │     │
│    │       └────────────┴────────────┴────────────┘                    │     │
│    │                         │                                         │     │
│    │                   ┌─────┴─────┐                                   │     │
│    │                   │  API      │                                   │     │
│    │                   │  Client   │                                   │     │
│    │                   │ (lib/api) │                                   │     │
│    │                   └─────┬─────┘                                   │     │
│    └─────────────────────────│─────────────────────────────────────────┘     │
│                              │                                               │
│                              │ HTTP/REST                                     │
│                              ▼                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                              API LAYER                                       │
│                                                                              │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │                     FastAPI Backend                               │     │
│    │                     (localhost:8000)                              │     │
│    │                                                                    │     │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │     │
│    │  │  /analyze   │  │   /deals    │  │  /tokens    │               │     │
│    │  │   Router    │  │   Router    │  │   Router    │               │     │
│    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │     │
│    │         │                │                │                       │     │
│    │         └────────────────┼────────────────┘                       │     │
│    │                          │                                        │     │
│    │         ┌────────────────┼────────────────┐                       │     │
│    │         ▼                ▼                ▼                       │     │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │     │
│    │  │ AI Scoring  │  │   Deal      │  │  CoinGecko  │               │     │
│    │  │  Service    │  │ Calculator  │  │   Service   │               │     │
│    │  └──────┬──────┘  └─────────────┘  └──────┬──────┘               │     │
│    │         │                                  │                       │     │
│    └─────────│──────────────────────────────────│───────────────────────┘     │
│              │                                  │                             │
│              ▼                                  ▼                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           EXTERNAL SERVICES                                  │
│                                                                              │
│         ┌─────────────┐                  ┌─────────────┐                    │
│         │   OpenAI    │                  │  CoinGecko  │                    │
│         │   GPT-4o    │                  │    API      │                    │
│         │             │                  │             │                    │
│         │ • Analysis  │                  │ • Prices    │                    │
│         │ • Scoring   │                  │ • Markets   │                    │
│         │ • Reasoning │                  │ • Search    │                    │
│         └─────────────┘                  └─────────────┘                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 15.0 | React framework with App Router |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Components | shadcn/ui + CyberUI | latest | UI components & Custom Cyberpunk Theme |
| Charts | Recharts | 2.x | Interactive data visualization |
| Markdown | react-markdown | 9.x | AI response formatting |
| State | React useState | - | Local state |
| HTTP Client | Fetch API | - | API requests |

### 2.2 Backend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | FastAPI | 0.109.0 | Async Python API |
| Language | Python | 3.11 | Backend language |
| Validation | Pydantic | 2.5.3 | Data validation |
| HTTP Client | httpx | 0.26.0 | Async HTTP |
| AI | OpenAI | 1.10.0 | GPT-4o integration |
| Server | Uvicorn | 0.27.0 | ASGI server |

### 2.3 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Containers | Docker | Containerization |
| Orchestration | Docker Compose | Local orchestration |
| Frontend Deploy | Vercel (planned) | Production hosting |
| Backend Deploy | Railway (planned) | Production hosting |

---

## 3. Project Structure

### 3.1 Backend Structure

```
backend/
├── main.py                 # FastAPI app entry point
│                          # - CORS configuration
│                          # - Router mounting
│                          # - Lifespan events (demo data seeding)
│
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container configuration
├── .env                   # Environment variables (OPENAI_API_KEY)
│
├── api/                   # API Routers
│   ├── __init__.py
│   ├── analyze.py         # POST /api/analyze
│   │                      # POST /api/chat
│   │                      # Token analysis endpoint
│   │
│   ├── deals.py           # Deal management endpoints
│   │                      # GET  /api/deals
│   │                      # POST /api/deals
│   │                      # GET  /api/deals/{id}
│   │                      # POST /api/deals/{id}/accept
│   │                      # POST /api/deals/{id}/claim
│   │                      # POST /api/deals/{id}/cancel
│   │
│   └── tokens.py          # Token data endpoints
│                          # GET  /api/tokens/search
│                          # GET  /api/tokens/trending
│                          # GET  /api/tokens/{id}
│                          # POST /api/tokens/{id}/calculate
│                          # GET  /api/tokens/{id}/suggest-discount
│
├── services/              # Business Logic
│   ├── __init__.py
│   ├── ai_scoring.py      # OpenAI integration
│   │                      # - GPT-4o prompts
│   │                      # - Token analysis
│   │                      # - Chat functionality
│   │                      # - Fallback scoring
│   │
│   ├── coingecko.py       # CoinGecko API client
│   │                      # - Market data
│   │                      # - Token search
│   │                      # - Trending tokens
│   │                      # - 1-year price history
│   │
│   └── deal_calculator.py # Financial calculations
│                          # - Deal metrics
│                          # - Risk/reward
│                          # - Discount suggestions
│
├── models/                # Data Models
│   ├── __init__.py
│   └── schemas.py         # Pydantic models
│                          # - Request/Response schemas
│                          # - Deal model
│                          # - TokenAnalysis model
│                          # - ChatRequest/ChatResponse
│
└── database/              # Data Storage
    ├── __init__.py
    └── db.py              # In-memory storage
                           # - CRUD operations
                           # - Demo data seeding
```

### 3.2 Frontend Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (Header, global styles)
│   │   ├── page.tsx            # Dashboard (/)
│   │   ├── globals.css         # Global styles, CSS variables
│   │   │
│   │   ├── analyze/
│   │   │   └── page.tsx        # AI Analyzer (/analyze)
│   │   │
│   │   └── deals/
│   │       ├── page.tsx        # Deals list (/deals)
│   │       ├── create/
│   │       │   └── page.tsx    # Create deal (/deals/create)
│   │       └── [id]/
│   │           └── page.tsx    # Deal detail (/deals/{id})
│   │
│   ├── components/             # React Components
│   │   ├── Header.tsx          # Navigation header + Wallet button
│   │   ├── DealCard.tsx        # Deal card component
│   │   ├── TokenSearch.tsx     # Token search with autocomplete
│   │   ├── ScoreBar.tsx        # Score visualization
│   │   ├── RiskBadge.tsx       # Recommendation badge
│   │   ├── ChatInterface.tsx   # AI chat with presets
│   │   ├── PriceChart.tsx      # Interactive Recharts chart
│   │   ├── Sparkline.tsx       # Small sparkline chart
│   │   │
│   │   └── ui/                 # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── tabs.tsx
│   │       ├── slider.tsx
│   │       └── ...
│   │
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # API client functions
│   │   └── utils.ts            # Helper functions (cn)
│   │
│   └── types/                  # TypeScript types
│       └── index.ts            # All type definitions
│
├── public/                     # Static assets
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── Dockerfile                  # Container configuration
└── package.json                # Dependencies
```

---

## 4. Data Flow

### 4.1 Token Analysis Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │  CoinGecko  │     │   OpenAI    │
│   (React)   │     │  (FastAPI)  │     │     API     │     │   GPT-4o    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  POST /analyze    │                   │                   │
       │  {token_id,       │                   │                   │
       │   lock_period}    │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  GET /coins/      │                   │
       │                   │  markets?ids=     │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │  Token data       │                   │
       │                   │  (price, volume,  │                   │
       │                   │   market_cap...)  │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │  POST /chat/      │                   │
       │                   │  completions      │                   │
       │                   │  {system_prompt,  │                   │
       │                   │   token_data}     │                   │
       │                   │──────────────────────────────────────>│
       │                   │                   │                   │
       │                   │                   │    JSON response  │
       │                   │                   │    {scores,       │
       │                   │                   │     recommendation│
       │                   │                   │     key_risks...} │
       │                   │<──────────────────────────────────────│
       │                   │                   │                   │
       │  TokenAnalysis    │                   │                   │
       │  {scores,         │                   │                   │
       │   recommendation, │                   │                   │
       │   key_risks...}   │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
```

### 4.2 Deal Creation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │  Database   │
│   (React)   │     │  (FastAPI)  │     │ (In-Memory) │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  POST /deals      │                   │
       │  {seller_address, │                   │
       │   token_id,       │                   │
       │   token_amount,   │                   │
       │   discount,       │                   │
       │   lock_period}    │                   │
       │──────────────────>│                   │
       │                   │                   │
       │                   │  Validate token   │
       │                   │  (CoinGecko)      │
       │                   │                   │
       │                   │  Get AI analysis  │
       │                   │  (OpenAI)         │
       │                   │                   │
       │                   │  Calculate        │
       │                   │  metrics          │
       │                   │                   │
       │                   │  Store deal       │
       │                   │──────────────────>│
       │                   │                   │
       │                   │  Deal created     │
       │                   │<──────────────────│
       │                   │                   │
       │  Deal object      │                   │
       │  {id, status,     │                   │
       │   ai_score...}    │                   │
       │<──────────────────│                   │
       │                   │                   │
```

### 4.3 Deal Accept Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │  Database   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  POST /deals/     │                   │
       │  {id}/accept      │                   │
       │  {buyer_address}  │                   │
       │──────────────────>│                   │
       │                   │                   │
       │                   │  Get deal         │
       │                   │──────────────────>│
       │                   │                   │
       │                   │  Validate:        │
       │                   │  - status == open │
       │                   │                   │
       │                   │  Update deal:     │
       │                   │  - status=funded  │
       │                   │  - buyer_address  │
       │                   │  - funded_at      │
       │                   │  - unlock_at      │
       │                   │──────────────────>│
       │                   │                   │
       │  Updated deal     │                   │
       │<──────────────────│                   │
       │                   │                   │
```

---

## 5. API Contracts

### 5.1 Request/Response Models

```typescript
// Token Analysis
interface AnalyzeRequest {
  token_id: string;      // CoinGecko ID (e.g., "uniswap")
  lock_period: 1 | 4 | 8; // Weeks
}

interface TokenAnalysis {
  token_id: string;
  token_name: string;
  token_symbol: string;
  current_price: number;
  market_cap?: number;
  scores: ScoreBreakdown;
  recommendation: Recommendation;
  expected_return: ExpectedReturn;
  key_risks: string[];
  reasoning: string;
  sparkline_in_7d?: number[];
  price_history_1y?: number[];
  image?: string;
}

interface ScoreBreakdown {
  technical: number;    // 0-10
  risk: number;         // 0-10 (10 = highest risk)
  sentiment: number;    // 0-10
  on_chain: number;     // 0-10
  fundamental: number;  // 0-10
  overall: number;      // 0-10
}

type Recommendation =
  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "HIGH_RISK"
  | "EXTREME_RISK";

interface ExpectedReturn {
  low: number;   // Bear case %
  mid: number;   // Base case %
  high: number;  // Bull case %
}
```

```typescript
// Deal
interface Deal {
  id: string;
  status: "open" | "funded" | "completed" | "cancelled";
  seller_address: string;
  buyer_address?: string;
  token_id: string;
  token_symbol: string;
  token_amount: number;
  price_per_token: number;
  discount: number;
  lock_period: 1 | 4 | 8;
  total_cost: number;
  market_value: number;
  created_at: string;      // ISO datetime
  funded_at?: string;
  unlock_at?: string;
  ai_score?: TokenAnalysis;
}

interface CreateDealRequest {
  seller_address: string;
  token_id: string;
  token_symbol: string;
  token_amount: number;
  price_per_token: number;
  discount: number;
  lock_period: 1 | 4 | 8;
}
```

---

## 6. Security Considerations

### 6.1 Current (MVP)

| Aspect | Status | Notes |
|--------|--------|-------|
| Authentication | None | Demo mode |
| Authorization | None | Demo mode |
| Input Validation | Pydantic | Server-side validation |
| CORS | Configured | Specific origins |
| Rate Limiting | None | Relies on external APIs |
| Secrets | .env file | Not committed to git |

### 6.2 Production Requirements

| Aspect | Requirement |
|--------|-------------|
| Authentication | Wallet-based (Solana/EVM) |
| Authorization | Role-based (seller/buyer) |
| Rate Limiting | Per-user limits |
| API Keys | Encrypted storage |
| HTTPS | Required |
| Input Sanitization | XSS/Injection prevention |

---

## 7. Scalability Considerations

### 7.1 Current Limitations

- In-memory storage (no persistence)
- Single instance
- No caching
- Synchronous processing

### 7.2 Production Architecture

```
                     ┌─────────────┐
                     │   Vercel    │
                     │  (Frontend) │
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │   Railway   │
                     │  (Backend)  │
                     │  + Redis    │
                     │  + Postgres │
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
       ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
       │   OpenAI    │ │CoinGecko│ │  Blockchain │
       │     API     │ │   API   │ │   (Future)  │
       └─────────────┘ └─────────┘ └─────────────┘
```

### 7.3 Scaling Strategies

| Component | Strategy |
|-----------|----------|
| Frontend | CDN, Edge caching |
| Backend | Horizontal scaling, Load balancer |
| Database | PostgreSQL with read replicas |
| Cache | Redis for API responses |
| Queue | Bull/Redis for async AI analysis |

---

## 8. Error Handling

### 8.1 Backend Error Responses

```python
# HTTP Status Codes used:
200 - OK
400 - Bad Request (validation errors)
404 - Not Found (deal/token not found)
429 - Too Many Requests (External API rate limit)
500 - Internal Server Error

# Error Response Format:
{
    "detail": "Error message here"
}
```

### 8.2 Frontend Error Handling

```typescript
// API errors caught and displayed in UI
try {
  const result = await analyzeToken(tokenId, lockPeriod);
  setAnalysis(result);
} catch (err) {
  setError(err instanceof Error ? err.message : "Unknown error");
}
```

---

## 9. Monitoring & Observability (Future)

| Aspect | Tool | Purpose |
|--------|------|---------|
| Logging | Structured logs | Debug & audit |
| Metrics | Prometheus | Performance |
| Tracing | OpenTelemetry | Request tracking |
| Alerts | PagerDuty | Incident response |
| Analytics | Mixpanel | User behavior |
