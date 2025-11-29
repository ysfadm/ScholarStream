# Migration Guide - Using New Components

This guide shows how to update your existing dashboards to use the new production-ready components and utilities.

## 1. Student Dashboard Migration Example

### Before (Old Way):

```typescript
export default function StudentDashboard() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [scholarships, setScholarships] = useState([]);

  useEffect(() => {
    const addr = localStorage.getItem("walletAddress");
    if (addr) {
      setAddress(addr);
      loadData(addr);
    }
  }, []);

  // Manual loading...
  const loadData = async (addr: string) => {
    setLoading(true);
    // ... fetch data
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Manual progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-green-600 h-3 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### After (New Way):

```typescript
import { useApp } from "@/context/AppContext";
import { useScholarships } from "@/hooks/useScholarships";
import { ProgressBar } from "@/components/ProgressBar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MilestoneCard } from "@/components/MilestoneCard";

export default function StudentDashboard() {
  const { publicKey, role, disconnect } = useApp();
  const { scholarships, loading, error, refetch } = useScholarships(
    publicKey,
    role
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading scholarships..." />;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      {/* Using ProgressBar component */}
      <ProgressBar
        current={scholarship.milestonesCompleted}
        total={scholarship.totalMilestones}
        label="Progress"
        color="green"
      />

      {/* Using MilestoneCard component */}
      {milestones.map((m) => (
        <MilestoneCard
          key={m.id}
          milestone={m}
          tokenType={scholarship.tokenType}
          onSubmitProof={handleSubmitProof}
        />
      ))}
    </div>
  );
}
```

## 2. Form Validation Migration

### Before:

```typescript
const handleSubmit = async () => {
  if (!studentAddress) {
    alert("Please enter student address");
    return;
  }

  if (!totalAmount || parseFloat(totalAmount) <= 0) {
    alert("Please enter valid amount");
    return;
  }

  // ... proceed
};
```

### After:

```typescript
import {
  validateStellarAddress,
  validateAmount,
  sanitizeInput,
} from "@/utils/validation";
import { validateScholarshipInputs } from "@/utils/contractHelpers";

const handleSubmit = async () => {
  // Sanitize inputs first
  const cleanAddress = sanitizeInput(studentAddress);

  // Validate comprehensive inputs
  const validation = validateScholarshipInputs(
    cleanAddress,
    parseFloat(totalAmount),
    milestones
  );

  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  // ... proceed
};
```

## 3. Transaction Status Migration

### Before:

```typescript
const [submitting, setSubmitting] = useState(false);
const [txError, setTxError] = useState("");

const handleSubmit = async () => {
  setSubmitting(true);
  setTxError("");

  try {
    // ... transaction
    alert("Success!");
  } catch (err: any) {
    setTxError(err.message);
    alert("Error: " + err.message);
  } finally {
    setSubmitting(false);
  }
};

return (
  <div>
    {submitting && <div>Processing...</div>}
    {txError && <div className="text-red-600">{txError}</div>}
    <button disabled={submitting}>Submit</button>
  </div>
);
```

### After:

```typescript
import { TransactionStatus } from "@/components/TransactionStatus";

const [txStatus, setTxStatus] = useState<
  "idle" | "pending" | "success" | "error"
>("idle");
const [txHash, setTxHash] = useState("");
const [txError, setTxError] = useState("");

const handleSubmit = async () => {
  setTxStatus("pending");

  try {
    const result = await submitTransaction();
    setTxStatus("success");
    setTxHash(result.hash);
  } catch (err: any) {
    setTxStatus("error");
    setTxError(err.message);
  }
};

const handleRetry = () => {
  setTxStatus("idle");
  handleSubmit();
};

return (
  <div>
    <TransactionStatus
      status={txStatus}
      hash={txHash}
      error={txError}
      onRetry={handleRetry}
      network="testnet"
    />
    <button onClick={handleSubmit} disabled={txStatus === "pending"}>
      Submit
    </button>
  </div>
);
```

## 4. Statistics Cards Migration

### Before:

```typescript
<div className="bg-white rounded-xl shadow-lg p-6">
  <div className="text-sm text-gray-600 mb-1">Total Scholarships</div>
  <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
  <div className="text-sm text-gray-600 mt-1">Active</div>
</div>
```

### After:

```typescript
import { StatCard } from "@/components/StatCard";

<StatCard
  icon="🎓"
  title="Total Scholarships"
  value={stats.total}
  subtitle="Active"
  color="blue"
  change={{ value: 15, positive: true }}
/>;
```

## 5. Error Handling Migration

### Before:

```typescript
try {
  const result = await contractCall();
  // ... handle result
} catch (error: any) {
  console.error(error);
  alert(error.message || "An error occurred");
}
```

### After:

```typescript
import { formatErrorMessage } from "@/utils/validation";
import { retryContractCall } from "@/utils/contractHelpers";

try {
  // Automatic retry with backoff
  const result = await retryContractCall(() => contractCall(), {
    maxAttempts: 3,
    delayMs: 1000,
    backoff: true,
  });

  // ... handle result
} catch (error: any) {
  const userMessage = formatErrorMessage(error);
  alert(userMessage); // User-friendly message
  console.error("Original error:", error); // Full error for debugging
}
```

## 6. Address Display Migration

### Before:

```typescript
<p>
  {address.slice(0, 8)}...{address.slice(-8)}
</p>
```

### After:

```typescript
import { truncateAddress } from '@/utils/validation';

<p>{truncateAddress(address)}</p>

// Or custom length
<p>{truncateAddress(address, 6, 6)}</p>
```

## 7. Amount Formatting Migration

### Before:

```typescript
<p>{amount.toLocaleString()} XLM</p>
```

### After:

```typescript
import { formatXLM, stroopsToXLM } from '@/utils/contractHelpers';

<p>{formatXLM(amount)} XLM</p>

// Convert stroops to XLM
<p>{formatXLM(stroopsToXLM(stroops))} XLM</p>
```

## 8. Stellar Expert Links Migration

### Before:

```typescript
<a href={`https://stellar.expert/explorer/testnet/tx/${hash}`} target="_blank">
  View Transaction
</a>
```

### After:

```typescript
import { getStellarExpertUrl } from "@/utils/contractHelpers";

<a
  href={getStellarExpertUrl(hash, "testnet")}
  target="_blank"
  rel="noopener noreferrer"
>
  View Transaction
</a>;
```

## 9. Caching Query Results

### Before:

```typescript
const fetchData = async () => {
  const result = await queryContract(...);
  setData(result);
};

// Fetch on every render
useEffect(() => {
  fetchData();
}, []);
```

### After:

```typescript
import { queryCache } from '@/utils/contractHelpers';

const fetchData = async () => {
  const cacheKey = `scholarship_${id}`;

  // Check cache first
  const cached = queryCache.get(cacheKey);
  if (cached) {
    setData(cached);
    return;
  }

  // Fetch and cache
  const result = await queryContract(...);
  queryCache.set(cacheKey, result);
  setData(result);
};
```

## 10. Debounced Search

### Before:

```typescript
const handleSearch = async (query: string) => {
  const results = await searchScholarships(query);
  setResults(results);
};

<input onChange={(e) => handleSearch(e.target.value)} />;
```

### After:

```typescript
import { debounce } from '@/utils/contractHelpers';

const searchScholarships = async (query: string) => {
  const results = await fetch...;
  setResults(results);
};

// Debounce to reduce API calls
const debouncedSearch = debounce(searchScholarships, 500);

<input onChange={(e) => debouncedSearch(e.target.value)} />
```

## Quick Wins Checklist

- [ ] Replace all loading states with `<LoadingSpinner />`
- [ ] Replace all progress bars with `<ProgressBar />`
- [ ] Replace all stat cards with `<StatCard />`
- [ ] Add input validation with `validation.ts` functions
- [ ] Use `useApp()` hook instead of localStorage directly
- [ ] Use `useScholarships()` for data fetching
- [ ] Add `<TransactionStatus />` for all transactions
- [ ] Use `formatErrorMessage()` for user-friendly errors
- [ ] Implement retry logic with `retryContractCall()`
- [ ] Add caching for repeated queries
- [ ] Wrap app with `<ErrorBoundary />`

## Testing Your Changes

After migration, test:

1. **Connect/Disconnect wallet** - Should persist state
2. **Switch roles** - State should update correctly
3. **Submit forms** - Validation should work
4. **View transactions** - Status should display
5. **Refresh page** - State should restore
6. **Network errors** - Should retry automatically
7. **Invalid inputs** - Should show proper errors

## Need Help?

- Check `PRODUCTION_README.md` for detailed component docs
- See `__tests__/` for usage examples
- Run `npm test` to ensure everything works

Happy coding! 🚀
