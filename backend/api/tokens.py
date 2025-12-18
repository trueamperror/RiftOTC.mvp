from fastapi import APIRouter, HTTPException, Query

from models.schemas import TokenData, TokenSearchResult
from services.coingecko import get_token_data, search_tokens, get_trending_tokens, RateLimitError
from services.deal_calculator import calculate_deal_metrics, suggest_discount

router = APIRouter()


@router.get("/tokens/search", response_model=list[TokenSearchResult])
async def search_tokens_endpoint(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Max results")
):
    """
    Search for tokens by name or symbol.

    Returns basic token info for search results.
    Use /tokens/{id} to get full market data.
    """
    results = await search_tokens(q, limit)

    if not results:
        return []

    return [TokenSearchResult(**r) for r in results]


@router.get("/tokens/trending", response_model=list[TokenSearchResult])
async def get_trending_tokens_endpoint():
    """Get currently trending tokens from CoinGecko"""
    results = await get_trending_tokens()
    return [TokenSearchResult(**r) for r in results]


@router.get("/tokens/{token_id}", response_model=TokenData)
async def get_token_endpoint(token_id: str):
    """
    Get full market data for a specific token.

    Use the CoinGecko token ID (e.g., 'bitcoin', 'ethereum', 'uniswap').
    """
    try:
        token = await get_token_data(token_id)
    except RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="External API rate limit reached. Please wait a moment and try again."
        )

    if not token:
        raise HTTPException(
            status_code=404,
            detail=f"Token '{token_id}' not found. Please check the token symbol or ID."
        )

    return TokenData(**token)


@router.post("/tokens/{token_id}/calculate")
async def calculate_deal_endpoint(
    token_id: str,
    amount: float = Query(..., gt=0, description="Token amount"),
    discount: float = Query(..., ge=0, le=50, description="Discount percentage"),
    lock_period: int = Query(4, ge=1, le=8, description="Lock period in weeks")
):
    """
    Calculate deal metrics for a potential OTC trade.

    Returns comprehensive risk/reward analysis including:
    - Break-even point
    - Expected returns (low/mid/high scenarios)
    - Risk/reward ratio
    - Quality score
    """
    token = await get_token_data(token_id)

    if not token:
        raise HTTPException(
            status_code=404,
            detail=f"Token '{token_id}' not found"
        )

    metrics = calculate_deal_metrics(
        token_amount=amount,
        market_price=token["current_price"],
        discount=discount,
        lock_period=lock_period
    )

    return {
        "token": {
            "id": token["id"],
            "name": token["name"],
            "symbol": token["symbol"],
            "current_price": token["current_price"]
        },
        "metrics": metrics
    }


@router.get("/tokens/{token_id}/suggest-discount")
async def suggest_discount_endpoint(
    token_id: str,
    lock_period: int = Query(4, ge=1, le=8, description="Lock period in weeks"),
    risk_score: float = Query(5.0, ge=0, le=10, description="Risk score from AI analysis")
):
    """
    Get a suggested discount percentage based on risk factors.

    Considers:
    - Lock period (longer = higher discount needed)
    - Risk score from AI analysis
    - Token's 30-day volatility
    """
    token = await get_token_data(token_id)

    if not token:
        raise HTTPException(
            status_code=404,
            detail=f"Token '{token_id}' not found"
        )

    # Fallback to a simple volatility proxy if no full technical analysis is available here
    # 30d change is NOT volatility. We use a combination of 7d and 30d absolute moves.
    price_7d = abs(token.get("price_change_percentage_7d", 0) or 0)
    price_30d = abs(token.get("price_change_percentage_30d", 0) or 0)
    volatility_proxy = (price_7d * 2 + price_30d) / 2

    suggestion = suggest_discount(
        lock_period=lock_period,
        risk_score=risk_score,
        volatility_30d=volatility_proxy
    )

    return {
        "token_id": token_id,
        "lock_period": lock_period,
        **suggestion
    }
