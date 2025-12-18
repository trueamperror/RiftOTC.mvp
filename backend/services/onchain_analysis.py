
class OnChainScorer:
    """
    Deterministic On-Chain Analysis Engine (Proxy for MVP).
    Calculates On-Chain Score (0-10).
    Factors: Volume/MCap Ratio, Holder Distribution Level (Proxy).
    """

    def __init__(self, token_data: dict):
        self.token = token_data

    def get_on_chain_score(self) -> dict:
        """
        Calculate a 0-10 on-chain activity score based on volume and rank proxies.
        """
        score = 5.0
        details = []

        mcap = self.token.get('market_cap') or 0
        volume = self.token.get('total_volume') or 0
        rank = self.token.get('market_cap_rank')

        # 1. Volume Health (Real activity)
        if mcap > 0:
            ratio = volume / mcap
            if ratio > 0.15:
                score += 2.0
                details.append(f"High trading activity (Vol/MCap: {ratio*100:.1f}%)")
            elif ratio > 0.05:
                score += 1.0
                details.append("Healthy on-chain transaction volume")
            elif ratio < 0.01:
                score -= 2.0
                details.append(f"Concerningly low activity (Vol/MCap: {ratio*100:.1f}%)")
        else:
            # New/Low cap token
            if volume > 100_000:
                score += 0.5
            else:
                score -= 1.0

        # 2. Distribution Proxy (Rank)
        # Larger projects typically have more distributed holder bases
        if rank:
            if rank <= 100:
                score += 1.0
                details.append("Likely distributed holder base (Major Cap)")
            elif rank > 500:
                score -= 1.0
                details.append("Risk of holder concentration")

        final_score = max(0, min(10, score))

        return {
            "score": round(final_score, 1),
            "details": details
        }
