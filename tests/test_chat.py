
import asyncio
import json
import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', '.env'))

from backend.services.ai_scoring import chat_about_token

# Mock Context (Result of previous analysis)
MOCK_CONTEXT = {
    "token_name": "Solana",
    "token_symbol": "SOL",
    "scores": {
        "technical": 8.0,
        "risk": 2.0,
        "fundamental": 9.5
    },
    "key_risks": [
        "General market volatility"
    ],
    "recommendation": "STRONG_BUY"
}

async def test_chat():
    print("Testing AI Chat...")
    
    question = "Why is the fundamental score so high?"
    print(f"\nQ: {question}")
    
    try:
        answer = await chat_about_token(question, MOCK_CONTEXT)
        print(f"A: {answer}")
        
        if "9.5" in answer or "High" in answer:
            print("✅ Verified: Answer references context.")
        else:
            print("⚠️ Warning: Answer might be generic.")
            
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_chat())
