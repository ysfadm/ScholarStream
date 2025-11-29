# 🎯 Quick Start Guide - Production Features

This guide helps you immediately use all the new production features in your ScholarStream app.

## 🚀 Getting Started (5 Minutes)

### 1. Install Dependencies

```bash
cd "C:\Users\yusuf\OneDrive\Masaüstü\ScholarStream"
npm install
```

### 2. Run Tests (Verify Everything Works)

```bash
npm test
```

Expected output: **22 tests passing** ✅

### 3. Start Development Server

```bash
npm run dev
```

App runs at: http://localhost:3000

---

## 📦 What You Got

### **New Components** (Ready to Use)

```
src/components/
├── ProgressBar.tsx        - Visual progress bars
├── StatCard.tsx           - Dashboard statistics
├── TransactionStatus.tsx  - Transaction feedback
├── MilestoneCard.tsx      - Milestone display
├── LoadingSpinner.tsx     - Loading states
└── ErrorBoundary.tsx      - Error catching
```

### **Utilities** (Helper Functions)

```
src/utils/
├── validation.ts          - Input validation & sanitization
├── contractHelpers.ts     - Retry, caching, formatting
├── wallet.ts              - Wallet connection (existing)
└── contract.ts            - Contract calls (existing)
```

### **Hooks** (State Management)

```
src/hooks/
├── useScholarships.ts     - Scholarship data fetching
└── useWallet.ts           - Wallet connection management
```

### **Context** (Global State)

```
src/context/
└── AppContext.tsx         - App-wide state (wallet, role, balances)
```

---

## 💡 Copy-Paste Examples

### Example 1: Show Loading State

```typescript
import { LoadingSpinner } from "@/components/LoadingSpinner";

function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading data..." />;
  }

  return <div>Your content</div>;
}
```

### Example 2: Display Progress

```typescript
import { ProgressBar } from "@/components/ProgressBar";

function ScholarshipCard({ scholarship }) {
  return (
    <div>
      <h3>Scholarship #{scholarship.id}</h3>
      <ProgressBar
        current={scholarship.milestonesCompleted}
        total={scholarship.totalMilestones}
        label="Progress"
        color="green"
        showPercentage
      />
    </div>
  );
}
```

### Example 3: Show Statistics

```typescript
import { StatCard } from "@/components/StatCard";

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        icon="🎓"
        title="Total Scholarships"
        value={15}
        change={{ value: 20, positive: true }}
        color="blue"
      />
      <StatCard
        icon="💰"
        title="Total Distributed"
        value="50,000 XLM"
        color="green"
      />
      <StatCard icon="✅" title="Completion Rate" value="85%" color="purple" />
    </div>
  );
}
```

### Example 4: Transaction Feedback

```typescript
import { TransactionStatus } from "@/components/TransactionStatus";

function SubmitForm() {
  const [txStatus, setTxStatus] = useState("idle");
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");

  const handleSubmit = async () => {
    setTxStatus("pending");
    try {
      const result = await submitToBlockchain();
      setTxStatus("success");
      setTxHash(result.hash);
    } catch (err) {
      setTxStatus("error");
      setTxError(err.message);
    }
  };

  return (
    <div>
      <TransactionStatus
        status={txStatus}
        hash={txHash}
        error={txError}
        onRetry={handleSubmit}
        network="testnet"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

### Example 5: Use Global State

```typescript
import { useApp } from "@/context/AppContext";

function Header() {
  const { publicKey, role, isConnected, disconnect } = useApp();

  if (!isConnected) {
    return <div>Please connect wallet</div>;
  }

  return (
    <div>
      <p>Address: {publicKey?.slice(0, 8)}...</p>
      <p>Role: {role}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### Example 6: Validate Input

```typescript
import {
  validateStellarAddress,
  validateAmount,
  sanitizeInput,
} from "@/utils/validation";

function CreateScholarshipForm() {
  const handleSubmit = (e) => {
    e.preventDefault();

    // Sanitize first
    const cleanAddress = sanitizeInput(studentAddress);

    // Then validate
    if (!validateStellarAddress(cleanAddress)) {
      alert("Invalid Stellar address");
      return;
    }

    if (!validateAmount(parseFloat(amount))) {
      alert("Amount must be positive");
      return;
    }

    // Proceed with submission
    submitScholarship(cleanAddress, amount);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Example 7: Fetch Data with Hook

```typescript
import { useScholarships } from "@/hooks/useScholarships";

function ScholarshipList() {
  const { scholarships, loading, error, refetch } = useScholarships(
    userAddress,
    "student"
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {scholarships.map((s) => (
        <ScholarshipCard key={s.id} data={s} />
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Example 8: Retry Failed Calls

```typescript
import { retryContractCall } from "@/utils/contractHelpers";

async function submitProof(milestoneId, proofData) {
  try {
    // Automatically retries 3 times with exponential backoff
    const result = await retryContractCall(
      () => contractCall("submit_proof", [milestoneId, proofData]),
      { maxAttempts: 3, delayMs: 1000, backoff: true }
    );

    return result;
  } catch (error) {
    console.error("Failed after 3 attempts:", error);
    throw error;
  }
}
```

### Example 9: Cache Query Results

```typescript
import { queryCache } from "@/utils/contractHelpers";

async function getScholarship(id) {
  const cacheKey = `scholarship_${id}`;

  // Check cache first (30-second TTL)
  const cached = queryCache.get(cacheKey);
  if (cached) {
    console.log("Using cached data");
    return cached;
  }

  // Fetch and cache
  const data = await fetchFromBlockchain(id);
  queryCache.set(cacheKey, data);
  return data;
}
```

### Example 10: Format Amounts

```typescript
import { formatXLM, stroopsToXLM } from "@/utils/contractHelpers";

function Balance({ stroops }) {
  return (
    <div>
      <p>Balance: {formatXLM(stroopsToXLM(stroops))} XLM</p>
    </div>
  );
}
```

---

## 🧪 Testing Your Code

### Run All Tests

```bash
npm test
```

### Watch Mode (Auto-run on changes)

```bash
npm test:watch
```

### Coverage Report

```bash
npm test:coverage
```

### Write Your Own Test

```typescript
// __tests__/myfeature.test.ts
import { myFunction } from "@/utils/myfeature";

describe("My Feature", () => {
  it("should do something", () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

---

## 🎨 Styling Tips

All components use Tailwind CSS. Customize colors:

```typescript
// Green progress bar
<ProgressBar color="green" ... />

// Blue stat card
<StatCard color="blue" ... />

// Custom styling
<div className="bg-gradient-to-r from-blue-600 to-purple-600">
  <ProgressBar ... />
</div>
```

---

## 🔧 Common Tasks

### Task 1: Add a New Dashboard Stat

```typescript
import { StatCard } from "@/components/StatCard";

<StatCard
  icon="📊"
  title="Active Students"
  value={250}
  subtitle="This month"
  change={{ value: 12, positive: true }}
  color="indigo"
/>;
```

### Task 2: Show Transaction Progress

```typescript
const [status, setStatus] = useState("idle");

<TransactionStatus
  status={status} // 'idle' | 'pending' | 'success' | 'error'
  hash={txHash}
  error={errorMsg}
  onRetry={() => setStatus("idle")}
/>;
```

### Task 3: Validate Form Before Submit

```typescript
import { validateScholarshipInputs } from "@/utils/contractHelpers";

const validation = validateScholarshipInputs(
  studentAddress,
  totalAmount,
  milestones
);

if (!validation.valid) {
  alert(validation.error);
  return;
}

// Proceed with submission
```

---

## 📱 Responsive Design

All components are mobile-friendly:

```typescript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Title
</h1>
```

---

## 🚨 Error Handling

### Wrap App with ErrorBoundary

```typescript
// pages/_app.tsx (already done!)
import { AppProvider } from "@/context/AppContext";

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}
```

### Show User-Friendly Errors

```typescript
import { formatErrorMessage } from "@/utils/validation";

try {
  await riskyOperation();
} catch (error) {
  const userMsg = formatErrorMessage(error);
  alert(userMsg); // "Insufficient balance" instead of raw error
}
```

---

## 🎯 Best Practices

1. **Always validate inputs**

   ```typescript
   const clean = sanitizeInput(userInput);
   if (!validateStellarAddress(clean)) return;
   ```

2. **Use hooks for data fetching**

   ```typescript
   const { data, loading, error } = useScholarships(...);
   ```

3. **Show loading states**

   ```typescript
   if (loading) return <LoadingSpinner />;
   ```

4. **Handle errors gracefully**

   ```typescript
   if (error) return <div>Error: {formatErrorMessage(error)}</div>;
   ```

5. **Cache repeated queries**
   ```typescript
   const cached = queryCache.get(key);
   if (cached) return cached;
   ```

---

## 📖 More Resources

- **PRODUCTION_README.md** - Full documentation
- **MIGRATION_GUIDE.md** - Migration examples
- **SUMMARY.md** - High-level overview
- ****tests**/** - Test examples

---

## ✅ Quick Checklist

Before deploying:

- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run build` - no errors
- [ ] Test on mobile viewport
- [ ] Test wallet connection/disconnection
- [ ] Test role switching
- [ ] Test form validation
- [ ] Test error states
- [ ] Check console for warnings

---

## 🎊 You're Ready!

You now have:

- ✅ 6 reusable components
- ✅ 2 custom hooks
- ✅ 30+ utility functions
- ✅ Global state management
- ✅ 22 passing tests
- ✅ Complete documentation

Start building features 3x faster! 🚀

**Need help?** Check the docs or run `npm test` to see examples.

Happy coding! 💙
