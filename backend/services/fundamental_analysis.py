
class FundamentalScorer:
    """
    Deterministic Fundamental Analysis Engine.
    Calculates Market Presence Score (0-10).
    Factors: Developer Activity (Github), Community Strength (Socials), Market Rank, Trending Status.
    """

    def __init__(self, token_data: dict, is_trending: bool = False):
        self.token = token_data
        self.is_trending = is_trending
        self.dev_data = token_data.get('developer_data') or {}
        self.comm_data = token_data.get('community_data') or {}

    def _score_developer_activity(self) -> float:
        """
        Score based on Github activity (40% weight).
        Max: 10
        """
        if not self.dev_data:
            return 5.0  # Neutral if no data
            
        commits = self.dev_data.get('commit_count_4_weeks') or 0
        stars = self.dev_data.get('stars') or 0
        
        score = 0
        # Commits
        if commits > 100: score += 5
        elif commits > 30: score += 3
        elif commits > 0: score += 1
        
        # Stars (Trust)
        if stars > 5000: score += 5
        elif stars > 1000: score += 3
        elif stars > 100: score += 1
        
        return min(10.0, float(score))

    def _score_community_strength(self) -> float:
        """
        Score based on social metrics (30% weight).
        Max: 10
        """
        if not self.comm_data:
            return 5.0
            
        twitter = self.comm_data.get('twitter_followers') or 0
        telegram = self.comm_data.get('telegram_channel_user_count') or 0
        
        score = 0
        
        # Twitter Power
        if twitter > 500_000: score += 6
        elif twitter > 100_000: score += 4
        elif twitter > 10_000: score += 2
        elif twitter > 1_000: score += 1
        else: score -= 2  # Ghost town
        
        # Telegram Bonus
        if telegram > 10_000: score += 4
        elif telegram > 2_000: score += 2
        
        return max(0.0, min(10.0, float(score)))

    def _score_market_presence(self) -> float:
        """
        Score based on Rank and Hype (30% weight).
        Max: 10
        """
        rank = self.token.get('market_cap_rank')
        
        if not rank:
            return 2.0
            
        score = 0
        
        # Rank Safety
        if rank <= 20: score = 9.0
        elif rank <= 100: score = 7.0
        elif rank <= 500: score = 5.0
        else: score = 3.0
        
        # Trending Bonus
        if self.is_trending:
            score += 2.0
            
        return min(10.0, score)

    def get_fundamental_score(self) -> dict:
        """
        Calculate total fundamental score.
        """
        dev_score = self._score_developer_activity()
        comm_score = self._score_community_strength()
        market_score = self._score_market_presence()
        
        # Weighted Average
        # Dev: 40%, Comm: 30%, Market: 30%
        final_score = (dev_score * 0.4) + (comm_score * 0.3) + (market_score * 0.3)
        
        details = []
        if self.is_trending:
            details.append("🔥 Trending on CoinGecko (+2 Hype Bonus)")
        if dev_score > 7:
            details.append(f"Strong Development Activity (Score: {dev_score})")
        elif dev_score < 3:
            details.append("Weak Development Activity")
            
        if comm_score > 8:
            details.append("Huge Community Support")
        elif comm_score < 3:
            details.append("Small/Inactive Community")
            
        return {
            "score": round(final_score, 1),
            "components": {
                "dev_score": round(dev_score, 1),
                "community_score": round(comm_score, 1),
                "market_score": round(market_score, 1)
            },
            "details": details
        }
