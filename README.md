# 🍯 Honey Chain — SIH26021

**Blockchain-based Honey Traceability & Smart Beekeeping Management System**

> A blockchain, AI, and IoT-based digital ecosystem to improve honey authenticity, traceability, productivity, and market credibility for rural beekeepers under KVIC.

## Architecture

```
                    HONEY CHAIN
                         │
           ┌─────────────┼─────────────┐
           │             │             │
       BLOCKCHAIN       IoT           AI
           │             │             │
     Batch Tracking   Hive Data    Analytics
     Ownership        Temp/Hum     Health Score
     Verification     Weight       Risk Detection
     Events           Activity     Prediction
           │             │             │
           └─────────────┼─────────────┘
                         │
                      BACKEND
                         │
               PostgreSQL / Prisma
                         │
                    ┌────┼────┐
                    ▼    ▼    ▼
              Beekeeper Admin Consumer
              Dashboard  Dashboard QR Page
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Blockchain | Solidity + Hardhat + ethers.js + OpenZeppelin |
| Wallet | MetaMask |
| Backend | Node.js + Express + TypeScript + Prisma |
| Database | PostgreSQL |
| AI | Python + FastAPI |
| IoT | Simulator → ESP32 (same API) |

## Project Structure

```
honey-chain/
├── apps/web/          # Next.js frontend
├── blockchain/        # Solidity contracts + Hardhat
├── backend/           # Express API server
├── ai/                # Python FastAPI AI service
├── iot/               # IoT simulator + ESP32
├── database/          # SQL schema reference
└── docs/              # Architecture docs
```

## Quick Start

### 1. Blockchain
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
npx hardhat node                    # Start local blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Frontend
```bash
cd apps/web
npm install
npm run dev
```

### 3. Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### 4. AI Service
```bash
cd ai
pip install -r requirements.txt
python api.py
```

## Demo Scenario

1. Admin registers Ramesh Kumar (Beekeeper) in Sonipat Honey Cluster
2. Ramesh connects MetaMask → Beekeeper Dashboard
3. Creates HIVE-007, IoT data starts streaming
4. AI: Health 91/100, Risk LOW 🟢
5. Harvests 18.5 KG → Creates Batch HC-2026-000127
6. MetaMask confirms → BatchCreated on blockchain
7. Supply chain: Processor → Lab (PASS) → Distributor → Retailer
8. QR code generated → Consumer scans
9. Consumer sees: AUTHENTICITY VERIFIED ✓ + full journey

## License

ISC
