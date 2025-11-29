# 🚀 Quick Reference Guide - ScholarStream

## Common Commands

### Development

```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check environment
.\check-env.ps1
```

### Contract Development

```powershell
# Navigate to contract directory
cd contract

# Build contract
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Check for issues
cargo clippy

# Back to root
cd ..
```

### Stellar CLI

```powershell
# Add testnet network
stellar network add --global testnet `
  --rpc-url https://soroban-testnet.stellar.org `
  --network-passphrase "Test SDF Network ; September 2015"

# Generate identity
stellar keys generate alice --network testnet

# Get public key
stellar keys address alice

# Deploy contract
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/scholarship_milestone.wasm `
  --source alice `
  --network testnet `
  --alias scholarship_milestone

# Call contract (update progress)
stellar contract invoke `
  --id scholarship_milestone `
  --source alice `
  --network testnet `
  -- update_progress `
  --student GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX `
  --progress 25

# Call contract (get total)
stellar contract invoke `
  --id scholarship_milestone `
  --source alice `
  --network testnet `
  -- get_total_progress

# Call contract (get last student)
stellar contract invoke `
  --id scholarship_milestone `
  --source alice `
  --network testnet `
  -- get_last_student
```

## File Locations

### Contract Files

- **Main Code:** `contract/src/lib.rs`
- **Dependencies:** `contract/Cargo.toml`
- **Compiled WASM:** `contract/target/wasm32-unknown-unknown/release/scholarship_milestone.wasm`

### Frontend Files

- **Connect Page:** `src/pages/index.tsx`
- **Main Page:** `src/pages/main.tsx`
- **Wallet Utils:** `src/utils/wallet.ts`
- **Contract Utils:** `src/utils/contract.ts`
- **Styles:** `src/styles/globals.css`

### Config Files

- **Next.js:** `next.config.js`
- **TypeScript:** `tsconfig.json`
- **Tailwind:** `tailwind.config.ts`
- **Dependencies:** `package.json`

### Documentation

- **Main Docs:** `README.md`
- **Deployment:** `DEPLOYMENT.md`
- **Summary:** `PROJECT_SUMMARY.md`
- **Architecture:** `ARCHITECTURE.md`
- **Checklist:** `CHECKLIST.md`

## Important URLs

### Development

- **Local Server:** http://localhost:3000
- **Connect Page:** http://localhost:3000/
- **Main Page:** http://localhost:3000/main

### Stellar Resources

- **Testnet RPC:** https://soroban-testnet.stellar.org
- **Friendbot (Fund Account):** https://laboratory.stellar.org/#account-creator?network=test
- **Stellar Docs:** https://soroban.stellar.org/
- **Stellar Lab:** https://laboratory.stellar.org/

### Tools

- **Freighter Wallet:** https://freighter.app/
- **Freighter Docs:** https://docs.freighter.app/
- **Stellar SDK:** https://stellar.github.io/js-stellar-sdk/

## Quick Troubleshooting

### "Module not found" errors

```powershell
npm install
```

### Contract build fails

```powershell
rustup target add wasm32-unknown-unknown
rustup update
```

### Transaction fails

- Check contract ID in `src/utils/contract.ts`
- Verify Freighter is on TESTNET
- Check you have testnet XLM

### Freighter not connecting

- Install extension: https://freighter.app/
- Switch to Testnet in Freighter settings
- Refresh the page

### "Insufficient balance"

- Fund account at: https://laboratory.stellar.org/#account-creator?network=test

## Contract Functions Quick Reference

### update_progress

```rust
pub fn update_progress(env: Env, student: Address, progress: u32)
```

- **Purpose:** Record milestone progress
- **Parameters:**
  - `student`: Student's Stellar address
  - `progress`: Progress value (0-100)
- **Effect:**
  - Adds to total_progress
  - Sets last_student

### get_total_progress

```rust
pub fn get_total_progress(env: Env) -> u32
```

- **Purpose:** Get accumulated progress
- **Returns:** Sum of all progress updates
- **Type:** u32

### get_last_student

```rust
pub fn get_last_student(env: Env) -> Option<Address>
```

- **Purpose:** Get last student who submitted
- **Returns:** Last student address or None
- **Type:** Option<Address>

## Frontend Functions Quick Reference

### Wallet Functions (wallet.ts)

```typescript
connectWallet(): Promise<string | null>
// Connects to Freighter, returns public key

disconnectWallet(): void
// Clears wallet connection

getStoredWallet(): string | null
// Gets stored public key from localStorage

checkWalletConnection(): Promise<string | null>
// Verifies wallet is still connected
```

### Contract Functions (contract.ts)

```typescript
updateProgress(
  studentAddress: string,
  progress: number,
  userPublicKey: string
): Promise<string>
// Calls contract to update progress
// Returns transaction hash

getTotalProgress(): Promise<number>
// Reads total progress from contract
// Returns u32 value

getLastStudent(): Promise<string | null>
// Reads last student from contract
// Returns address or null
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ID=YOUR_CONTRACT_ID_HERE
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

## Git Commands

```powershell
# Initialize repo
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: ScholarStream dApp"

# Add remote
git remote add origin <your-repo-url>

# Push
git push -u origin main
```

## Deployment Checklist (Quick)

1. ✅ Run `.\check-env.ps1`
2. ✅ Build contract: `cargo build --target wasm32-unknown-unknown --release`
3. ✅ Deploy contract: `stellar contract deploy ...`
4. ✅ Update CONTRACT_ID in `src/utils/contract.ts`
5. ✅ Install deps: `npm install`
6. ✅ Run dev server: `npm run dev`
7. ✅ Test in browser

## Testing Flow (Quick)

1. Visit http://localhost:3000
2. Click "Connect Freighter Wallet"
3. Approve in Freighter
4. Should redirect to /main
5. Enter student address
6. Enter progress (0-100)
7. Click "Update Milestone"
8. Approve transaction in Freighter
9. Wait for confirmation
10. See updated stats

## Key Addresses

### Default Test Address (for simulation)

```
GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF
```

### Your Addresses

- **Alice (Deployer):** Run `stellar keys address alice`
- **Your Freighter:** Check Freighter extension
- **Contract ID:** From deploy command

## Port Numbers

- **Frontend Dev:** 3000
- **Next.js API (if used):** 3000

## Network Details

- **Network:** Testnet
- **RPC URL:** https://soroban-testnet.stellar.org
- **Passphrase:** "Test SDF Network ; September 2015"
- **Horizon URL:** https://horizon-testnet.stellar.org

## Common Issues & Solutions

| Issue                 | Solution                         |
| --------------------- | -------------------------------- |
| Cannot find module    | `npm install`                    |
| Contract not found    | Check CONTRACT_ID in contract.ts |
| Transaction timeout   | Wait longer, testnet can be slow |
| Build errors          | `rustup update` and retry        |
| Freighter not signing | Check network is Testnet         |
| Insufficient funds    | Visit friendbot to fund account  |

## Logs & Debugging

### Frontend Logs

- Check browser console (F12)
- Look for errors in Network tab
- Check transaction results

### Contract Logs

- Use `cargo test` to run tests
- Check build output for errors
- Use `cargo clippy` for warnings

### Transaction Logs

- Console logs show transaction hash
- Can view on Stellar Explorer
- Check RPC response in network tab

---

## Need More Help?

- 📖 See `README.md` for full documentation
- 🚀 See `DEPLOYMENT.md` for deployment guide
- 📋 See `CHECKLIST.md` for complete checklist
- 🏗️ See `ARCHITECTURE.md` for system design
- 📊 See `PROJECT_SUMMARY.md` for overview
