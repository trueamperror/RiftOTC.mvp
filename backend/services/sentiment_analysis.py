
class SentimentScorer:
    """
    Deterministic Sentiment Analysis Engine.
    Calculates Sentiment Score (0-10).
    Factors: Price Momentum, Market Presence, Trending Status.
    """

    def __init__(self, token_data: dict, is_trending: bool = False):
        self.token = token_data
        self.is_trending = is_trending

    def get_sentiment_score(self) -> dict:
        """
        Calculate a 0-10 sentiment score based on heuristics.
        """
        sentiment = 5.0  # Base score
        details = []

        # 1. Price Momentum (proxy for public mood)
        price_7d = self.token.get('price_change_percentage_7d') or 0
        if price_7d > 10:
            sentiment += 1.5
            details.append(f"Strong 7-day momentum (+{price_7d:.1f}%)")
        elif price_7d > 0:
            sentiment += 0.5
            details.append("Positive weekly momentum")
        elif price_7d < -15:
            sentiment -= 2.0
            details.append(f"High fear / Sell-off ({price_7d:.1f}%)")
        elif price_7d < -5:
            sentiment -= 1.0
            details.append("Negative weekly momentum")

        # 2. Market Rank (proxy for awareness)
        rank = self.token.get('market_cap_rank')
        if rank:
            if rank <= 50:
                sentiment += 1.0
                details.append("High market awareness (Top 50)")
            elif rank > 200:
                sentiment -= 0.5
                details.append("Lower market visibility")

        # 3. Trending Bonus
        if self.is_trending:
            sentiment += 1.5
            details.append("🔥 Trending on CoinGecko (Social Hype)")

        final_score = max(0, min(10, sentiment))

        return {
            "score": round(final_score, 1),
            "details": details
        }
