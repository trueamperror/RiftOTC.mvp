import os
import json
from typing import Optional
from openai import AsyncOpenAI

client: Optional[AsyncOpenAI] = None


def get_client() -> AsyncOpenAI:
    global client
    if client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        client = AsyncOpenAI(api_key=api_key)
    return client



from .coingecko import get_coin_ohlc, get_trending_tokens
from .technical_analysis import TechnicalScorer
from .risk_analysis import RiskScorer
from .fundamental_analysis import FundamentalScorer

SYSTEM_PROMPT = """You are an expert crypto analyst for an OTC trading platform called Rift.ai.
Your job is to analyze tokens for SHORT-TERM locked deals (1-8 weeks).

You will receive PRE-CALCULATED deterministic scores for ALL categories.
Your job is to INTERPRET these scores and provide a cohesive narrative.

CRITICAL: Your explanation (Reasoning) must be BEGINNER-FRIENDLY.
Imagine you are explaining to a complete newcomer or a "5-year-old".
Avoid jargon where possible, or explain it simply.
Use terms like "Good / Bad / Risky" clearly.

INPUT DATA:
- Technical Score (0-10): RSI, Volatility, SMA.
- Risk Score (0-10): Liquidity, Dilution (FDV), Volatility.
- Fundamental Strength (0-10): Dev Activity, Community Size, Market Rank.

YOUR TASK:
1. Accept ALL provided scores as fact.
2. Synthesize a recommendation based on the weighted combination of these factors.
3. Be specific: Quote the "Dev Activity" or "Liquidity Risk" in your reasoning.

SCORING RULES:
- Technical: Use provided value.
- Risk: Use provided value.
- Sentiment/Fundamental: Use provided 'Fundamental Strength' as a proxy for market presence/sentiment.
- Overall: Weighted average (calculated deterministically).

Return JSON:
{
    "scores": {
        "technical": <float>,
        "risk": <float>,
        "sentiment": <float>,
        "on_chain": <float>,
        "fundamental": <float>,
        "overall": <float>
    },
        "overall": <float>
    },
    "recommendation": "<STRONG_BUY|BUY|HOLD|HIGH_RISK|EXTREME_RISK>",
    "expected_return": {
        "low": <percentage>,
        "mid": <percentage>,
        "high": <percentage>
    },
    "key_risks": ["risk1", "risk2"],
    "reasoning": "<Summary of why scores were given. Mention specific data points like 'Active Github'>."
}
"""


async def analyze_token(token_data: dict, lock_period: int) -> dict:
    """Analyze a token using Deterministic Scorer + GPT-4 Narrative"""

    # 0. Context Data
    trending_list = await get_trending_tokens()
    is_trending = any(t['id'] == token_data['id'] for t in trending_list)

    # 1. Technical Analysis
    ohlc = await get_coin_ohlc(token_data['id'], days="365")
    price_history_1y = []
    if ohlc:
        # OHLC format: [timestamp, open, high, low, close]
        # We just want close prices for the sparkline
        price_history_1y = [candle[4] for candle in ohlc]
        
        tech_scorer = TechnicalScorer(ohlc)
        tech_result = tech_scorer.get_technical_score()
        volatility = tech_result['indicators'].get('volatility', 50.0)
    else:
        tech_result = {"score": 5.0, "indicators": {}, "details": ["No OHLC data available"]}
        volatility = 50.0

    # 2. Risk Analysis
    risk_scorer = RiskScorer(token_data, volatility, lock_period)
    risk_result = risk_scorer.get_risk_score()

    # 3. Fundamental/Sentiment Analysis
    fund_scorer = FundamentalScorer(token_data, is_trending)
    fund_result = fund_scorer.get_fundamental_score()

    # 4. Overall Deterministic Score
    # Tech (35%), Risk (35%), Fundamental/Sentiment (30%)
    overall_score = (
        tech_result['score'] * 0.35 +
        (10 - risk_result['score']) * 0.35 + # Risk is inverted
        fund_result['score'] * 0.30
    )
    overall_score = round(max(0, min(10, overall_score)), 1)

    # 5. Prepare Prompt
    tech_details = "\n".join([f"- {d}" for d in tech_result['details']])
    risk_details = "\n".join([f"- {d}" for d in risk_result['details']])
    fund_details = "\n".join([f"- {d}" for d in fund_result['details']])
    
    user_prompt = f"""
    TOKEN: {token_data['name']} ({token_data['symbol'].upper()})
    Lock Period: {lock_period} weeks
    
    DETERMINISTIC SCORECARD:
    
    1. TECHNICAL SCORE: {tech_result['score']}/10
    {tech_details}
    
    2. RISK SCORE: {risk_result['score']}/10 (Higher = Worse)
    {risk_details}
    
    3. MARKET PRESENCE (Fundamental/Sentiment): {fund_result['score']}/10
    - Dev Score: {fund_result['components']['dev_score']}
    - Community Score: {fund_result['components']['community_score']}
    {fund_details}
    
    === OVERALL SYSTEM SCORE: {overall_score}/10 ===
    
    Generate the JSON analysis based on these metrics.
    """

    try:
        ai_client = get_client()
        response = await ai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )

        result = json.loads(response.choices[0].message.content)
        
        # Enforce deterministic scores
        result['scores']['technical'] = tech_result['score']
        result['scores']['risk'] = risk_result['score']
        result['scores']['fundamental'] = fund_result['score']
        result['scores']['sentiment'] = fund_result['score'] # Use same score for sentiment proxy
        result['scores']['overall'] = overall_score
        result['price_history_1y'] = price_history_1y

        return result

    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Fallback now includes all 3 pillars
        fallback = generate_fallback_analysis(token_data, lock_period)
        fallback['scores']['technical'] = tech_result['score']
        fallback['scores']['risk'] = risk_result['score']
        fallback['scores']['fundamental'] = fund_result['score']
        fallback['scores']['sentiment'] = fund_result['score']
        fallback['scores']['overall'] = overall_score
        fallback['reasoning'] = f"System Score: {overall_score}. Tech: {tech_result['score']}, Risk: {risk_result['score']}, Fund: {fund_result['score']}."
        return fallback


def generate_fallback_analysis(token_data: dict, lock_period: int) -> dict:
    """Generate a basic analysis when AI is unavailable"""

    price_24h = token_data.get('price_change_percentage_24h', 0) or 0
    price_7d = token_data.get('price_change_percentage_7d', 0) or 0
    price_30d = token_data.get('price_change_percentage_30d', 0) or 0
    market_cap = token_data.get('market_cap', 0) or 0
    ath_change = token_data.get('ath_change_percentage', 0) or 0

    # Simple heuristic scoring
    technical = 5.0
    if price_7d > 10:
        technical += 1.5
    elif price_7d < -10:
        technical -= 1.5
    if price_30d > 20:
        technical += 1.0
    elif price_30d < -20:
        technical -= 1.0

    # Risk based on volatility and market cap
    risk = 5.0
    if abs(price_24h) > 15:
        risk += 2.0
    if market_cap < 100_000_000:
        risk += 2.0
    elif market_cap > 1_000_000_000:
        risk -= 1.0
    if ath_change < -80:
        risk += 1.5

    # Longer lock = higher risk
    risk += (lock_period - 1) * 0.5

    # Simple sentiment based on price momentum
    sentiment = 5.0 + (price_7d / 10)

    # On-chain proxy from volume
    volume = token_data.get('total_volume', 0) or 0
    on_chain = 5.0
    if volume > market_cap * 0.1:
        on_chain += 2.0

    # Fundamental based on market cap rank
    rank = token_data.get('market_cap_rank')
    fundamental = 5.0
    if rank and rank <= 50:
        fundamental = 7.0
    elif rank and rank <= 100:
        fundamental = 6.0

    # Clamp all scores
    technical = max(0, min(10, technical))
    risk = max(0, min(10, risk))
    sentiment = max(0, min(10, sentiment))
    on_chain = max(0, min(10, on_chain))
    fundamental = max(0, min(10, fundamental))

    # Overall: weighted average (risk inverted)
    overall = (
        technical * 0.30 +
        (10 - risk) * 0.30 +
        sentiment * 0.20 +
        on_chain * 0.15 +
        fundamental * 0.05
    )

    # Determine recommendation
    if overall >= 7.5:
        recommendation = "STRONG_BUY"
    elif overall >= 6.0:
        recommendation = "BUY"
    elif overall >= 4.5:
        recommendation = "HOLD"
    elif overall >= 3.0:
        recommendation = "HIGH_RISK"
    else:
        recommendation = "EXTREME_RISK"

    # Expected returns based on volatility
    volatility = abs(price_7d) + abs(price_30d) / 2
    expected_mid = price_7d * 0.5
    expected_low = -max(15, volatility * 0.8)
    expected_high = max(20, volatility * 1.2)

    key_risks = []
    if risk >= 7:
        key_risks.append("High volatility detected in recent price action")
    if market_cap < 100_000_000:
        key_risks.append("Lower market cap increases manipulation risk")
    if ath_change < -70:
        key_risks.append(f"Token is {abs(ath_change):.0f}% below ATH")
    if lock_period >= 4:
        key_risks.append(f"{lock_period}-week lock period increases exposure to market swings")

    if not key_risks:
        key_risks = ["Standard market volatility risk", "Crypto market correlation"]

    return {
        "scores": {
            "technical": round(technical, 1),
            "risk": round(risk, 1),
            "sentiment": round(sentiment, 1),
            "on_chain": round(on_chain, 1),
            "fundamental": round(fundamental, 1),
            "overall": round(overall, 1)
        },
        "recommendation": recommendation,
        "expected_return": {
            "low": round(expected_low, 1),
            "mid": round(expected_mid, 1),
            "high": round(expected_high, 1)
        },
        "key_risks": key_risks[:3],
        "reasoning": f"Analysis based on {token_data['name']}'s recent performance. "
                     f"The token shows {price_7d:+.1f}% 7-day momentum with "
                     f"{'strong' if volume > market_cap * 0.05 else 'moderate'} trading volume. "
                     f"Consider the {lock_period}-week lock period in your risk assessment.",
        "price_history_1y": []
    }


async def chat_about_token(message: str, context: dict) -> str:
    """
    Answer user questions about a specific token analysis.
    Context is the full JSON output from analyze_token.
    """
    
    system_prompt = """You are a helpful crypto analyst assistant.
    You have performed a detailed analysis of a token (Context).
    User is asking questions about this analysis.
    
    RULES:
    1. Answer strictly based on the provided Context metrics.
    2. If the user asks "Why is risk high?", look at the 'Risk Score' and 'Key Risks' in context.
    3. Keep answers concise (max 2-3 sentences).
    4. Be professional but conversational.
    """

    user_prompt = f"""
    CONTEXT (Analysis Results):
    {json.dumps(context, indent=2)}
    
    USER QUESTION:
    {message}
    """

    try:
        ai_client = get_client()
        response = await ai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"OpenAI Chat error: {e}")
        return "I'm having trouble connecting to my brain right now. Please try again."
