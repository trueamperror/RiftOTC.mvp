
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services.technical_analysis import TechnicalScorer

def test_technical_scorer():
    print("Testing TechnicalScorer...")
    
    # Mock OHLC data: [timestamp, open, high, low, close]
    # Create a simple uptrend with low volatility
    import random
    random.seed(42)
    ohlc = []
    base_price = 100.0
    for i in range(50):
        # random walk with positive drift
        drift = 1.005  # 0.5% daily drift
        noise = (random.random() - 0.5) * 0.04 # +/- 2% noise
        
        base_price = base_price * drift * (1 + noise)
        
        ohlc.append([
            1000 + i,
            base_price * 0.99, 
            base_price * 1.01, 
            base_price * 0.98,
            base_price
        ])
    
    scorer = TechnicalScorer(ohlc)
    result = scorer.get_technical_score()
    
    print("\n--- Uptrend Scenario ---")
    print(f"Score: {result['score']}")
    print(f"Indicators: {result['indicators']}")
    print(f"Details: {result['details']}")
    
    # Verify basics
    assert result['score'] > 5.0, "Uptrend should be positive"
    assert result['indicators']['rsi'] > 50, "RSI should be high in uptrend"
    
    # Create high volatility scenario
    ohlc_vol = []
    import random
    random.seed(42)
    for i in range(50):
        # Random swings
        swing = (random.random() - 0.5) * 0.2  # +/- 10% swings
        close = base_price * (1 + swing)
        ohlc_vol.append([2000+i, close, close+1, close-1, close])
        
    scorer_vol = TechnicalScorer(ohlc_vol)
    result_vol = scorer_vol.get_technical_score()
    
    print("\n--- Volatility Scenario ---")
    print(f"Score: {result_vol['score']}")
    print(f"Volatility: {result_vol['indicators']['volatility']}%")
    print(f"Details: {result_vol['details']}")
    
    assert result_vol['indicators']['volatility'] > 100, "Volatility should be high"
    assert result_vol['score'] < 5.0, "High vol should be penalized"

    print("\nTests Passed!")


from backend.services.risk_analysis import RiskScorer

def test_risk_scorer():
    print("Testing RiskScorer...")
    
    # CASE 1: Healthy Token (High MCap, Low FDV ratio, Good Volatility)
    token_good = {
        "market_cap": 1_000_000_000,
        "total_volume": 100_000_000, # 10% liquidity
        "fully_diluted_valuation": 1_100_000_000 # 1.1 ratio
    }
    scorer_good = RiskScorer(token_good, volatility=40.0, lock_period=1)
    result_good = scorer_good.get_risk_score()
    
    print("\n--- Good Token Risk ---")
    print(f"Score: {result_good['score']}/10")
    print(result_good['components'])
    
    assert result_good['score'] < 4.0, "Healthy token should have low risk"
    
    # CASE 2: Shitcoin (Low MCap, High FDV, Crazy Volatility)
    token_bad = {
        "market_cap": 5_000_000,
        "total_volume": 10_000,     # < 1% liquidity (High Risk)
        "fully_diluted_valuation": 100_000_000 # 20x ratio (Dilution Risk)
    }
    scorer_bad = RiskScorer(token_bad, volatility=120.0, lock_period=4)
    result_bad = scorer_bad.get_risk_score()
    
    print("\n--- Bad Token Risk ---")
    print(f"Score: {result_bad['score']}/10")
    print(result_bad['components'])
    print(f"Details: {result_bad['details']}")
    
    assert result_bad['score'] > 7.0, "Shitcoin should have high risk"
    assert "Low Liquidity" in str(result_bad['details'])


from backend.services.fundamental_analysis import FundamentalScorer

def test_fundamental_scorer():
    print("Testing FundamentalScorer...")
    
    # CASE 1: Top Tier Token (High Rank, High Dev, High Socials)
    token_top = {
        "market_cap_rank": 5,
        "developer_data": {"commit_count_4_weeks": 200, "stars": 20000},
        "community_data": {"twitter_followers": 2_000_000, "telegram_channel_user_count": 50_000}
    }
    scorer_top = FundamentalScorer(token_top, is_trending=True)
    result_top = scorer_top.get_fundamental_score()
    
    print("\n--- Top Token Fundamentals ---")
    print(f"Score: {result_top['score']}/10")
    print(result_top['components'])
    
    assert result_top['score'] > 8.0, "Top token should have high fundamental score"
    
    # CASE 2: Dead Token (No Rank, No Dev, No Socials)
    token_dead = {
        "market_cap_rank": None,
        "developer_data": None,
        "community_data": None
    }
    scorer_dead = FundamentalScorer(token_dead, is_trending=False)
    result_dead = scorer_dead.get_fundamental_score()
    
    print("\n--- Dead Token Fundamentals ---")
    print(f"Score: {result_dead['score']}/10")
    print(result_dead['components'])
    
    assert result_dead['score'] < 5.0, "Dead token should have low score"


if __name__ == "__main__":
    test_technical_scorer()
    print("\n" + "="*20 + "\n")
    test_risk_scorer()
    print("\n" + "="*20 + "\n")
    test_fundamental_scorer()
