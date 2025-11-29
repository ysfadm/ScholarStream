# ScholarStream Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Freighter Wallet                       │  │
│  │              (Browser Extension)                         │  │
│  │  • Stores private keys                                   │  │
│  │  • Signs transactions                                    │  │
│  │  • Manages accounts                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ▲                                  │
│                              │ (Sign Tx)                        │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Next.js Frontend (TypeScript)                 │  │
│  │                                                          │  │
│  │  ┌─────────────┐          ┌─────────────┐              │  │
│  │  │ index.tsx   │          │  main.tsx   │              │  │
│  │  │             │──────►   │             │              │  │
│  │  │ - Connect   │          │ - Form      │              │  │
│  │  │   button    │          │ - Display   │              │  │
│  │  │             │          │ - Submit    │              │  │
│  │  └─────────────┘          └─────────────┘              │  │
│  │                                  │                      │  │
│  │                                  ▼                      │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │            Utils Layer                           │  │  │
│  │  │                                                  │  │  │
│  │  │  ┌──────────────┐    ┌────────────────────┐    │  │  │
│  │  │  │ wallet.ts    │    │  contract.ts       │    │  │  │
│  │  │  │              │    │                    │    │  │  │
│  │  │  │ - connect    │    │ - updateProgress   │    │  │  │
│  │  │  │ - disconnect │    │ - getTotalProgress │    │  │  │
│  │  │  │ - check      │    │ - getLastStudent   │    │  │  │
│  │  │  └──────────────┘    └────────────────────┘    │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (HTTPS/RPC)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Stellar Network (Testnet)                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Soroban RPC Server                          │  │
│  │         https://soroban-testnet.stellar.org              │  │
│  │                                                          │  │
│  │  • Receives transactions                                │  │
│  │  • Simulates contract calls                             │  │
│  │  • Returns results                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Smart Contract (WASM)                             │  │
│  │        ID: Cxxxxxxxxxxxxx...                             │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  update_progress(student, progress)                │ │  │
│  │  │    ├─ Add to total_progress                        │ │  │
│  │  │    └─ Set last_student                             │ │  │
│  │  │                                                     │ │  │
│  │  │  get_total_progress()                              │ │  │
│  │  │    └─ Return stored total                          │ │  │
│  │  │                                                     │ │  │
│  │  │  get_last_student()                                │ │  │
│  │  │    └─ Return last student address                  │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │        Persistent Storage                          │ │  │
│  │  │                                                     │ │  │
│  │  │  TotalProgress: u32                                │ │  │
│  │  │  LastStudent: Address                              │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                            DATA FLOW
═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│                    1. WALLET CONNECTION                         │
└─────────────────────────────────────────────────────────────────┘

User clicks "Connect"
    │
    ├─► index.tsx calls wallet.connectWallet()
    │
    ├─► wallet.ts calls Freighter API
    │
    ├─► Freighter prompts user
    │
    ├─► User approves
    │
    ├─► Public key returned
    │
    ├─► Saved to localStorage
    │
    └─► Redirect to /main


┌─────────────────────────────────────────────────────────────────┐
│                  2. LOAD CONTRACT DATA                          │
└─────────────────────────────────────────────────────────────────┘

main.tsx loads
    │
    ├─► Calls getTotalProgress()
    │       │
    │       ├─► contract.ts builds transaction
    │       │
    │       ├─► Simulates call to contract
    │       │
    │       ├─► Returns u32 value
    │       │
    │       └─► Display in UI
    │
    └─► Calls getLastStudent()
            │
            ├─► contract.ts builds transaction
            │
            ├─► Simulates call to contract
            │
            ├─► Returns Option<Address>
            │
            └─► Display in UI


┌─────────────────────────────────────────────────────────────────┐
│                  3. UPDATE PROGRESS                             │
└─────────────────────────────────────────────────────────────────┘

User enters student address + progress
    │
    ├─► User clicks "Update Milestone"
    │
    ├─► main.tsx calls updateProgress()
    │
    ├─► contract.ts builds transaction
    │       │
    │       ├─► Creates Contract instance
    │       │
    │       ├─► Builds operation with params
    │       │
    │       └─► Prepares transaction
    │
    ├─► Calls Freighter signTransaction()
    │       │
    │       ├─► Freighter prompts user
    │       │
    │       ├─► User approves
    │       │
    │       └─► Returns signed XDR
    │
    ├─► Submits to Stellar network
    │       │
    │       ├─► Network processes
    │       │
    │       ├─► Contract executes
    │       │       │
    │       │       ├─► Adds to total_progress
    │       │       │
    │       │       └─► Sets last_student
    │       │
    │       └─► Returns success
    │
    ├─► main.tsx reloads data
    │
    └─► Display updated values


═══════════════════════════════════════════════════════════════════
                      TECHNOLOGY STACK
═══════════════════════════════════════════════════════════════════

Frontend:
    ├─ Next.js 14 ────────────► React framework
    ├─ React 18 ──────────────► UI library
    ├─ TypeScript ────────────► Type safety
    ├─ Tailwind CSS ──────────► Styling
    ├─ Stellar SDK ───────────► Blockchain interaction
    └─ Freighter API ─────────► Wallet integration

Smart Contract:
    ├─ Rust ──────────────────► Programming language
    ├─ Soroban SDK ───────────► Smart contract framework
    └─ WASM ──────────────────► Compilation target

Network:
    ├─ Stellar Testnet ───────► Blockchain network
    └─ Soroban RPC ───────────► API endpoint


═══════════════════════════════════════════════════════════════════
                        FILE STRUCTURE
═══════════════════════════════════════════════════════════════════

ScholarStream/
│
├─ Frontend (Next.js)
│   ├─ src/pages/
│   │   ├─ index.tsx ──────► Login page
│   │   ├─ main.tsx ───────► Dashboard
│   │   └─ _app.tsx ───────► App wrapper
│   │
│   ├─ src/utils/
│   │   ├─ wallet.ts ──────► Freighter integration
│   │   └─ contract.ts ────► Stellar SDK integration
│   │
│   └─ src/styles/
│       └─ globals.css ────► Tailwind styles
│
├─ Smart Contract (Rust)
│   ├─ src/lib.rs ─────────► Contract code
│   └─ Cargo.toml ─────────► Dependencies
│
└─ Configuration
    ├─ package.json ───────► NPM dependencies
    ├─ tsconfig.json ──────► TypeScript config
    └─ tailwind.config.ts ─► Tailwind config
```
