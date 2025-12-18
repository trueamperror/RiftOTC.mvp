# Rift OTC Module — AI Scoring System

## 1. Overview

The AI Scoring System analyzes tokens to assess the attractiveness of OTC deals considering a short lock period (1-8 weeks).

### 1.1 Key Difference from Long-term Analysis

| Aspect | Long-term Analysis (6-24 mo) | Short-term Analysis (1-8 wk) |
|--------|------------------------------|------------------------------|
| Fundamental | High weight (30-40%) | Low weight (5%) |
| Technical | Medium weight (20%) | High weight (30%) |
| Risk Events | General risks | Specific events (unlocks) |
| Sentiment | Background indicator | Critical for short movements |

### 1.2 Why?

In 1-8 weeks:
- **Fundamentals won't change** — a team won't ship a new product in a week
- **Technical factors are critical** — momentum, volatility determine short-term movement
- **Risk events** — one unlock can crash price by 20%
- **Sentiment** — hype or FUD work quickly

---

## 2. Scoring Framework

### 2.1 Weights Distribution

```
┌─────────────────────────────────────────────────────────────┐
│              SCORING WEIGHTS (Short-term V1.1)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Technical    ████████████████████████████████  30%         │
│  Risk         ████████████████████████████████  30%         │
│  Sentiment    ████████████████████              20%         │
│  On-Chain     ████████████████                  15%         │
│  Fundamental  ██████                             5%         │
│                                                             │
│               Total: 100%                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Score Scale

All scores use a **0-10** scale:

| Score | Interpretation |
|-------|----------------|
| 9-10 | Excellent |
| 7-8.9 | Good |
| 5-6.9 | Average |
| 3-4.9 | Below average |
| 0-2.9 | Poor |

**Important for Risk Score:**
- Risk Score is **inverted**: 10 = HIGH RISK (bad), 0 = LOW RISK (good)
- When calculating overall score, we use (10 - risk)

---

## 3. Scoring Dimensions Detailed

### 3.1 Technical Score (30%)

**What it measures:** Price momentum and technical state of the token.

#### Input Data:
```python
{
    "current_price": 7.50,
    "price_change_24h": +3.5%,
    "price_change_7d": +12.8%,
    "price_change_30d": -5.2%,
    "total_volume": 125_000_000,
    "market_cap": 4_500_000_000,
    "ath": 44.97,
    "ath_change": -83.3%
}
```

#### Evaluation Factors:

| Factor | Positive Signal | Negative Signal |
|--------|-----------------|-----------------|
| Price vs ATH | -50% to -70% (recovery potential) | -90%+ (dead project) |
| 7d momentum | +5% to +20% | -10%+ |
| 30d trend | Uptrend | Downtrend |
| Volume/MCap | >5% (healthy) | <1% (illiquid) |
| RSI proxy | 40-60 (neutral) | >80 (overbought), <20 (oversold) |

#### Scoring Logic:
```python
technical = 5.0  # Base score

# Momentum (7d change)
if price_7d > 10:
    technical += 1.5
elif price_7d < -10:
    technical -= 1.5

# Trend (30d change)
if price_30d > 20:
    technical += 1.0
elif price_30d < -20:
    technical -= 1.0

# Volume health
volume_ratio = volume / market_cap
if volume_ratio > 0.1:
    technical += 1.0
elif volume_ratio < 0.02:
    technical -= 1.0

# Clamp to 0-10
technical = max(0, min(10, technical))
```

---

### 3.2 Risk Score (30%)

**What it measures:** Probability of negative events during the lock period.

**IMPORTANT:** Unlike other scores, here 10 = HIGH RISK (bad)

#### Evaluation Factors:

| Factor | Low Risk (0-3) | High Risk (7-10) |
|--------|----------------|------------------|
| Upcoming unlocks | No unlocks during lock | >5% supply unlock |
| Volatility | <20% monthly | >50% monthly |
| Liquidity | Deep liquidity | Shallow liquidity |
| Market cap | >$1B | <$100M |
| Concentration | Distributed holders | Whale dominated |

#### Critical Risk Events:
```
⚠️ RED FLAGS (automatically increase risk score):

1. Team/Investor Unlock during lock period
   → +2-3 to risk score

2. Large investor selling (on-chain data)
   → +1-2 to risk score

3. High correlation with ETH/BTC (beta > 1.5)
   → +1 to risk score during unstable market

4. Exchange inflows increasing
   → +1-2 to risk score (sell signal)
```

#### Scoring Logic:
```python
risk = 5.0  # Base score

# Volatility risk
volatility = abs(price_change_24h) + abs(price_change_7d) / 2
if volatility > 15:
    risk += 2.0
elif volatility < 5:
    risk -= 1.0

# Market cap risk
if market_cap < 100_000_000:
    risk += 2.0
elif market_cap > 1_000_000_000:
    risk -= 1.0

# ATH distance (recovery risk)
if ath_change < -80:
    risk += 1.5

# Lock period risk
risk += (lock_period - 1) * 0.5  # Longer lock = more risk

# Clamp to 0-10
risk = max(0, min(10, risk))
```

---

### 3.3 Sentiment Score (20%)

**What it measures:** Community mood and media presence.

#### Data Sources (ideal):
- Twitter/X volume and tone
- Discord/Telegram activity
- News coverage
- Google Trends
- Governance participation

#### Proxy Metrics (available):
```python
# In MVP we use proxy via CoinGecko data
# and GPT-4o general assessment based on known data

sentiment = 5.0  # Base

# Price momentum as proxy for sentiment
if price_7d > 0:
    sentiment += price_7d / 10  # Positive momentum = positive sentiment
else:
    sentiment += price_7d / 10  # Negative momentum = negative sentiment

# Market cap rank as proxy for awareness
if market_cap_rank <= 50:
    sentiment += 1.0  # Top 50 get more attention
elif market_cap_rank > 200:
    sentiment -= 1.0

sentiment = max(0, min(10, sentiment))
```

---

### 3.4 On-Chain Score (15%)

**What it measures:** Blockchain activity and token movement.

#### Key Metrics:

| Metric | What it Shows | Source |
|--------|---------------|--------|
| Holder distribution | Decentralization | Etherscan/Dune |
| Exchange flows | Buy/sell pressure | Nansen/Glassnode |
| Active addresses | Real usage | On-chain data |
| Smart money moves | Institutional interest | Nansen |
| Whale movements | Large positions | On-chain alerts |

#### Scoring Logic (MVP proxy):
```python
on_chain = 5.0  # Base

# Volume as proxy for on-chain activity
volume_ratio = volume / market_cap
if volume_ratio > 0.1:
    on_chain += 2.0  # High trading activity
elif volume_ratio < 0.02:
    on_chain -= 2.0  # Low activity = concerning

# Market cap rank as proxy for holder distribution
if market_cap_rank <= 100:
    on_chain += 1.0  # Larger projects = more distributed

on_chain = max(0, min(10, on_chain))
```

---

### 3.5 Fundamental Score (5%)

**What it measures:** Long-term project health (minimal weight for short-term).

#### Factors:
- TVL (for DeFi)
- Revenue/Fees
- Team background
- Audit status
- Token utility
- Roadmap execution

#### Scoring Logic (MVP):
```python
fundamental = 5.0  # Base

# Market cap rank as proxy for fundamental strength
if market_cap_rank <= 50:
    fundamental = 7.0  # Top 50 = strong fundamentals
elif market_cap_rank <= 100:
    fundamental = 6.0
elif market_cap_rank > 500:
    fundamental = 4.0

fundamental = max(0, min(10, fundamental))
```

---

## 4. Overall Score Calculation

### 4.1 Formula

```python
def calculate_overall_score(scores: dict) -> float:
    """
    Calculate weighted overall score.
    Note: risk is inverted (10 - risk) because high risk is bad.
    """
    overall = (
        scores['technical'] * 0.30 +
        (10 - scores['risk']) * 0.30 +  # Inverted!
        scores['sentiment'] * 0.20 +
        scores['on_chain'] * 0.15 +
        scores['fundamental'] * 0.05
    )
    return round(overall, 1)
```

### 4.2 Example Calculation

```python
scores = {
    'technical': 7.2,
    'risk': 4.2,        # Lower is better
    'sentiment': 8.5,
    'on_chain': 6.0,
    'fundamental': 6.8
}

overall = (
    7.2 * 0.30 +           # 2.16
    (10 - 4.2) * 0.30 +    # 1.74 (risk inverted)
    8.5 * 0.20 +           # 1.70
    6.0 * 0.15 +           # 0.90
    6.8 * 0.05             # 0.34
)
# = 6.84 → 6.8
```

---

## 5. Recommendation Logic

### 5.1 Thresholds

```python
def get_recommendation(overall_score: float) -> str:
    if overall_score >= 7.5:
        return "STRONG_BUY"
    elif overall_score >= 6.0:
        return "BUY"
    elif overall_score >= 4.5:
        return "HOLD"
    elif overall_score >= 3.0:
        return "HIGH_RISK"
    else:
        return "EXTREME_RISK"
```

### 5.2 Recommendation Meanings

| Recommendation | Overall Score | Interpretation |
|----------------|---------------|----------------|
| STRONG_BUY | 7.5 - 10.0 | Excellent opportunity, minimal risks |
| BUY | 6.0 - 7.4 | Good deal, acceptable risks |
| HOLD | 4.5 - 5.9 | Neutral, significant risks exist |
| HIGH_RISK | 3.0 - 4.4 | Risks exceed potential |
| EXTREME_RISK | 0.0 - 2.9 | High probability of losses |

---

## 6. Expected Returns Calculation

### 6.1 Logic

Expected returns consider:
- Historical token volatility
- Lock period
- Current momentum
- Market conditions

```python
def calculate_expected_returns(token_data: dict, lock_period: int) -> dict:
    # Base volatility from recent price action
    volatility = abs(token_data['price_change_7d']) + \
                 abs(token_data['price_change_30d']) / 2

    # Momentum factor
    momentum = token_data['price_change_7d']

    # Calculate scenarios
    expected_mid = momentum * 0.5  # Half of current momentum continues
    expected_low = -max(15, volatility * 0.8)  # Downside based on volatility
    expected_high = max(20, volatility * 1.2)  # Upside based on volatility

    # Adjust for lock period (longer = more uncertainty)
    lock_factor = 1 + (lock_period - 1) * 0.1

    return {
        "low": round(expected_low * lock_factor, 1),
        "mid": round(expected_mid, 1),
        "high": round(expected_high * lock_factor, 1)
    }
```

### 6.2 Example

```python
token_data = {
    'price_change_7d': 12.0,
    'price_change_30d': -5.0
}
lock_period = 4

volatility = 12 + 5/2 = 14.5
momentum = 12.0
lock_factor = 1 + (4-1) * 0.1 = 1.3

expected = {
    "low": -max(15, 14.5 * 0.8) * 1.3 = -19.5%,
    "mid": 12.0 * 0.5 = 6.0%,
    "high": max(20, 14.5 * 1.2) * 1.3 = 26.0%
}
```

---

## 7. GPT-4o Integration

### 7.1 System Prompt

```python
SYSTEM_PROMPT = """You are an expert crypto analyst for an OTC trading platform.
Your job is to analyze tokens for SHORT-TERM locked deals (1-8 weeks).

For short-term analysis, prioritize:
1. Technical factors (30%): volatility, momentum, recent price action
2. Risk factors (30%): upcoming unlocks, events, whale movements
3. Sentiment (20%): social volume, news, community mood
4. On-chain (15%): exchange flows, smart money movements
5. Fundamental (5%): less important for short-term

IMPORTANT SCORING RULES:
- Scores are 0-10 where 10 is BEST for all categories EXCEPT risk
- For RISK score: 10 means HIGHEST RISK (bad), 0 means LOWEST RISK (good)
- Be realistic and critical - not every token is a buy
- Consider the lock period when assessing risk

Return your analysis as JSON with this exact structure:
{
    "scores": {
        "technical": <0-10>,
        "risk": <0-10 where 10 is HIGHEST/WORST risk>,
        "sentiment": <0-10>,
        "on_chain": <0-10>,
        "fundamental": <0-10>,
        "overall": <0-10>
    },
    "recommendation": "<STRONG_BUY|BUY|HOLD|HIGH_RISK|EXTREME_RISK>",
    "expected_return": {
        "low": <negative percentage, worst case>,
        "mid": <expected percentage>,
        "high": <best case percentage>
    },
    "key_risks": ["risk1", "risk2", "risk3"],
    "reasoning": "<2-3 sentence explanation>"
}

Be honest about risks. Crypto is volatile."""
```

### 7.2 User Prompt Template

```python
USER_PROMPT = f"""Analyze this token for a {lock_period}-week locked OTC deal:

TOKEN: {token_name} ({token_symbol})
Current Price: ${current_price}
Market Cap: ${market_cap}
Market Cap Rank: #{market_cap_rank}
24h Volume: ${total_volume}
24h Change: {price_change_24h}%
7d Change: {price_change_7d}%
30d Change: {price_change_30d}%
ATH: ${ath}
ATH Change: {ath_change}%

Consider the {lock_period}-week lock period in your risk assessment."""
```

### 7.3 Response Processing

```python
async def analyze_token(token_data: dict, lock_period: int) -> dict:
    response = await openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": USER_PROMPT}
        ],
        response_format={"type": "json_object"},
        temperature=0.7  # Some creativity but not too random
    )

    result = json.loads(response.choices[0].message.content)

    # Validate and clamp scores
    for key in result['scores']:
        result['scores'][key] = max(0, min(10, float(result['scores'][key])))

    return result
```

---

## 8. Fallback Scoring (Without OpenAI)

If OpenAI is unavailable, an algorithmic fallback is used:

```python
def generate_fallback_analysis(token_data: dict, lock_period: int) -> dict:
    # Calculate each score using heuristics
    technical = calculate_technical_score(token_data)
    risk = calculate_risk_score(token_data, lock_period)
    sentiment = calculate_sentiment_proxy(token_data)
    on_chain = calculate_onchain_proxy(token_data)
    fundamental = calculate_fundamental_proxy(token_data)

    # Calculate overall
    overall = (
        technical * 0.30 +
        (10 - risk) * 0.30 +
        sentiment * 0.20 +
        on_chain * 0.15 +
        fundamental * 0.05
    )

    # Generate recommendation
    recommendation = get_recommendation(overall)

    # Generate expected returns
    expected = calculate_expected_returns(token_data, lock_period)

    # Generate key risks
    key_risks = generate_risk_list(token_data, risk)

    return {
        "scores": {...},
        "recommendation": recommendation,
        "expected_return": expected,
        "key_risks": key_risks,
        "reasoning": generate_reasoning(token_data, overall)
    }
```

---

## 9. Discount Suggestion Algorithm

### 9.1 Logic

```python
def suggest_discount(lock_period: int, risk_score: float, volatility_30d: float) -> dict:
    # Base discount by lock period
    base_discount = {
        1: 5,   # 1 week = 5% base
        4: 12,  # 4 weeks = 12% base
        8: 20   # 8 weeks = 20% base
    }.get(lock_period, 10)

    # Risk adjustment (risk_score 0-10, where 10 is highest risk)
    # Higher risk = need more discount to compensate
    risk_adjustment = (risk_score - 5) * 1.5

    # Volatility adjustment
    if volatility_30d > 30:
        vol_adjustment = 5
    elif volatility_30d > 20:
        vol_adjustment = 3
    elif volatility_30d < 10:
        vol_adjustment = -2
    else:
        vol_adjustment = 0

    suggested = base_discount + risk_adjustment + vol_adjustment
    suggested = max(5, min(35, suggested))  # Clamp to 5-35%

    return {
        "suggested_discount": suggested,
        "min_recommended": max(5, suggested - 5),
        "max_recommended": min(40, suggested + 5)
    }
```

### 9.2 Example

```python
lock_period = 4
risk_score = 7.0  # High risk
volatility_30d = 25%

base_discount = 12
risk_adjustment = (7.0 - 5) * 1.5 = 3.0
vol_adjustment = 3

suggested = 12 + 3 + 3 = 18%
min_recommended = 13%
max_recommended = 23%
```

---

## 10. Model Improvements (Roadmap)

### 10.1 Data Sources to Add

| Source | Data | Priority |
|--------|------|----------|
| Nansen | Smart money flows | High |
| Token Unlocks | Unlock schedules | High |
| LunarCrush | Social sentiment | Medium |
| Dune Analytics | On-chain metrics | Medium |
| DefiLlama | TVL data | Medium |
| Glassnode | Exchange flows | Low |

### 10.2 Model Enhancements

1. **Fine-tuned model** — train on historical OTC deal data
2. **Ensemble approach** — combine GPT-4o with rule-based scoring
3. **Real-time updates** — consider events in real-time
4. **Backtesting** — validate predictions on historical data

### 10.3 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Prediction accuracy (direction) | >65% | TBD |
| Risk identification | >80% | TBD |
| User trust (survey) | >4/5 | TBD |
