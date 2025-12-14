# Rift OTC Module — API Reference

## Base URL

```
Development: http://localhost:8000
Production:  https://api.rift-otc.example.com (TBD)
```

## Authentication

**Current (MVP):** No authentication required.

**Future:** Wallet-based authentication with signed messages.

---

## Endpoints

### 1. Analysis

#### POST /api/analyze

Analyze a token for OTC deal assessment using AI.

**Request:**
```json
{
    "token_id": "uniswap",
    "lock_period": 4
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token_id | string | Yes | CoinGecko token ID |
| lock_period | integer | Yes | Lock period: 1, 4, or 8 weeks |

**Response (200 OK):**
```json
{
    "token_id": "uniswap",
    "token_name": "Uniswap",
    "token_symbol": "UNI",
    "current_price": 7.50,
    "market_cap": 4500000000,
    "scores": {
        "technical": 7.2,
        "risk": 4.2,
        "sentiment": 8.5,
        "on_chain": 6.0,
        "fundamental": 6.8,
        "overall": 6.8
    },
    "recommendation": "BUY",
    "expected_return": {
        "low": -15.0,
        "mid": 12.0,
        "high": 35.0
    },
    "key_risks": [
        "Team unlock in 3 weeks (8% of supply)",
        "High correlation with ETH",
        "Moderate exchange inflows detected"
    ],
    "reasoning": "Strong momentum with healthy volume. Main concern is upcoming team unlock, but discount covers this risk."
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| token_id | string | CoinGecko ID |
| token_name | string | Full token name |
| token_symbol | string | Token ticker |
| current_price | float | Current USD price |
| market_cap | float | Market capitalization |
| scores.technical | float | Technical score (0-10) |
| scores.risk | float | Risk score (0-10, 10=highest risk) |
| scores.sentiment | float | Sentiment score (0-10) |
| scores.on_chain | float | On-chain score (0-10) |
| scores.fundamental | float | Fundamental score (0-10) |
| scores.overall | float | Weighted overall score (0-10) |
| recommendation | string | STRONG_BUY, BUY, HOLD, HIGH_RISK, EXTREME_RISK |
| expected_return.low | float | Bear case return % |
| expected_return.mid | float | Base case return % |
| expected_return.high | float | Bull case return % |
| key_risks | array | List of identified risks |
| reasoning | string | AI explanation |

**Error Response (404):**
```json
{
    "detail": "Token 'invalid_token' not found. Please use the CoinGecko token ID."
}
```

---

#### POST /api/chat

Chat with AI about a token analysis.

**Request:**
```json
{
    "message": "What are the main risks?",
    "token_context": {
        "token_id": "bitcoin",
        "token_name": "Bitcoin",
        "scores": { ... },
        "recommendation": "HOLD",
        "reasoning": "..."
    }
}
```

**Response (200 OK):**
```json
{
    "response": "The main risks for Bitcoin in this 4-week period are:\n\n1. **High Volatility** - The 78% volatility means..."
}
```

---

### 2. Deals

#### GET /api/deals

List all deals with optional status filter.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter: open, funded, completed, cancelled |

**Request:**
```
GET /api/deals?status=open
```

**Response (200 OK):**
```json
[
    {
        "id": "deal_abc123def456",
        "status": "open",
        "seller_address": "0x1234...abcd",
        "buyer_address": null,
        "token_id": "uniswap",
        "token_symbol": "UNI",
        "token_amount": 10000.0,
        "price_per_token": 6.38,
        "discount": 15.0,
        "lock_period": 4,
        "total_cost": 63800.0,
        "market_value": 75058.82,
        "created_at": "2025-12-12T10:00:00Z",
        "funded_at": null,
        "unlock_at": null,
        "ai_score": null
    }
]
```

---

#### GET /api/deals/{deal_id}

Get a specific deal by ID.

**Response (200 OK):**
```json
{
    "id": "deal_abc123def456",
    "status": "open",
    "seller_address": "0x1234...abcd",
    "buyer_address": null,
    "token_id": "uniswap",
    "token_symbol": "UNI",
    "token_amount": 10000.0,
    "price_per_token": 6.38,
    "discount": 15.0,
    "lock_period": 4,
    "total_cost": 63800.0,
    "market_value": 75058.82,
    "created_at": "2025-12-12T10:00:00Z",
    "funded_at": null,
    "unlock_at": null,
    "ai_score": {
        "token_id": "uniswap",
        "token_name": "Uniswap",
        "token_symbol": "UNI",
        "current_price": 7.50,
        "scores": {
            "technical": 7.2,
            "risk": 4.2,
            "sentiment": 8.5,
            "on_chain": 6.0,
            "fundamental": 6.8,
            "overall": 6.8
        },
        "recommendation": "BUY",
        "expected_return": {
            "low": -15.0,
            "mid": 12.0,
            "high": 35.0
        },
        "key_risks": ["..."],
        "reasoning": "..."
    }
}
```

**Error Response (404):**
```json
{
    "detail": "Deal not found"
}
```

---

#### POST /api/deals

Create a new OTC deal.

**Request:**
```json
{
    "seller_address": "0x1234567890abcdef1234567890abcdef12345678",
    "token_id": "uniswap",
    "token_symbol": "UNI",
    "token_amount": 10000,
    "price_per_token": 6.38,
    "discount": 15,
    "lock_period": 4
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| seller_address | string | Yes | Valid address format |
| token_id | string | Yes | Valid CoinGecko ID |
| token_symbol | string | Yes | Token ticker |
| token_amount | float | Yes | > 0 |
| price_per_token | float | Yes | > 0 |
| discount | float | Yes | 0-50 |
| lock_period | integer | Yes | 1, 4, or 8 |

**Response (200 OK):**
```json
{
    "id": "deal_xyz789abc123",
    "status": "open",
    "seller_address": "0x1234...abcd",
    "token_id": "uniswap",
    "token_symbol": "UNI",
    "token_amount": 10000.0,
    "price_per_token": 6.38,
    "discount": 15.0,
    "lock_period": 4,
    "total_cost": 63800.0,
    "market_value": 75058.82,
    "created_at": "2025-12-12T12:00:00Z",
    "ai_score": { ... }
}
```

---

#### POST /api/deals/{deal_id}/accept

Accept an open deal as a buyer.

**Request:**
```json
{
    "buyer_address": "0x5678901234abcdef5678901234abcdef56789012"
}
```

**Response (200 OK):**
```json
{
    "id": "deal_abc123def456",
    "status": "funded",
    "seller_address": "0x1234...abcd",
    "buyer_address": "0x5678...efgh",
    "token_id": "uniswap",
    "token_symbol": "UNI",
    "token_amount": 10000.0,
    "price_per_token": 6.38,
    "discount": 15.0,
    "lock_period": 4,
    "total_cost": 63800.0,
    "market_value": 75058.82,
    "created_at": "2025-12-12T10:00:00Z",
    "funded_at": "2025-12-12T14:30:00Z",
    "unlock_at": "2026-01-09T14:30:00Z",
    "ai_score": { ... }
}
```

**Error Response (400):**
```json
{
    "detail": "Deal cannot be accepted. Current status: funded"
}
```

---

#### POST /api/deals/{deal_id}/claim

Claim tokens after lock period has passed.

**Request:** No body required.

**Response (200 OK):**
```json
{
    "id": "deal_abc123def456",
    "status": "completed",
    ...
}
```

**Error Response (400):**
```json
{
    "detail": "Lock period has not ended yet. Cannot claim tokens."
}
```

---

#### POST /api/deals/{deal_id}/cancel

Cancel an open deal (seller only).

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| seller_address | string | Yes | Must match deal seller |

**Request:**
```
POST /api/deals/deal_abc123/cancel?seller_address=0x1234...
```

**Response (200 OK):**
```json
{
    "id": "deal_abc123def456",
    "status": "cancelled",
    ...
}
```

**Error Response (403):**
```json
{
    "detail": "Only the seller can cancel this deal"
}
```

---

### 3. Tokens

#### GET /api/tokens/search

Search for tokens by name or symbol.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| q | string | Yes | - | Search query |
| limit | integer | No | 10 | Max results (1-50) |

**Request:**
```
GET /api/tokens/search?q=uni&limit=5
```

**Response (200 OK):**
```json
[
    {
        "id": "uniswap",
        "name": "Uniswap",
        "symbol": "UNI",
        "market_cap_rank": 44,
        "thumb": "https://coin-images.coingecko.com/.../uniswap-logo.png"
    },
    {
        "id": "universe-xyz",
        "name": "Universe.XYZ",
        "symbol": "XYZ",
        "market_cap_rank": 892,
        "thumb": "https://..."
    }
]
```

---

#### GET /api/tokens/trending

Get currently trending tokens.

**Response (200 OK):**
```json
[
    {
        "id": "bitcoin",
        "name": "Bitcoin",
        "symbol": "BTC",
        "market_cap_rank": 1,
        "thumb": "https://..."
    },
    ...
]
```

---

#### GET /api/tokens/{token_id}

Get full market data for a token.

**Response (200 OK):**
```json
{
    "id": "uniswap",
    "name": "Uniswap",
    "symbol": "uni",
    "current_price": 7.50,
    "market_cap": 4500000000,
    "total_volume": 125000000,
    "price_change_percentage_24h": 3.5,
    "price_change_percentage_7d": 12.8,
    "price_change_percentage_30d": -5.2,
    "ath": 44.97,
    "ath_change_percentage": -83.3,
    "market_cap_rank": 44,
    "image": "https://..."
}
```

---

#### POST /api/tokens/{token_id}/calculate

Calculate deal metrics for a potential trade.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | float | Yes | Token amount (> 0) |
| discount | float | Yes | Discount % (0-50) |
| lock_period | integer | No | Lock weeks (default: 4) |

**Request:**
```
POST /api/tokens/uniswap/calculate?amount=10000&discount=15&lock_period=4
```

**Response (200 OK):**
```json
{
    "token": {
        "id": "uniswap",
        "name": "Uniswap",
        "symbol": "UNI",
        "current_price": 7.50
    },
    "metrics": {
        "market_price": 7.50,
        "discounted_price": 6.375,
        "discount_pct": 15.0,
        "token_amount": 10000.0,
        "total_cost": 63750.0,
        "market_value": 75000.0,
        "instant_equity": 11250.0,
        "instant_equity_pct": 17.65,
        "break_even_drop_pct": -15.0,
        "expected_return_pct": 32.5,
        "expected_value": 84500.0,
        "expected_profit": 20750.0,
        "best_case_return_pct": 55.0,
        "best_case_value": 98812.5,
        "best_case_profit": 35062.5,
        "worst_case_return_pct": -10.0,
        "worst_case_value": 57375.0,
        "worst_case_loss": -6375.0,
        "max_loss_50pct_drop": -26250.0,
        "max_loss_50pct_drop_pct": -41.18,
        "risk_reward_ratio": 2.4,
        "lock_period_weeks": 4,
        "lock_risk_factor": 1.3,
        "is_favorable": true,
        "quality_score": 7.2
    }
}
```

---

#### GET /api/tokens/{token_id}/suggest-discount

Get AI-suggested discount based on risk factors.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| lock_period | integer | No | 4 | Lock weeks (1-8) |
| risk_score | float | No | 5.0 | Risk score from AI (0-10) |

**Request:**
```
GET /api/tokens/uniswap/suggest-discount?lock_period=4&risk_score=7.0
```

**Response (200 OK):**
```json
{
    "token_id": "uniswap",
    "lock_period": 4,
    "suggested_discount": 18.0,
    "min_recommended": 13.0,
    "max_recommended": 23.0,
    "reasoning": "Based on 4-week lock, risk score of 7.0/10, and 25.0% monthly volatility"
}
```

---

## 4. Health & Info

#### GET /

API health check and info.

**Response (200 OK):**
```json
{
    "status": "ok",
    "service": "Rift OTC Module API",
    "version": "0.1.0",
    "docs": "/docs"
}
```

---

#### GET /health

Health check for deployment platforms.

**Response (200 OK):**
```json
{
    "status": "healthy"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - validation error |
| 403 | Forbidden - not authorized |
| 404 | Not Found |
| 422 | Validation Error (Pydantic) |
| 500 | Internal Server Error |

### Error Response Format

```json
{
    "detail": "Human-readable error message"
}
```

### Validation Error Format (422)

```json
{
    "detail": [
        {
            "loc": ["body", "token_amount"],
            "msg": "value is not a valid float",
            "type": "type_error.float"
        }
    ]
}
```

---

## Rate Limits

**Current (MVP):** No rate limits.

**Future:**
- 100 requests/minute per IP
- 1000 requests/hour per authenticated user
- AI analysis: 10 requests/minute

---

## OpenAPI Documentation

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
