import httpx
import time
from typing import Optional

COINGECKO_BASE = "https://api.coingecko.com/api/v3"

# Simple in-memory cache: { "token_id": (data, timestamp) }
TOKEN_CACHE = {}
CACHE_TTL = 60  # seconds


class RateLimitError(Exception):
    pass


async def get_token_data(token_id: str) -> Optional[dict]:
    """Fetch token market data from CoinGecko (with caching)"""
    
    # Check cache
    if token_id in TOKEN_CACHE:
        data, timestamp = TOKEN_CACHE[token_id]
        if time.time() - timestamp < CACHE_TTL:
            return data

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{COINGECKO_BASE}/coins/markets",
                params={
                    "vs_currency": "usd",
                    "ids": token_id,
                    "order": "market_cap_desc",
                    "sparkline": "true",
                    "price_change_percentage": "24h,7d,30d"
                },
                timeout=10.0
            )

            if response.status_code == 429:
                print("CoinGecko API Rate Limit Hit (429). Please wait.")
                raise RateLimitError("CoinGecko Rate Limit")
            
            if response.status_code != 200:
                print(f"CoinGecko Error: {response.status_code}")
                return None

            data = response.json()
            if not data or not isinstance(data, list):
                return None

            token = data[0]
            
            # Fetch additional details (developer/community data)
            # This is slow but necessary for fundamental analysis
            try:
                details = await get_token_details(token_id)
            except Exception as e:
                print(f"Error fetching token details: {e}")
                details = {}
            
            # Ensure details is a dict
            details = details or {}
            
            formatted_data = {
                "id": token["id"],
                "name": token["name"],
                "symbol": token["symbol"],
                "current_price": token.get("current_price", 0),
                "market_cap": token.get("market_cap") or 0,
                "market_cap_rank": token.get("market_cap_rank"),
                "fully_diluted_valuation": token.get("fully_diluted_valuation"),
                "circulating_supply": token.get("circulating_supply"),
                "total_supply": token.get("total_supply"),
                "total_volume": token.get("total_volume") or 0,
                "price_change_percentage_24h": token.get("price_change_percentage_24h") or 0,
                "price_change_percentage_7d": token.get("price_change_percentage_7d_in_currency") or 0,
                "price_change_percentage_30d": token.get("price_change_percentage_30d_in_currency") or 0,
                "ath": token.get("ath") or 0,
                "ath_change_percentage": token.get("ath_change_percentage") or 0,
                "image": token.get("image"),
                "developer_data": details.get("developer_data"),
                "community_data": details.get("community_data"),
                "sparkline_in_7d": token.get("sparkline_in_7d", {}).get("price", [])
            }
            
            # Save to cache
            TOKEN_CACHE[token_id] = (formatted_data, time.time())
            
            return formatted_data
        except RateLimitError:
            raise
        except Exception as e:
            print(f"CoinGecko API error: {e}")
            return None


async def get_token_details(token_id: str) -> Optional[dict]:
    """Fetch detailed token info including description and links"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{COINGECKO_BASE}/coins/{token_id}",
                params={
                    "localization": "false",
                    "tickers": "false",
                    "market_data": "true",
                    "community_data": "true",
                    "developer_data": "true",
                    "sparkline": "true"
                },
                timeout=10.0
            )

            if response.status_code == 429:
                raise RateLimitError("CoinGecko Rate Limit")

            if response.status_code != 200:
                return None

            return response.json()
        except RateLimitError:
            raise
        except Exception as e:
            print(f"CoinGecko API error: {e}")
            return None


async def search_tokens(query: str, limit: int = 10) -> list[dict]:
    """Search for tokens by name or symbol"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{COINGECKO_BASE}/search",
                params={"query": query},
                timeout=10.0
            )

            if response.status_code != 200:
                return []

            data = response.json()
            coins = data.get("coins", [])[:limit]

            return [
                {
                    "id": coin["id"],
                    "name": coin["name"],
                    "symbol": coin["symbol"],
                    "market_cap_rank": coin.get("market_cap_rank"),
                    "thumb": coin.get("thumb")
                }
                for coin in coins
            ]
        except Exception as e:
            print(f"CoinGecko search error: {e}")
            return []


async def get_trending_tokens() -> list[dict]:
    """Get trending tokens"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{COINGECKO_BASE}/search/trending",
                timeout=10.0
            )

            if response.status_code != 200:
                return []

            data = response.json()
            coins = data.get("coins", [])

            return [
                {
                    "id": coin["item"]["id"],
                    "name": coin["item"]["name"],
                    "symbol": coin["item"]["symbol"],
                    "market_cap_rank": coin["item"].get("market_cap_rank"),
                    "thumb": coin["item"].get("thumb")
                }
                for coin in coins[:10]
            ]
        except Exception as e:
            print(f"CoinGecko trending error: {e}")
            return []


async def get_coin_ohlc(token_id: str, days: str = "30") -> list[list[float]]:
    """
    Fetch OHLC (Open, High, Low, Close) data.
    days: 1, 7, 14, 30, 90, 180, 365, max
    Returns list of [timestamp, open, high, low, close]
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{COINGECKO_BASE}/coins/{token_id}/ohlc",
                params={"vs_currency": "usd", "days": days},
                timeout=10.0
            )

            if response.status_code != 200:
                return []

            return response.json()
        except Exception as e:
            print(f"CoinGecko OHLC error: {e}")
            return []
