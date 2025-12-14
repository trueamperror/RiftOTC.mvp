from datetime import datetime, timedelta
from typing import Optional
import uuid

from models.schemas import Deal, CreateDealRequest, TokenAnalysis


# In-memory storage for deals
_deals: dict[str, Deal] = {}


def generate_deal_id() -> str:
    return f"deal_{uuid.uuid4().hex[:12]}"


def create_deal(request: CreateDealRequest, ai_score: Optional[TokenAnalysis] = None) -> Deal:
    deal_id = generate_deal_id()
    total_cost = request.token_amount * request.price_per_token
    market_price = request.price_per_token / (1 - request.discount / 100)
    market_value = request.token_amount * market_price

    deal = Deal(
        id=deal_id,
        status="open",
        seller_address=request.seller_address,
        token_id=request.token_id,
        token_symbol=request.token_symbol,
        token_amount=request.token_amount,
        price_per_token=request.price_per_token,
        discount=request.discount,
        lock_period=request.lock_period,
        total_cost=total_cost,
        market_value=market_value,
        created_at=datetime.utcnow(),
        ai_score=ai_score
    )

    _deals[deal_id] = deal
    return deal


def get_deal(deal_id: str) -> Optional[Deal]:
    return _deals.get(deal_id)


def get_all_deals(status: Optional[str] = None) -> list[Deal]:
    deals = list(_deals.values())
    if status:
        deals = [d for d in deals if d.status == status]
    return sorted(deals, key=lambda d: d.created_at, reverse=True)


def accept_deal(deal_id: str, buyer_address: str) -> Optional[Deal]:
    deal = _deals.get(deal_id)
    if not deal or deal.status != "open":
        return None

    deal.status = "funded"
    deal.buyer_address = buyer_address
    deal.funded_at = datetime.utcnow()
    deal.unlock_at = deal.funded_at + timedelta(weeks=deal.lock_period)

    _deals[deal_id] = deal
    return deal


def claim_deal(deal_id: str) -> Optional[Deal]:
    deal = _deals.get(deal_id)
    if not deal or deal.status != "funded":
        return None

    if deal.unlock_at and datetime.utcnow() < deal.unlock_at:
        return None  # Lock period not passed

    deal.status = "completed"
    _deals[deal_id] = deal
    return deal


def cancel_deal(deal_id: str, address: str) -> Optional[Deal]:
    deal = _deals.get(deal_id)
    if not deal or deal.status != "open":
        return None

    if deal.seller_address != address:
        return None

    deal.status = "cancelled"
    _deals[deal_id] = deal
    return deal


def seed_demo_deals():
    """Create some demo deals for testing"""
    demo_deals = [
        CreateDealRequest(
            seller_address="0x1234567890abcdef1234567890abcdef12345678",
            token_id="uniswap",
            token_symbol="UNI",
            token_amount=10000,
            price_per_token=6.38,
            discount=15,
            lock_period=4
        ),
        CreateDealRequest(
            seller_address="0xabcdef1234567890abcdef1234567890abcdef12",
            token_id="arbitrum",
            token_symbol="ARB",
            token_amount=50000,
            price_per_token=0.66,
            discount=22,
            lock_period=8
        ),
        CreateDealRequest(
            seller_address="0x9876543210fedcba9876543210fedcba98765432",
            token_id="aave",
            token_symbol="AAVE",
            token_amount=500,
            price_per_token=85.0,
            discount=10,
            lock_period=1
        ),
    ]

    for req in demo_deals:
        create_deal(req)
