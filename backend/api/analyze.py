from fastapi import APIRouter, HTTPException

from models.schemas import AnalyzeRequest, TokenAnalysis, ScoreBreakdown, ExpectedReturn, ChatRequest, ChatResponse
from services.coingecko import get_token_data, RateLimitError
from services.ai_scoring import analyze_token, chat_about_token

router = APIRouter()


@router.post("/analyze", response_model=TokenAnalysis)
async def analyze_token_endpoint(request: AnalyzeRequest):
    """
    Analyze a token for OTC deal assessment.

    Returns AI-powered scoring across multiple dimensions:
    - Technical: price momentum, volatility
    - Risk: upcoming events, unlock schedules
    - Sentiment: social metrics, community activity
    - On-chain: exchange flows, holder distribution
    - Fundamental: project health metrics

    Lock period affects risk assessment - longer locks = more uncertainty.
    """

    # Fetch token data from CoinGecko
    try:
        token_data = await get_token_data(request.token_id)
    except RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="CoinGecko API Rate Limit. Please wait a moment and try again."
        )

    if not token_data:
        raise HTTPException(
            status_code=404,
            detail=f"Token '{request.token_id}' not found. Please check the ID."
        )

    # Get AI analysis
    analysis = await analyze_token(token_data, request.lock_period)

    # Build response
    return TokenAnalysis(
        token_id=token_data["id"],
        token_name=token_data["name"],
        token_symbol=token_data["symbol"],
        current_price=token_data["current_price"],
        market_cap=token_data.get("market_cap"),
        scores=ScoreBreakdown(**analysis["scores"]),
        recommendation=analysis["recommendation"],
        expected_return=ExpectedReturn(**analysis["expected_return"]),
        key_risks=analysis["key_risks"],
        reasoning=analysis["reasoning"],
        sparkline_in_7d=token_data.get("sparkline_in_7d", []),
        price_history_1y=analysis.get("price_history_1y", []),
        image=token_data.get("image")
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Ask questions about a specific token analysis.
    The context must be provided in the request body.
    """
    response_text = await chat_about_token(
        message=request.message,
        context=request.token_context.model_dump()
    )
    
    return ChatResponse(response=response_text)
