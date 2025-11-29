# 🚀 Deployment Guide - ScholarStream

This guide walks you through deploying the ScholarStream dApp to Stellar Testnet.

## Prerequisites Checklist

- [ ] Rust and Cargo installed
- [ ] Stellar CLI installed (`stellar --version`)
- [ ] Node.js 18+ and npm installed
- [ ] Freighter Wallet extension installed in browser

## Step 1: Setup Stellar CLI

### Configure Testnet Network

```powershell
stellar network add --global testnet `
  --rpc-url https://soroban-testnet.stellar.org `
  --network-passphrase "Test SDF Network ; September 2015"
```

### Create Identity

```powershell
# Generate a new identity for deployment
stellar keys generate alice --network testnet

# Get your public key
stellar keys address alice
```

### Fund Your Account

1. Copy your public key from the previous command
2. Visit https://laboratory.stellar.org/#account-creator?network=test
3. Paste your public key and click "Get test network lumens"

## Step 2: Build the Smart Contract

```powershell
# Navigate to contract directory
cd contract

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Optional: Run tests
cargo test
```

The compiled WASM file will be at:
`target/wasm32-unknown-unknown/release/scholarship_milestone.wasm`

## Step 3: Deploy Contract to Testnet

```powershell
# Make sure you're in the contract directory
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/scholarship_milestone.wasm `
  --source alice `
  --network testnet `
  --alias scholarship_milestone
```

**IMPORTANT:** Save the contract ID that is returned! It looks like:

```
CACDYF3CYMJEJTIVFESQYZTN67GO2R5D5IUABTCUG3HXQSRXCSOROBAN
```

## Step 4: Configure Frontend

### Update Contract ID

Open `src/utils/contract.ts` and replace the contract ID:

```typescript
// Line 18
export const CONTRACT_ID = "CABC..."; // Your actual contract ID here
```

### Install Dependencies

```powershell
# Navigate back to root directory
cd ..

# Install npm packages
npm install
```

## Step 5: Test the Contract (Optional)

You can test the contract functions directly via CLI:

### Update Progress

```powershell
stellar contract invoke `
  --id scholarship_milestone `
  --source alice `
  --network testnet `
  -- update_progress `
  --student GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX `
  --progress 25
```

### Get Total Progress

```powershell
stellar contract invoke `
  --id scholarship_milestone `
  --source alice `
  --network testnet `
  -- get_total_progress
```

### Get Last Student

```powershell
stellar contract invoke `
  --id scholarship_milestone `
  --source alice `
  --network testnet `
  -- get_last_student
```

## Step 6: Run the Frontend

```powershell
# Start development server
npm run dev
```

Visit `http://localhost:3000`

## Step 7: Connect and Test

1. Click "Connect Freighter Wallet"
2. Approve the connection in Freighter
3. You'll be redirected to `/main`
4. Enter a student address (can be any valid Stellar address)
5. Enter a progress value (0-100)
6. Click "Update Milestone"
7. Approve the transaction in Freighter
8. Wait for confirmation
9. See updated stats!

## Troubleshooting

### "Insufficient balance" error

Your alice account needs more XLM. Fund it again at the testnet friendbot.

### "Contract not found"

Double-check the CONTRACT_ID in `src/utils/contract.ts` matches your deployed contract.

### Freighter not signing

- Make sure Freighter is set to **Testnet** network
- Check that you have some XLM in your Freighter account

### Build errors

```powershell
# Make sure wasm32 target is installed
rustup target add wasm32-unknown-unknown

# Update Rust
rustup update
```

### Transaction timeout

Testnet can be slow. Wait 30-60 seconds and try again.

## Production Deployment (NOT recommended for this demo)

For mainnet deployment:

1. Change network from `testnet` to `mainnet`
2. Use real XLM (not testnet XLM)
3. Add proper security controls to contract
4. Implement access control
5. Add input validation
6. Test extensively on testnet first
7. Audit the contract code

## Verification

After deployment, verify everything works:

- [ ] Contract deployed successfully
- [ ] Contract ID updated in frontend code
- [ ] Frontend runs without errors (`npm run dev`)
- [ ] Wallet connects via Freighter
- [ ] Can submit progress updates
- [ ] Stats display correctly after update
- [ ] Can disconnect wallet

## Next Steps

Once deployed and tested, you can:

1. Share the localhost URL with team members
2. Deploy frontend to Vercel/Netlify (update contract to use mainnet)
3. Add more features as needed
4. Extend contract functionality

---

**Need help?** Check the main README.md or Stellar documentation.
