
import asyncio
from backend.services.coingecko import get_token_details

async def inspect_coingecko_data():
    print("Fetching detailed data for 'solana'...")
    data = await get_token_details('solana')
    
    if not data:
        print("Failed to fetch data.")
        return

    print("\n--- Community Data ---")
    print(data.get('community_data'))
    
    print("\n--- Developer Data ---")
    print(data.get('developer_data'))
    
    print("\n--- Public Interest ---")
    print(data.get('public_interest_stats'))

if __name__ == "__main__":
    asyncio.run(inspect_coingecko_data())
