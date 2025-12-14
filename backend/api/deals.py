from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from models.schemas import Deal, CreateDealRequest, AcceptDealRequest, TokenAnalysis, AnalyzeRequest
from database.db import (
    create_deal,
    get_deal,
    get_all_deals,
    accept_deal,
    claim_deal,
    cancel_deal
)
from services.coingecko import get_token_data
from services.ai_scoring import analyze_token
from models.schemas import ScoreBreakdown, ExpectedReturn

router = APIRouter()


@router.get("/deals", response_model=list[Deal])
async def list_deals(status: Optional[str] = Query(None, description="Filter by status")):
    """
    List all deals, optionally filtered by status.

    Status values: open, funded, completed, cancelled
    """
    valid_statuses = {"open", "funded", "completed", "cancelled"}
    if status and status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    return get_all_deals(status)


@router.get("/deals/{deal_id}", response_model=Deal)
async def get_deal_by_id(deal_id: str):
    """Get a specific deal by ID"""
    deal = get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.post("/deals", response_model=Deal)
async def create_new_deal(request: CreateDealRequest):
    """
    Create a new OTC deal.

    The seller specifies:
    - Token to sell
    - Amount of tokens
    - Price per token (after discount)
    - Discount percentage
    - Lock period (1, 4, or 8 weeks)

    AI analysis is automatically attached to the deal.
    """

    # Validate token exists
    token_data = await get_token_data(request.token_id)
    if not token_data:
        raise HTTPException(
            status_code=400,
            detail=f"Token '{request.token_id}' not found"
        )

    # Get AI analysis for the deal
    try:
        analysis_result = await analyze_token(token_data, request.lock_period)
        ai_score = TokenAnalysis(
            token_id=token_data["id"],
            token_name=token_data["name"],
            token_symbol=token_data["symbol"],
            current_price=token_data["current_price"],
            market_cap=token_data.get("market_cap"),
            scores=ScoreBreakdown(**analysis_result["scores"]),
            recommendation=analysis_result["recommendation"],
            expected_return=ExpectedReturn(**analysis_result["expected_return"]),
            key_risks=analysis_result["key_risks"],
            reasoning=analysis_result["reasoning"]
        )
    except Exception as e:
        print(f"Failed to get AI analysis: {e}")
        ai_score = None

    deal = create_deal(request, ai_score)
    return deal


@router.post("/deals/{deal_id}/accept", response_model=Deal)
async def accept_deal_endpoint(deal_id: str, request: AcceptDealRequest):
    """
    Accept an open deal as a buyer.

    This simulates:
    1. Buyer sends payment to escrow
    2. Seller's tokens are locked in escrow
    3. Seller receives payment immediately
    4. Tokens unlock for buyer after lock period
    """
    deal = get_deal(deal_id)

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if deal.status != "open":
        raise HTTPException(
            status_code=400,
            detail=f"Deal cannot be accepted. Current status: {deal.status}"
        )

    updated_deal = accept_deal(deal_id, request.buyer_address)

    if not updated_deal:
        raise HTTPException(status_code=500, detail="Failed to accept deal")

    return updated_deal


@router.post("/deals/{deal_id}/claim", response_model=Deal)
async def claim_deal_endpoint(deal_id: str):
    """
    Claim tokens after lock period has passed.

    This simulates the buyer withdrawing their unlocked tokens
    from the escrow contract.
    """
    deal = get_deal(deal_id)

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if deal.status != "funded":
        raise HTTPException(
            status_code=400,
            detail=f"Deal cannot be claimed. Current status: {deal.status}"
        )

    updated_deal = claim_deal(deal_id)

    if not updated_deal:
        raise HTTPException(
            status_code=400,
            detail="Lock period has not ended yet. Cannot claim tokens."
        )

    return updated_deal


@router.post("/deals/{deal_id}/cancel", response_model=Deal)
async def cancel_deal_endpoint(deal_id: str, seller_address: str = Query(...)):
    """
    Cancel an open deal (seller only).

    Only open deals can be cancelled. Once accepted, the deal is locked.
    """
    deal = get_deal(deal_id)

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if deal.status != "open":
        raise HTTPException(
            status_code=400,
            detail="Only open deals can be cancelled"
        )

    updated_deal = cancel_deal(deal_id, seller_address)

    if not updated_deal:
        raise HTTPException(
            status_code=403,
            detail="Only the seller can cancel this deal"
        )

    return updated_deal
