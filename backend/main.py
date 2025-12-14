import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import analyze, deals, tokens
from database.db import seed_demo_deals

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed demo data
    seed_demo_deals()
    print("✅ Demo deals seeded")
    yield
    # Shutdown: cleanup if needed
    print("👋 Shutting down...")


app = FastAPI(
    title="Rift OTC Module API",
    description="""
    AI-powered token analysis and OTC deal management for Rift.ai.

    ## Features

    - **Token Analysis**: AI-powered scoring for short-term locked OTC deals
    - **Deal Management**: Create, accept, and track OTC deals
    - **Risk Assessment**: Comprehensive risk/reward calculations

    ## How it works

    1. Sellers create deals with tokens, amounts, discounts, and lock periods
    2. AI analyzes deals and provides scores across multiple dimensions
    3. Buyers review AI analysis and accept deals
    4. Tokens are locked in escrow until the lock period ends
    5. Buyers claim tokens after unlock

    This is a prototype that simulates the escrow flow without real blockchain transactions.
    """,
    version="0.1.0",
    lifespan=lifespan
)

# CORS configuration
mapped_origins = []

# 1. Frontend URL from Env (Primary Production Origin)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    mapped_origins.append(frontend_url)

# 2. Additional Origins from Env (Comma separated)
additional_origins = os.getenv("ALLOWED_ORIGINS")
if additional_origins:
    mapped_origins.extend([origin.strip() for origin in additional_origins.split(",")])

# 3. Localhost Fallbacks (Only if explicitly allowed or in debug mode)
# We purposely do NOT auto-add localhost unless specified, to respect "Production First"
# But for convenience during transition, we check a flag or just add common defaults IF list is empty
if not mapped_origins:
    # Default to localhost if nothing configured (Local Dev Mode implicit)
    mapped_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

print(f"🔒 CORS Allowed Origins: {mapped_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=mapped_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(deals.router, prefix="/api", tags=["Deals"])
app.include_router(tokens.router, prefix="/api", tags=["Tokens"])


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Rift OTC Module API",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    """Health check for deployment platforms"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
