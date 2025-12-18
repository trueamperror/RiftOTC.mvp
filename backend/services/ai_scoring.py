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
from .sentiment_analysis import SentimentScorer
from .onchain_analysis import OnChainScorer

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
- Sentiment Score (0-10): Momentum, Trending status, Community hype.
- On-Chain Score (0-10): Transaction activity, Holder distribution.
- Fundamental Strength (0-10): Dev Activity, Market Rank.

YOUR TASK:
1. Accept ALL provided scores as fact.
2. Synthesize a recommendation based on the weighted combination of these factors.
3. Be specific: Quote the "Dev Activity" or "Liquidity Risk" in your reasoning.

SCORING RULES:
- Technical (30%): Use provided value.
- Risk (30%): Use provided value.
- Sentiment (20%): Use provided value.
- On-Chain (15%): Use provided value.
- Fundamental (5%): Use provided value.
- Overall: Weighted average (calculated deterministically as: T*0.3 + (10-R)*0.3 + S*0.2 + O*0.15 + F*0.05).

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
    "recommendation": "<STRONG_BUY|BUY|HOLD|HIGH_RISK|EXTREME_RISK>",
    "expected_return": {
        "mid": <percentage>,
        "low": <percentage>,
        "high": <percentage>
    },
    "key_risks": ["risk1", "risk2"],
    "reasoning": "<Summary of why scores were given. Mention specific data points like 'Active Github'>."
}
"""


def calculate_overall_score(tech: float, risk: float, sentiment: float, on_chain: float, fundamental: float) -> float:
    """Standardized overall score calculation (30/30/20/15/5)"""
    overall = (
        tech * 0.30 +
        (10 - risk) * 0.30 + # Risk is inverted
        sentiment * 0.20 +
        on_chain * 0.15 +
        fundamental * 0.05
    )
    return round(max(0, min(10, overall)), 1)


async def analyze_token(token_data: dict, lock_period: int) -> dict:
    """Analyze a token using Deterministic Scorers + GPT-4 Narrative"""

    # 0. Context Data
    trending_list = await get_trending_tokens()
    is_trending = any(t['id'] == token_data['id'] for t in trending_list)

    # 1. Technical Analysis
    ohlc = await get_coin_ohlc(token_data['id'], days="365")
    price_history_1y = []
    real_volatility = 50.0
    if ohlc:
        price_history_1y = [candle[4] for candle in ohlc]
        tech_scorer = TechnicalScorer(ohlc)
        tech_result = tech_scorer.get_technical_score()
        real_volatility = tech_result['indicators'].get('volatility', 50.0)
    else:
        tech_result = {"score": 5.0, "indicators": {}, "details": ["No OHLC data available"]}

    # 2. Risk Analysis
    risk_scorer = RiskScorer(token_data, real_volatility, lock_period)
    risk_result = risk_scorer.get_risk_score()

    # 3. Sentiment Analysis
    sent_scorer = SentimentScorer(token_data, is_trending)
    sent_result = sent_scorer.get_sentiment_score()

    # 4. On-Chain Analysis
    oc_scorer = OnChainScorer(token_data)
    oc_result = oc_scorer.get_on_chain_score()

    # 5. Fundamental Analysis
    fund_scorer = FundamentalScorer(token_data, is_trending)
    fund_result = fund_scorer.get_fundamental_score()

    # 6. Overall Deterministic Score
    overall_score = calculate_overall_score(
        tech_result['score'], 
        risk_result['score'], 
        sent_result['score'], 
        oc_result['score'], 
        fund_result['score']
    )

    # 7. Prepare Prompt
    tech_details = "\n".join([f"- {d}" for d in tech_result['details']])
    risk_details = "\n".join([f"- {d}" for d in risk_result['details']])
    sent_details = "\n".join([f"- {d}" for d in sent_result['details']])
    oc_details = "\n".join([f"- {d}" for d in oc_result['details']])
    fund_details = "\n".join([f"- {d}" for d in fund_result.get('details', [])])
    
    user_prompt = f"""
    TOKEN: {token_data['name']} ({token_data['symbol'].upper()})
    Lock Period: {lock_period} weeks
    
    DETERMINISTIC SCORECARD:
    
    1. TECHNICAL SCORE: {tech_result['score']}/10
    {tech_details}
    
    2. RISK SCORE: {risk_result['score']}/10 (Higher = Worse)
    {risk_details}
    
    3. SENTIMENT SCORE: {sent_result['score']}/10
    {sent_details}
    
    4. ON-CHAIN SCORE: {oc_result['score']}/10
    {oc_details}
    
    5. FUNDAMENTAL SCORE: {fund_result['score']}/10
    - Dev Score: {fund_result['components']['dev_score']}
    - Community Score: {fund_result['components']['community_score']}
    {fund_details}
    
    === OVERALL SYSTEM SCORE: {overall_score}/10 ===
    
    Generate the JSON analysis based on these metrics. 
    Calculate expected returns based on current 7d momentum ({token_data.get('price_change_percentage_7d', 0):+.1f}%) 
    and annualized volatility ({real_volatility:.1f}%).
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
        result['scores'] = {
            "technical": tech_result['score'],
            "risk": risk_result['score'],
            "sentiment": sent_result['score'],
            "on_chain": oc_result['score'],
            "fundamental": fund_result['score'],
            "overall": overall_score
        }
        result['price_history_1y'] = price_history_1y

        return result

    except Exception as e:
        print(f"OpenAI API error: {e}")
        fallback = generate_fallback_analysis_internal(
            token_data, lock_period, 
            tech_result, risk_result, sent_result, oc_result, fund_result, 
            overall_score, real_volatility
        )
        fallback['price_history_1y'] = price_history_1y
        return fallback


def generate_fallback_analysis_internal(
    token_data: dict, lock_period: int,
    tech_result: dict, risk_result: dict, sent_result: dict, oc_result: dict, fund_result: dict,
    overall_score: float, real_volatility: float
) -> dict:
    """Helper to generate fallback when AI is down, using pre-calculated results"""
    
    price_7d = token_data.get('price_change_percentage_7d', 0) or 0
    
    # Expected returns based on real volatility and momentum
    expected_mid = price_7d * 0.6
    expected_low = -max(15, (real_volatility / 4) * (1 + lock_period * 0.1))
    expected_high = max(20, (real_volatility / 3) * (1 + lock_period * 0.1))

    # Determine recommendation
    if overall_score >= 7.5:
        recommendation = "STRONG_BUY"
    elif overall_score >= 6.0:
        recommendation = "BUY"
    elif overall_score >= 4.5:
        recommendation = "HOLD"
    elif overall_score >= 3.0:
        recommendation = "HIGH_RISK"
    else:
        recommendation = "EXTREME_RISK"

    key_risks = risk_result['details'][:3]
    if not key_risks:
        key_risks = ["Market-wide volatility", "Lock period exposure"]

    return {
        "scores": {
            "technical": tech_result['score'],
            "risk": risk_result['score'],
            "sentiment": sent_result['score'],
            "on_chain": oc_result['score'],
            "fundamental": fund_result['score'],
            "overall": overall_score
        },
        "recommendation": recommendation,
        "expected_return": {
            "low": round(expected_low, 1),
            "mid": round(expected_mid, 1),
            "high": round(expected_high, 1)
        },
        "key_risks": key_risks,
        "reasoning": f"System analysis of {token_data['name']}. "
                     f"Technical score is {tech_result['score']}, with risk level at {risk_result['score']}. "
                     f"The {lock_period}-week lock period requires a {recommendation} posture.",
        "price_history_1y": []
    }


def generate_fallback_analysis(token_data: dict, lock_period: int) -> dict:
    """Legacy public fallback - now routes to new logic with minimal mock results"""
    # This is a bit redundant now but kept for API compatibility if used elsewhere
    tech_res = {"score": 5.0, "details": []}
    risk_res = {"score": 5.0, "details": []}
    sent_res = {"score": 5.0, "details": []}
    oc_res = {"score": 5.0, "details": []}
    fund_res = {"score": 5.0, "components": {"dev_score": 5.0, "community_score": 5.0}, "details": []}
    
    overall = calculate_overall_score(5, 5, 5, 5, 5)
    return generate_fallback_analysis_internal(
        token_data, lock_period, 
        tech_res, risk_res, sent_res, oc_res, fund_res, 
        overall, 60.0 # Default volatility proxy
    )


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
