
import math

class TechnicalScorer:
    """
    Deterministic Technical Analysis Engine.
    Calculates RSI, Volatility, SMA, and other indicators from OHLC data.
    """

    def __init__(self, ohlc_data: list[list[float]]):
        """
        ohlc_data: List of [timestamp, open, high, low, close]
        """
        # Sort by timestamp just in case
        self.data = sorted(ohlc_data, key=lambda x: x[0])
        self.closes = [x[4] for x in self.data]
        self.highs = [x[2] for x in self.data]
        self.lows = [x[3] for x in self.data]

    def calculate_rsi(self, period: int = 14) -> float:
        """Calculate Relative Strength Index (0-100)"""
        if len(self.closes) < period + 1:
            return 50.0  # Not enough data

        deltas = [self.closes[i] - self.closes[i-1] for i in range(1, len(self.closes))]
        
        gains = [d if d > 0 else 0 for d in deltas]
        losses = [abs(d) if d < 0 else 0 for d in deltas]

        avg_gain = sum(gains[-period:]) / period
        avg_loss = sum(losses[-period:]) / period

        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        return 100 - (100 / (1 + rs))

    def calculate_volatility(self, period: int = 30) -> float:
        """Calculate annualized volatility (approximate)"""
        if len(self.closes) < period:
            return 0.0
            
        # Log returns
        returns = []
        for i in range(1, len(self.closes)):
            r = math.log(self.closes[i] / self.closes[i-1])
            returns.append(r)
            
        recent_returns = returns[-period:]
        mean_return = sum(recent_returns) / len(recent_returns)
        
        variance = sum([(x - mean_return)**2 for x in recent_returns]) / len(recent_returns)
        std_dev = math.sqrt(variance)
        
        # Annualized volatility (assuming daily data, 365 days for crypto)
        return std_dev * math.sqrt(365) * 100

    def calculate_sma_deviation(self, period: int = 20) -> float:
        """Calculate % deviation from SMA"""
        if len(self.closes) < period:
            return 0.0
            
        sma = sum(self.closes[-period:]) / period
        current_price = self.closes[-1]
        
        return ((current_price - sma) / sma) * 100

    def get_technical_score(self) -> dict:
        """
        Calculate a 0-10 technical score based on indicators.
        Returns detailed breakdown.
        """
        if not self.closes:
            return {"score": 5.0, "details": "No data"}

        rsi = self.calculate_rsi(14)
        volatility = self.calculate_volatility(30)
        sma_dev = self.calculate_sma_deviation(20)
        
        # Scoring Logic (Deterministic)
        score = 5.0
        details = []

        # 1. RSI (30%)
        # Ideal RSI is 40-60 (stable uptrend) or 30 (oversold/buy signal)
        # > 70 is overbought (risk), < 30 is oversold (opportunity)
        if rsi < 30:
            score += 2.0
            details.append(f"RSI Oversold ({rsi:.1f}) - Buy signal")
        elif rsi > 70:
            score -= 1.0
            details.append(f"RSI Overbought ({rsi:.1f}) - risk of correction")
        else:
            # Neutral/Healthy
            score += 0.5
            details.append(f"RSI Neutral ({rsi:.1f})")

        # 2. Volatility (30%)
        # High volatility is risky for short-term locks
        if volatility > 100:
            score -= 2.0
            details.append(f"Extremely High Volatility ({volatility:.0f}%)")
        elif volatility > 60:
            score -= 1.0
            details.append(f"High Volatility ({volatility:.0f}%)")
        elif volatility < 20:
            score -= 1.0
            details.append(f"Low Volatility ({volatility:.0f}%) - Low return potential")
        else:
            score += 1.5
            details.append(f"Healthy Volatility ({volatility:.0f}%)")

        # 3. Trend / SMA (40%)
        if sma_dev > 0:
            score += 1.0
            details.append(f"Price above SMA20 (+{sma_dev:.1f}%)")
            
            if sma_dev > 20:
                score -= 0.5  # Parabolic, risk of mean reversion
                details.append("Price extended too far above SMA")
        else:
            score -= 1.0
            details.append(f"Price below SMA20 ({sma_dev:.1f}%)")

        # Clamp
        final_score = max(0, min(10, score))
        
        return {
            "score": round(final_score, 1),
            "indicators": {
                "rsi": round(rsi, 1),
                "volatility": round(volatility, 1),
                "sma_deviation": round(sma_dev, 1)
            },
            "details": details
        }
