import {
  TokenAnalysis,
  Deal,
  CreateDealRequest,
  TokenSearchResult,
  TokenData,
  DealMetrics,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Analysis endpoints
export async function analyzeToken(
  tokenId: string,
  lockPeriod: number
): Promise<TokenAnalysis> {
  return fetchApi<TokenAnalysis>("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ token_id: tokenId, lock_period: lockPeriod }),
  });
}

// Deal endpoints
export async function getDeals(status?: string): Promise<Deal[]> {
  const url = status ? `/api/deals?status=${status}` : "/api/deals";
  return fetchApi<Deal[]>(url);
}

export async function getDeal(dealId: string): Promise<Deal> {
  return fetchApi<Deal>(`/api/deals/${dealId}`);
}

export async function createDeal(deal: CreateDealRequest): Promise<Deal> {
  return fetchApi<Deal>("/api/deals", {
    method: "POST",
    body: JSON.stringify(deal),
  });
}

export async function acceptDeal(
  dealId: string,
  buyerAddress: string
): Promise<Deal> {
  return fetchApi<Deal>(`/api/deals/${dealId}/accept`, {
    method: "POST",
    body: JSON.stringify({ buyer_address: buyerAddress }),
  });
}

export async function claimDeal(dealId: string): Promise<Deal> {
  return fetchApi<Deal>(`/api/deals/${dealId}/claim`, {
    method: "POST",
  });
}

export async function cancelDeal(
  dealId: string,
  sellerAddress: string
): Promise<Deal> {
  return fetchApi<Deal>(`/api/deals/${dealId}/cancel?seller_address=${sellerAddress}`, {
    method: "POST",
  });
}

// Token endpoints
export async function searchTokens(query: string): Promise<TokenSearchResult[]> {
  return fetchApi<TokenSearchResult[]>(`/api/tokens/search?q=${encodeURIComponent(query)}`);
}

export async function getTrendingTokens(): Promise<TokenSearchResult[]> {
  return fetchApi<TokenSearchResult[]>("/api/tokens/trending");
}

export async function getToken(tokenId: string): Promise<TokenData> {
  return fetchApi<TokenData>(`/api/tokens/${tokenId}`);
}

export async function calculateDealMetrics(
  tokenId: string,
  amount: number,
  discount: number,
  lockPeriod: number
): Promise<{ token: TokenData; metrics: DealMetrics }> {
  return fetchApi(`/api/tokens/${tokenId}/calculate?amount=${amount}&discount=${discount}&lock_period=${lockPeriod}`, {
    method: "POST",
  });
}

export async function getSuggestedDiscount(
  tokenId: string,
  lockPeriod: number,
  riskScore: number
): Promise<{
  token_id: string;
  lock_period: number;
  suggested_discount: number;
  min_recommended: number;
  max_recommended: number;
  reasoning: string;
}> {
  return fetchApi(
    `/api/tokens/${tokenId}/suggest-discount?lock_period=${lockPeriod}&risk_score=${riskScore}`
  );
}
