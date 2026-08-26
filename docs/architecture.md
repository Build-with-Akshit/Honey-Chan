# Honey Chain — Architecture Document

## System Overview

Honey Chain is a blockchain-based honey traceability and smart beekeeping management system. It combines blockchain (Solidity/Ethereum), IoT sensor monitoring, and AI analytics to provide end-to-end transparency from hive to consumer.

## Core Principles

1. **Blockchain stores hashes, not data** — Only batch IDs, metadata hashes, ownership, and event hashes go on-chain. All large/detailed data lives in PostgreSQL.
2. **Tamper detection via hash comparison** — SHA-256 of off-chain metadata is stored on-chain at creation. Any later modification to the database record produces a different hash → tamper detected.
3. **IoT architecture-agnostic** — The simulator and real ESP32 hardware POST to the same API endpoint. The frontend doesn't know or care which is the data source.
4. **AI predictions are labeled honestly** — All AI outputs are described as "AI-assisted predictions/indicators", not certified diagnoses.
5. **Consumer verification requires no wallet** — The public `/verify/[batchId]` page works without MetaMask.

## Data Flow

```
Beekeeper (MetaMask)
    │
    ├── Creates Hive (Database)
    ├── IoT Simulator/ESP32 → POST /api/iot/readings → Database
    ├── AI Service analyzes readings → Health/Risk/Productivity
    │
    └── Creates Honey Batch
         ├── Metadata → Database
         ├── SHA-256(metadata) → Blockchain (via MetaMask tx)
         │
         └── Supply Chain Flow:
              Beekeeper → Processor → Lab → Distributor → Retailer
              (each transfer = blockchain tx + database event)
              │
              └── QR Code → Consumer scans
                   └── /verify/[batchId]
                        ├── Reads batch from Database
                        ├── Computes SHA-256 of current data
                        ├── Compares with on-chain hash
                        └── Shows VERIFIED ✓ or TAMPER WARNING ⚠️
```

## Smart Contract: HoneyChain.sol

### Roles (OpenZeppelin AccessControl)
- `DEFAULT_ADMIN_ROLE` — Platform admin
- `BEEKEEPER_ROLE` — Creates batches, records hive data
- `PROCESSOR_ROLE` — Receives and processes honey
- `LAB_ROLE` — Submits quality test results
- `DISTRIBUTOR_ROLE` — Distribution logistics
- `RETAILER_ROLE` — Final point of sale

### On-Chain Data
- Batch ID
- Beekeeper address
- Quantity
- Harvest timestamp
- Metadata hash (SHA-256)
- Current owner address
- Status enum
- Quality report hash
- Supply chain event history

### Key Events
- BatchCreated, HarvestRecorded, QualityVerified
- BatchTransferred, ProcessingCompleted, BatchReceived

## Database Schema

All detailed data lives in PostgreSQL via Prisma ORM:
- users, clusters, hives, sensor_readings
- honey_batches, quality_tests, supply_chain_events, ai_predictions

## API Endpoints

| Route | Purpose |
|-------|---------|
| `/api/auth` | Wallet-based auth |
| `/api/users` | User profiles |
| `/api/clusters` | KVIC cluster management |
| `/api/hives` | Hive CRUD |
| `/api/iot` | Sensor readings |
| `/api/batches` | Honey batch management |
| `/api/quality` | Lab test results |
| `/api/supply-chain` | Transfer events |
| `/api/ai` | AI analytics |
| `/api/verify` | Consumer verification |
