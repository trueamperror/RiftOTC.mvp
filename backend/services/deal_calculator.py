from typing import Optional


def calculate_deal_metrics(
    token_amount: float,
    market_price: float,
    discount: float,
    lock_period: int,
    expected_return: Optional[dict] = None
) -> dict:
    """Calculate comprehensive deal metrics for risk/reward analysis"""

    # Basic calculations
    discounted_price = market_price * (1 - discount / 100)
    total_cost = token_amount * discounted_price
    market_value = token_amount * market_price
    instant_equity = market_value - total_cost
    instant_equity_pct = (instant_equity / total_cost) * 100

    # Break-even: how much can price drop before you lose money
    break_even_drop = -discount  # If 15% discount, break-even at -15%

    # Risk calculations
    # Worst case: 50% drop from current price
    worst_case_value = token_amount * market_price * 0.5
    max_loss = worst_case_value - total_cost
    max_loss_pct = (max_loss / total_cost) * 100

    # Best case: use expected return or default 50% gain
    if expected_return:
        best_case_pct = expected_return.get("high", 50)
        expected_pct = expected_return.get("mid", 20)
        worst_pct = expected_return.get("low", -30)
    else:
        best_case_pct = 50
        expected_pct = 20
        worst_pct = -30

    # Calculate values based on scenarios
    expected_value = token_amount * market_price * (1 + expected_pct / 100)
    expected_profit = expected_value - total_cost
    expected_profit_pct = (expected_profit / total_cost) * 100

    best_case_value = token_amount * market_price * (1 + best_case_pct / 100)
    best_case_profit = best_case_value - total_cost
    best_case_profit_pct = (best_case_profit / total_cost) * 100

    worst_case_from_expected = token_amount * market_price * (1 + worst_pct / 100)
    worst_case_loss = worst_case_from_expected - total_cost
    worst_case_loss_pct = (worst_case_loss / total_cost) * 100

    # Risk/Reward ratio
    potential_gain = expected_profit
    potential_loss = abs(worst_case_loss) if worst_case_loss < 0 else total_cost * 0.1

    risk_reward_ratio = potential_gain / potential_loss if potential_loss > 0 else 10.0

    # Lock period factor (longer = more risk)
    lock_risk_factor = 1 + (lock_period - 1) * 0.1

    return {
        # Basic deal info
        "market_price": market_price,
        "discounted_price": discounted_price,
        "discount_pct": discount,
        "token_amount": token_amount,
        "total_cost": total_cost,
        "market_value": market_value,

        # Instant value
        "instant_equity": instant_equity,
        "instant_equity_pct": instant_equity_pct,

        # Break-even analysis
        "break_even_drop_pct": break_even_drop,

        # Scenario analysis
        "expected_return_pct": expected_profit_pct,
        "expected_value": expected_value,
        "expected_profit": expected_profit,

        "best_case_return_pct": best_case_profit_pct,
        "best_case_value": best_case_value,
        "best_case_profit": best_case_profit,

        "worst_case_return_pct": worst_case_loss_pct,
        "worst_case_value": worst_case_from_expected,
        "worst_case_loss": worst_case_loss,

        # Risk metrics
        "max_loss_50pct_drop": max_loss,
        "max_loss_50pct_drop_pct": max_loss_pct,
        "risk_reward_ratio": round(risk_reward_ratio, 2),
        "lock_period_weeks": lock_period,
        "lock_risk_factor": lock_risk_factor,

        # Quality indicators
        "is_favorable": risk_reward_ratio >= 1.5 and instant_equity_pct >= 10,
        "quality_score": min(10, (risk_reward_ratio * 2 + instant_equity_pct / 5) / 2)
    }


def suggest_discount(
    lock_period: int,
    risk_score: float,
    volatility_30d: float
) -> dict:
    """Suggest appropriate discount based on risk factors"""

    # Base discount by lock period
    base_discount = {
        1: 5,
        4: 12,
        8: 20
    }.get(lock_period, 10)

    # Adjust for risk score (0-10 where 10 is highest risk)
    risk_adjustment = (risk_score - 5) * 1.5

    # Adjust for volatility
    vol_adjustment = 0
    if volatility_30d > 30:
        vol_adjustment = 5
    elif volatility_30d > 20:
        vol_adjustment = 3
    elif volatility_30d < 10:
        vol_adjustment = -2

    suggested = base_discount + risk_adjustment + vol_adjustment
    suggested = max(5, min(35, suggested))

    return {
        "suggested_discount": round(suggested, 1),
        "min_recommended": round(max(5, suggested - 5), 1),
        "max_recommended": round(min(40, suggested + 5), 1),
        "reasoning": f"Based on {lock_period}-week lock, risk score of {risk_score:.1f}/10, "
                     f"and {volatility_30d:.1f}% monthly volatility"
    }
