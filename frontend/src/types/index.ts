export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_30d?: number;
  ath: number;
  ath_change_percentage: number;
  market_cap_rank?: number;
  image?: string;
}

export interface ScoreBreakdown {
  technical: number;
  risk: number;
  sentiment: number;
  on_chain: number;
  fundamental: number;
  overall: number;
}

export interface ExpectedReturn {
  low: number;
  mid: number;
  high: number;
}

export type Recommendation =
  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "HIGH_RISK"
  | "EXTREME_RISK";

export interface TokenAnalysis {
  token_id: string;
  token_name: string;
  token_symbol: string;
  current_price: number;
  market_cap?: number;
  scores: ScoreBreakdown;
  recommendation: Recommendation;
  expected_return: ExpectedReturn;
  key_risks: string[];
  reasoning: string;
  sparkline_in_7d?: number[];
  price_history_1y?: number[];
  image?: string;
}

export type DealStatus = "open" | "funded" | "completed" | "cancelled";

export interface Deal {
  id: string;
  status: DealStatus;
  seller_address: string;
  buyer_address?: string;
  token_id: string;
  token_symbol: string;
  token_amount: number;
  price_per_token: number;
  discount: number;
  lock_period: number;
  total_cost: number;
  market_value: number;
  created_at: string;
  funded_at?: string;
  unlock_at?: string;
  ai_score?: TokenAnalysis;
}

export interface CreateDealRequest {
  seller_address: string;
  token_id: string;
  token_symbol: string;
  token_amount: number;
  price_per_token: number;
  discount: number;
  lock_period: number;
}

export interface TokenSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
  thumb?: string;
}

export interface DealMetrics {
  market_price: number;
  discounted_price: number;
  discount_pct: number;
  token_amount: number;
  total_cost: number;
  market_value: number;
  instant_equity: number;
  instant_equity_pct: number;
  break_even_drop_pct: number;
  expected_return_pct: number;
  expected_value: number;
  expected_profit: number;
  best_case_return_pct: number;
  best_case_value: number;
  best_case_profit: number;
  worst_case_return_pct: number;
  worst_case_value: number;
  worst_case_loss: number;
  max_loss_50pct_drop: number;
  max_loss_50pct_drop_pct: number;
  risk_reward_ratio: number;
  lock_period_weeks: number;
  lock_risk_factor: number;
  is_favorable: boolean;
  quality_score: number;
}
