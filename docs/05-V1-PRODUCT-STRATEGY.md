# Rift OTC Module - V1 Product Strategy

This document outlines the core strategy for the Investor OTC Module (V1), aligning the current MVP implementation with a roadmap for a fully functional production release.

---

## 1. Core V1 Features

To create an MVP that differentiates Rift OTC in a crowded market, V1 focuses on **AI-augmented decision making** rather than just simple order matching.

### **Feature A: AI-Powered Due Diligence (The "Rift Analyzer")**
*Differentiation*: Instant, deep-dive analysis of tokens to help investors make safe OTC decisions in seconds, not hours.

### **Feature B: Smart OTC Deal Creation**
*Core Utility*: A seamless flow for sellers to list tokens with flexible lock periods (1-8 weeks) and automated discount suggestions.

### **Feature C: Interactive Investment Assistant**
*Engagement*: A context-aware Chat AI that answers investor questions (" Is this high risk?", "Why is the sentiment low?") specifically about the deal at hand.

### **Feature D: Secure Escrow Settlement**
*Trust*: Trustless exchange of assets (USDC for Token) governed by smart contracts, enforcing the lock periods defined in the deal.

---

## 2. Product Decomposition

### **Feature A: AI-Powered Due Diligence**
-   **User Story**: "As an investor, I want to know if a 20% discount on Token X is a good deal or a trap, without reading whitepapers for 3 hours."
-   **Key Components**:
    -   **Multi-Dimensional Scoring**: Technical (RSI, Volatility), Fundamental (FDV, Revenue), and Sentiment (Social Volume) analysis.
    -   **Risk Recommendation Engine**: Clear "Buy/Hold/Pass" badges (e.g., "HIGH_RISK", "STRONG_BUY").
    -   **Visual Data**: Interactive 1-year price charts with lock-period overlays.

### **Feature B: Smart OTC Deal Creation**
-   **User Story**: "As a seller (e.g., a team or whale), I want to sell $50k of tokens quickly without crashing the market price."
-   **Key Components**:
    -   **Discount Slider**: Visual tool to set price based on lock length.
    -   **AI Pricing Oracle**: Suggests the optimal discount (e.g., "Market expects 15% discount for 4-week lock").
    -   **Success Feedback**: Gamified "Deal Deployed" confirmation to reassure the seller.

### **Feature C: Interactive Investment Assistant**
-   **User Story**: "As a beginner, I see a low 'Fundamental Score' and want to ask why before I invest."
-   **Key Components**:
    -   **Context-Aware Chat**: The AI knows *exactly* which token is being viewed.
    -   **Educational Mode**: Explains complex terms (e.g., "FDV", "Liquidity Depth") in simple language.
    -   **Prompt Library**: One-click questions (e.g., "Explain the risks").

---

## 3. Technical Decomposition

### **Stack Overview**
-   **Frontend**: Next.js 15 (React), Tailwind CSS v4, shadcn/ui.
-   **Backend**: FastAPI (Python 3.11), Pydantic v2.
-   **AI Layer**: OpenAI GPT-4o (JSON Mode).
-   **Blockchain**: Solana (or EVM), Smart Contracts.

### **Feature Breakdown & Acceleration Strategy**

#### **A. AI Analyzer Engine**
-   **Tech Specs**: Async Python tasks fetching data from CoinGecko + OpenAI analysis chain.
-   **Acceleration SDKs**:
    -   **`guidance` / `instructor`**: For strictly typed JSON outputs from LLMs (prevents hallucinations).
    -   **`ccxt`**: Unified crypto trading API for fetching extensive market data.
    -   **`redis`**: Caching layer to avoid expensive API re-calls (reduce costs/latency).

#### **B. Frontend & CyberUI**
-   **Tech Specs**: High-performance React components with GPU-accelerated animations (`framer-motion`).
-   **Acceleration SDKs**:
    -   **`shadcn/ui`**: Copy-paste accessible component library (speed up UI dev by 50%).
    -   **`recharts`**: React wrapper for D3.js to build interactive price charts quickly.
    -   **`lucide-react`**: Ready-to-use scalable vector icons.

#### **C. Web3 Integration (Escrow)**
-   **Tech Specs**: Wallet connection and contract interaction.
-   **Acceleration SDKs**:
    -   **`RainbowKit`** (or Solana Adapter): Instant "Connect Wallet" UI with support for all major wallets.
    -   **`wagmi` / `viem`**: Type-safe hooks for interacting with Ethereum compatible chains.
    -   **`anchor`** (if Solana): Framework to speed up secure smart contract development.

---

## 4. Team Requirements

To deliver the V1 Product (moving from MVP to Production), the following team structure is recommended.

### **Squad: "Core Platform" (4-5 Members)**

| Role | Count | Responsibilities |
|------|-------|------------------|
| **Senior Frontend Engineer** | 1 | React/Next.js architecture, "CyberUI" implementation, Web3 state management (Wallet integration). |
| **Backend/AI Engineer** | 1 | Python/FastAPI, LLM prompt engineering, Data pipeline optimization (CoinGecko/On-chain data). |
| **Smart Contract Engineer** | 1 | **Critical**. Writing secure Escrow contracts (Solidity/Rust), Auditing, Gas optimization. |
| **Product Designer** | 0.5 - 1 | UI/UX high-fidelity designs (Figma), maintaining the "Cyberpunk" aesthetic key to brand identity. |
| **QA / Tester** | 0.5 | Automated testing (Playwright), Smart contract integration testing. |

### **Rationale**
-   **1 Backend vs. 1 Contract**: The logic is heavy on off-chain AI analysis (Backend) and on-chain settlement (Contract). These are distinct, specialized skill sets.
-   **Designer Importance**: In Web3, trust is tied to visual quality. A specialized designer is needed to maintain the "Premium/Cyber" look established in the MVP.
