
class RiskScorer:
    """
    Deterministic Risk Analysis Engine.
    Calculates Risk Score (0-10) where 10 = Maximum Risk.
    Factors: Liquidity, Volatility, Dilution (FDV), Lock Period.
    """

    def __init__(self, token_data: dict, volatility: float, lock_period: int):
        """
        token_data: dict from CoinGecko
        volatility: annualized volatility from TechnicalScorer (%)
        lock_period: weeks (1-8)
        """
        self.token = token_data
        self.volatility = volatility
        self.lock_period = lock_period

    def calculate_liquidity_risk(self) -> float:
        """
        Risk based on Volume/MCap ratio.
        Low liquidity (<2%) = High Risk.
        High liquidity (>10%) = Low Risk.
        Returns risk points (0-3.5)
        """
        mcap = self.token.get('market_cap') or 0
        volume = self.token.get('total_volume') or 0

        if mcap <= 0:
            return 3.5  # Max risk if no mcap data

        ratio = volume / mcap

        if ratio < 0.01:      # < 1% daily volume
            return 3.5        # Critical liquidity risk
        elif ratio < 0.05:    # 1-5%
            return 2.0        # Moderate risk
        elif ratio < 0.10:    # 5-10%
            return 1.0        # Low risk
        else:
            return 0.0        # Excellent liquidity

    def calculate_dilution_risk(self) -> float:
        """
        Risk based on FDV/MCap ratio (Inflation overhang).
        Ratio > 10 = Extreme risk of unlocking.
        Ratio ~ 1 = Low risk (fully vested).
        Returns risk points (0-2.0)
        """
        mcap = self.token.get('market_cap') or 0
        fdv = self.token.get('fully_diluted_valuation')
        
        if not fdv or mcap == 0:
            # Fallback: check supply if available
            total = self.token.get('total_supply')
            circ = self.token.get('circulating_supply')
            if total and circ and circ > 0:
                ratio = total / circ
            else:
                return 1.0  # Neutral/Unknown
        else:
            ratio = fdv / mcap

        if ratio > 20:
            return 2.0 # Huge overhang
        elif ratio > 5:
            return 1.5
        elif ratio > 2:
            return 1.0
        else:
            return 0.0 # Mostly vested

    def calculate_volatility_risk(self) -> float:
        """
        Risk based on annualized volatility.
        > 100% = Extreme Risk.
        < 30% = Low Risk.
        Returns risk points (0-3.5)
        """
        if self.volatility > 150:
            return 3.5
        elif self.volatility > 100:
            return 2.5
        elif self.volatility > 60:
            return 1.5
        elif self.volatility > 30:
            return 0.5
        else:
            return 0.0

    def get_risk_score(self) -> dict:
        """
        Calculate total risk score (0-10).
        """
        liq_risk = self.calculate_liquidity_risk()  # Max 3.5
        vol_risk = self.calculate_volatility_risk() # Max 3.5
        dil_risk = self.calculate_dilution_risk()   # Max 2.0
        
        # Base risk
        score = liq_risk + vol_risk + dil_risk
        
        # Lock Period Multiplier (Base + 10-20% depending on weeks)
        # 1 week = 1.0x, 8 weeks = 1.2x risk
        time_multiplier = 1.0 + (self.lock_period * 0.025) 
        score *= time_multiplier

        # Cap at 10
        final_score = min(10.0, score)
        
        # Details for AI
        details = []
        if liq_risk >= 2.0:
            details.append(f"Low Liquidity (Vol/MCap ratio < 5%)")
        if dil_risk >= 1.5:
            details.append(f"High Dilution Risk (FDV >>> MCap)")
        if vol_risk >= 2.5:
            details.append(f"Extreme Volatility ({self.volatility:.0f}%)")
        
        if not details and final_score < 3:
            details.append("Healthy risk profile")

        return {
            "score": round(final_score, 1),
            "components": {
                "liquidity_risk": round(liq_risk, 1),
                "volatility_risk": round(vol_risk, 1),
                "dilution_risk": round(dil_risk, 1)
            },
            "details": details
        }
