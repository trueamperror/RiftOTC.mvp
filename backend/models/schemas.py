from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# Token Analysis Models
class AnalyzeRequest(BaseModel):
    token_id: str
    lock_period: Literal[1, 4, 8] = 4


class ScoreBreakdown(BaseModel):
    technical: float = Field(ge=0, le=10)
    risk: float = Field(ge=0, le=10)
    sentiment: float = Field(ge=0, le=10)
    on_chain: float = Field(ge=0, le=10)
    fundamental: float = Field(ge=0, le=10)
    overall: float = Field(ge=0, le=10)


class ExpectedReturn(BaseModel):
    low: float
    mid: float
    high: float


class TokenAnalysis(BaseModel):
    token_id: str
    token_name: str
    token_symbol: str
    current_price: float
    market_cap: Optional[float] = None
    scores: ScoreBreakdown
    recommendation: Literal["STRONG_BUY", "BUY", "HOLD", "HIGH_RISK", "EXTREME_RISK"]
    expected_return: ExpectedReturn
    key_risks: list[str]
    reasoning: str
    sparkline_in_7d: list[float] = []
    price_history_1y: list[float] = []
    image: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    token_context: TokenAnalysis


class ChatResponse(BaseModel):
    response: str


# Deal Models
class CreateDealRequest(BaseModel):
    seller_address: str
    token_id: str
    token_symbol: str
    token_amount: float = Field(gt=0)
    price_per_token: float = Field(gt=0)
    discount: float = Field(ge=0, le=50)
    lock_period: Literal[1, 4, 8] = 4


class AcceptDealRequest(BaseModel):
    buyer_address: str


class Deal(BaseModel):
    id: str
    status: Literal["open", "funded", "completed", "cancelled"]
    seller_address: str
    buyer_address: Optional[str] = None
    token_id: str
    token_symbol: str
    token_amount: float
    price_per_token: float
    discount: float
    lock_period: Literal[1, 4, 8]
    total_cost: float
    market_value: float
    created_at: datetime
    funded_at: Optional[datetime] = None
    unlock_at: Optional[datetime] = None
    ai_score: Optional[TokenAnalysis] = None


# Token Search Models
class TokenSearchResult(BaseModel):
    id: str
    name: str
    symbol: str
    market_cap_rank: Optional[int] = None
    thumb: Optional[str] = None


class TokenData(BaseModel):
    id: str
    name: str
    symbol: str
    current_price: float
    market_cap: float
    total_volume: float
    price_change_percentage_24h: float
    price_change_percentage_7d: Optional[float] = None
    price_change_percentage_30d: Optional[float] = None
    ath: float
    ath_change_percentage: float
    market_cap_rank: Optional[int] = None
    image: Optional[str] = None
