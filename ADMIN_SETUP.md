# Admin Setup Instructions

## 🔐 How to Enable Admin Access

### Step 1: Get Your Wallet Address

1. Open Freighter Wallet extension in your browser
2. Click on your wallet name/icon
3. Click "Copy Address"
4. Your Stellar address will be copied (starts with 'G' - e.g., `GCZB...`)

### Step 2: Add Your Address to Whitelist

1. Open file: `src/config/auth.ts`
2. Find the `ADMIN_ADDRESSES` array
3. Replace `"GCZB..."` with your actual wallet address
4. Example:

```typescript
export const ADMIN_ADDRESSES = [
  "GCZB7QD6PWJXLMXPQGVB6WFHK5PMVCDVL2RQNJ3WFHK5PMVCDVL2RQ", // Your admin address
  "GDXN7EXAMPLE2ADDRESS3HERE4IF5NEEDED6", // Another admin (optional)
];
```

5. Save the file

### Step 3: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test Admin Access

1. Go to http://localhost:3000
2. Click "Continue as Admin"
3. Connect with your Freighter wallet
4. If your address is in the whitelist, you'll see the admin dashboard
5. If not, you'll get an "Access Denied" message

## 🛡️ Security Features

- ✅ **Wallet-based authentication** - No passwords to hack
- ✅ **Admin whitelist** - Only authorized addresses can access admin panel
- ✅ **Role separation** - Students, Donors, and Admins have separate dashboards
- ✅ **Blockchain verification** - All actions are signed with Freighter

## 📋 Admin Dashboard Features

Once you have admin access, you can:

- 📊 View platform statistics (total scholarships, students, donors)
- 📈 Monitor all scholarships across the platform
- 🏆 See student leaderboard
- 💰 Track total funds distributed
- 🔄 Refresh data in real-time

## 🚨 Important Notes

1. **Never commit your wallet address to public repos** if it contains real funds
2. **Test with Testnet addresses** during development
3. **Keep the whitelist updated** - remove addresses when needed
4. **Admin addresses should be secure** - use hardware wallets for production

## 🔧 Troubleshooting

**Problem:** "Access Denied" message even after adding address

- Solution: Make sure you saved `auth.ts` and restarted the dev server

**Problem:** Can't find my wallet address

- Solution: Open Freighter → Click wallet name → Copy Address

**Problem:** Multiple admins needed

- Solution: Add multiple addresses to the `ADMIN_ADDRESSES` array

## 📝 Example Configuration

```typescript
// Multiple admins
export const ADMIN_ADDRESSES = [
  "GCZB7QD6PWJXLMXPQGVB6WFHK5PMVCDVL2RQNJ3WFHK5PMVCDVL2RQ", // Main admin
  "GDXN7EXAMPLE2ADDRESS3HERE4IF5NEEDED6", // Secondary admin
  "GABC123ANOTHER456ADMIN789ADDRESS", // Third admin
];
```

---

Need help? Check the console logs when connecting to see your wallet address!
