# Rift OTC Module — Business Logic

## 1. Product Concept

### 1.1 What Is It

**Rift OTC Module** — A module for AI agents on the Rift.ai platform that enables OTC (Over-The-Counter) cryptocurrency token trades with AI risk analysis.

### 1.2 Key Value Proposition

| For Buyer | For Seller |
|-----------|------------|
| Token purchase at 5-40% discount | Instant liquidity without market impact |
| AI risk analysis before purchase | No slippage on large sales |
| Short locks (1-8 weeks) | Guaranteed sale at fixed price |

### 1.3 Difference from Traditional OTC

| Parameter | Traditional OTC | Rift OTC Module |
|-----------|-----------------|-----------------|
| Minimum deal | $50,000 - $200,000 | $100 - $1,000 |
| Lock period | 6-24 months | 1-8 weeks |
| Risk analysis | Manual, expensive | AI-automated |
| Accessibility | Institutions only | Any user |
| Speed | Days/weeks of negotiations | Minutes |

---

## 2. Business Model

### 2.1 Discount Mechanics

```
TOKEN MARKET PRICE:       $10.00
DISCOUNT:                 15%
DEAL PRICE:              $8.50

Buyer pays $8.50 for a token worth $10.00
Their "instant profit" = $1.50 (15%)
BUT: tokens are locked for the lock period
```

### 2.2 Why Sell at a Discount?

**Typical sellers and their motivation:**

| Seller Type | Motivation | Typical Discount |
|-------------|------------|------------------|
| **Project (Treasury)** | Sell tokens without crashing price on exchange | 10-20% |
| **Early Investor** | Quiet exit without community panic | 15-25% |
| **Market Maker** | Inventory management, rebalancing | 5-10% |
| **Whale** | Urgent liquidity needs | 10-30% |

**Example:** A project wants to sell 1M tokens.
- On exchange: 5-10% slippage, price drops, community panic
- Via OTC: Fixed price with 15% discount, no one knows about the sale

### 2.3 Lock Economics

**Lock period** — The time during which the buyer cannot sell tokens.

```
Discount compensates for lock risk:

1 week  → low risk    → discount 5-10%
4 weeks → medium risk → discount 12-20%
8 weeks → high risk   → discount 18-35%
```

**Buyer risks during lock:**
- Token price may drop
- Negative news may come out
- Large unlocks from team/investors may occur
- Overall market may reverse

---

## 3. User Flows

### 3.1 Deal Creation Flow (Seller)

```
┌─────────────────────────────────────────────────────────────┐
│                    SELLER FLOW                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Seller opens "Create Deal"                               │
│     ↓                                                        │
│  2. Selects token via search                                 │
│     ↓                                                        │
│  3. Specifies token amount                                   │
│     ↓                                                        │
│  4. Chooses lock period (1/4/8 weeks)                        │
│     ↓                                                        │
│  5. Sets discount (slider 5-40%)                             │
│     • AI suggests recommended discount                       │
│     ↓                                                        │
│  6. Views Deal Summary:                                      │
│     • Market value                                           │
│     • Amount to receive                                      │
│     • AI Score for token                                     │
│     ↓                                                        │
│  7. Confirms deal creation                                   │
│     ↓                                                        │
│  8. [In production] Tokens go to escrow                      │
│     ↓                                                        │
│  9. Deal appears in "Open Deals" list                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Purchase Flow (Buyer)

```
┌─────────────────────────────────────────────────────────────┐
│                    BUYER FLOW                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Buyer opens Dashboard                                    │
│     ↓                                                        │
│  2. Sees list of Open Deals with AI Scores                   │
│     ↓                                                        │
│  3. Selects an interesting deal                              │
│     ↓                                                        │
│  4. Opens detail page:                                       │
│     • Full deal information                                  │
│     • AI Analysis with category breakdown                    │
│     • Expected Returns (bear/base/bull)                      │
│     • Key Risks                                              │
│     ↓                                                        │
│  5. Decides: Accept or decline                               │
│     ↓                                                        │
│  6. Clicks "Accept Deal"                                     │
│     ↓                                                        │
│  7. [In production] Payment goes to seller                   │
│     ↓                                                        │
│  8. Deal moves to "Funded" status                            │
│     • Shows time until unlock                                │
│     ↓                                                        │
│  9. [After lock period] Clicks "Claim Tokens"                │
│     ↓                                                        │
│  10. Deal moves to "Completed" status                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 AI Analysis Flow (Analyst)

```
┌─────────────────────────────────────────────────────────────┐
│                    ANALYST FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User opens "AI Analyzer"                                 │
│     ↓                                                        │
│  2. Searches for token                                       │
│     ↓                                                        │
│  3. Selects lock period for analysis                         │
│     ↓                                                        │
│  4. Clicks "Analyze"                                         │
│     ↓                                                        │
│  5. System:                                                  │
│     • Fetches data from CoinGecko                            │
│     • Sends to GPT-4o for analysis                           │
│     • Receives scores and recommendation                     │
│     ↓                                                        │
│  6. User sees full report:                                   │
│     • Score breakdown (5 categories)                         │
│     • Overall score                                          │
│     • Recommendation (STRONG_BUY → EXTREME_RISK)             │
│     • Expected returns                                       │
│     • Key risks                                              │
│     • AI reasoning                                           │
│     ↓                                                        │
│  7. Can proceed to create deal with this token               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Deal Status (State Machine)

```
                    ┌──────────┐
                    │   OPEN   │
                    │          │
                    │  Deal    │
                    │  created │
                    └────┬─────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             │             ▼
    ┌──────────┐         │      ┌───────────┐
    │ CANCELLED│         │      │  FUNDED   │
    │          │         │      │           │
    │ Cancelled│         │      │ Paid,     │
    │ by seller│         │      │ tokens in │
    └──────────┘         │      │ escrow    │
                         │      └─────┬─────┘
                         │            │
                         │            │ Lock period
                         │            │ passed
                         │            │
                         │            ▼
                         │      ┌───────────┐
                         │      │ COMPLETED │
                         │      │           │
                         │      │ Tokens    │
                         │      │ received  │
                         └──────┴───────────┘
```

**Transition Rules:**

| From Status | To Status | Condition | Who Can |
|-------------|-----------|-----------|---------|
| OPEN | CANCELLED | Deal not accepted | Seller only |
| OPEN | FUNDED | Buyer paid | Buyer |
| FUNDED | COMPLETED | Lock period passed + claim | Buyer |

---

## 5. Deal Metrics Calculation

### 5.1 Basic Calculations

```python
# Input data
market_price = 10.00      # Current token price
discount = 15             # Discount percentage
token_amount = 1000       # Number of tokens
lock_period = 4           # Weeks

# Calculations
discounted_price = market_price * (1 - discount / 100)  # $8.50
total_cost = token_amount * discounted_price             # $8,500
market_value = token_amount * market_price               # $10,000
instant_equity = market_value - total_cost               # $1,500
instant_equity_pct = instant_equity / total_cost * 100   # 17.6%
```

### 5.2 Break-even Analysis

```python
# Break-even = how much price must drop to lose everything
break_even_drop = -discount  # -15%

# If price drops 15%, buyer breaks even
# If less — they're in profit
# If more — they're in loss
```

### 5.3 Scenario Analysis

```python
# Based on AI expected returns
expected_return = {
    "low": -25,    # Bear case
    "mid": +15,    # Base case
    "high": +40    # Bull case
}

# Final return including discount
final_return_bear = discount + expected_return["low"]   # 15 + (-25) = -10%
final_return_base = discount + expected_return["mid"]   # 15 + 15 = +30%
final_return_bull = discount + expected_return["high"]  # 15 + 40 = +55%
```

### 5.4 Risk/Reward Ratio

```python
potential_gain = expected_profit         # Expected profit
potential_loss = abs(worst_case_loss)    # Potential loss

risk_reward = potential_gain / potential_loss

# risk_reward >= 1.5 is considered good
# risk_reward >= 2.0 is considered excellent
```

---

## 6. Monetization (Future)

### 6.1 Platform Fees

```
Fee structure (planned):

1. Protocol Fee: 0.5% of deal amount
   → Distributed to Rift.ai Treasury

2. AI Analysis Fee: Fixed amount in $RIFT
   → For each full token analysis

3. Premium Features:
   → Extended analysis
   → Priority notifications for new deals
   → API access for automation
```

### 6.2 Token Utility ($RIFT)

```
$RIFT usage in module:

1. Fee payments
2. Staking for premium features access
3. Governance voting on module parameters
4. Rewards for active users
```

---

## 7. Key Metrics (KPIs)

### 7.1 Product Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Deals Created | Number of deals created | Growth MoM |
| Deals Completed | Number of completed deals | >70% of accepted |
| TVL | Total Value Locked in escrow | Growth |
| AI Accuracy | AI prediction accuracy | >65% |

### 7.2 Business Metrics

| Metric | Description |
|--------|-------------|
| GMV | Total deal volume |
| Revenue | Platform fees |
| DAU/MAU | Active users |
| Retention | User return rate |

---

## 8. Risks and Limitations

### 8.1 Product Risks

| Risk | Mitigation |
|------|------------|
| AI gives incorrect recommendations | Disclaimer, fallback scoring, continuous improvement |
| Low liquidity (few sellers) | Partnerships with projects, incentives |
| Regulatory concerns | Legal work, KYC/AML readiness |

### 8.2 Technical Risks

| Risk | Mitigation |
|------|------------|
| Smart contract vulnerabilities | Audit before production |
| API rate limits (CoinGecko, OpenAI) | Caching, fallback providers |
| Downtime | Redundancy, health checks |

### 8.3 MVP Limitations

- No real blockchain transactions
- No wallets and authentication
- In-memory storage (data resets on restart)
- Limited data set for AI
