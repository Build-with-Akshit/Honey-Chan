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
| Full-Stack App | **Next.js App Router** (React UI + Serverless APIs) |
| UI & Styling | Tailwind CSS + TypeScript |
| Blockchain | Solidity + Hardhat + ethers.js + OpenZeppelin |
| Wallet | MetaMask |
| Database | PostgreSQL + Prisma ORM |
| AI | Python + FastAPI |
| IoT | Simulator → ESP32 (HTTP POST to Serverless API) |

## 🚀 Why Next.js Serverless API? (Modern Architecture)
Instead of a traditional monolithic Express.js backend, Honey Chain utilizes the **Next.js App Router** (`apps/web/app/api`).
* **Vercel-Deployment Ready:** APIs deploy as globally distributed serverless functions. Infinite scalability with zero server management.
* **Unified Codebase:** Frontend and backend logic live in one repository, sharing TypeScript types and utilities.
* **Performance:** Reduced network latency between UI and API, and seamless integration with Prisma ORM.

## Project Structure

```
honey-chain/
├── apps/web/          # Next.js App (Frontend + Serverless API Backend)
├── blockchain/        # Solidity contracts + Hardhat
├── ai/                # Python FastAPI AI service
├── iot/               # IoT simulator + ESP32 code
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

### 2. Full-Stack Web App (Frontend + Serverless API)
> **Note:** There is no separate Express `backend/` folder. The Next.js app handles both the UI and backend APIs.

```bash
cd apps/web
npm install
npx prisma generate
npm run dev
```

### 3. AI Service
```bash
cd ai
pip install -r requirements.txt
python api.py
```

## 👥 How to Use Honey Chain (Persona Workflows)

### 1. 🐝 Beekeeper
**Goal:** Manage hives, harvest honey, and initiate sales securely.
1. **Login:** Connect your MetaMask wallet.
2. **Hive Management:** Monitor IoT sensors (Temperature, Humidity, Weight) and view AI predictions on hive health.
3. **Harvesting:** Go to `Batches` > `Harvest & Create Block`. Enter the yield amount to mint a new Batch (e.g. `HC-2026-000127`) on the Blockchain.
4. **Selling (Two-Step Escrow):** Click `Initiate Transfer 📤`, enter the Processor's Wallet Address. This locks the batch on-chain and awaits their acceptance.

### 2. 🏭 Processor & 🚚 Distributor (Supply Chain)
**Goal:** Receive raw honey, process it, and move it down the supply chain.
1. **Receiving Inventory:** Log in with your wallet. You will see an **Incoming Pending Transfer** in your Supply Chain dashboard.
2. **Accept Transfer:** Click **Accept ✅** and sign the MetaMask transaction. The official ownership transfers to you, and the data syncs to your dashboard.
3. **Processing:** (Optional) Add your own supply chain events.
4. **Passing it On:** Click `Initiate Transfer 📤` to send it to the Lab or the next Distributor.

### 3. 🧪 Quality Testing Lab
**Goal:** Ensure the honey meets KVIC standards.
1. **Receive Sample:** Accept the incoming transfer from the Processor.
2. **Quality Testing:** Run tests off-chain, and record the results. (If passed, the batch is marked as `QUALITY_TESTED`).
3. **Transfer:** Initiate transfer to the Distributor/Wholesaler.

### 4. 🏪 Retailer
**Goal:** Finalize the sale to the end consumer.
1. **Stocking:** Accept the transfer from the Wholesaler. The batch is now in the `RETAIL` stage.
2. **Finalizing Sale:** When a consumer buys the product, click **Finalize Sale**. Enter the Consumer's Bill Number.
3. **Locking:** This burns the token's transferability, locking the blockchain record forever as `COMPLETED`.

### 5. 👨‍💻 Developers
**Goal:** Setup, deploy, and maintain the ecosystem.
1. **Smart Contracts:** Modify `HoneyChain.sol`. Run `npx hardhat run scripts/deploy.js --network sepolia` to deploy.
2. **Register Users:** Run `npx hardhat run scripts/register-user.js --network sepolia` to seed MetaMask wallets with roles.
3. **Frontend:** Add features in `apps/web` (Next.js App Router).

### 6. 🛡️ Admin (KVIC)
**Goal:** Oversee the entire ecosystem without tampering.
1. **Global View:** The Admin Dashboard gives a bird's-eye view of all Beekeepers, Processors, and Retailers.
2. **Read-Only Access:** Admins can view the full provenance tree of every batch but **cannot edit** blockchain records, ensuring total decentralization and trust.

### 7. 📱 End Consumer
**Goal:** Verify the authenticity of their purchased honey.
1. **Scan QR:** Scan the QR code on the honey jar using any smartphone.
2. **Traceability:** View the entire journey from the Beekeeper's hive, the Lab test results, and the transaction hashes linking the custody chain!

## License

ISC
