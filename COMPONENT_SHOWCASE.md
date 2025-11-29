# 🎨 Component Showcase & Visual Examples

This file shows visual examples of all components and their variants.

## 📊 Components Gallery

### 1. ProgressBar

**Basic Usage:**

```typescript
<ProgressBar current={3} total={5} label="Milestones" />
```

**Variants:**

```typescript
// Small progress
<ProgressBar current={2} total={10} color="blue" />

// With percentage
<ProgressBar current={75} total={100} showPercentage label="Completion" />

// Different colors
<ProgressBar current={5} total={8} color="green" />
<ProgressBar current={3} total={6} color="purple" />
<ProgressBar current={7} total={10} color="orange" />
```

**Props:**

- `current`: number - Current progress value
- `total`: number - Total/max value
- `label?`: string - Optional label text
- `showPercentage?`: boolean - Show percentage (default: true)
- `color?`: 'blue' | 'green' | 'purple' | 'orange' (default: 'green')

---

### 2. StatCard

**Basic Usage:**

```typescript
<StatCard icon="🎓" title="Total Scholarships" value={15} />
```

**Variants:**

```typescript
// With change indicator
<StatCard
  icon="💰"
  title="Total Distributed"
  value="50,000 XLM"
  change={{ value: 20, positive: true }}
  color="green"
/>

// With subtitle
<StatCard
  icon="👥"
  title="Active Students"
  value={250}
  subtitle="This month"
  color="indigo"
/>

// Negative change
<StatCard
  icon="📉"
  title="Pending"
  value={5}
  change={{ value: 10, positive: false }}
  color="orange"
/>
```

**Props:**

- `icon`: string - Emoji or icon character
- `title`: string - Card title
- `value`: string | number - Main value to display
- `subtitle?`: string - Optional subtitle
- `change?`: { value: number, positive: boolean } - Change indicator
- `color?`: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'indigo'

---

### 3. TransactionStatus

**States:**

#### Idle (nothing shown)

```typescript
<TransactionStatus status="idle" />
```

#### Pending

```typescript
<TransactionStatus status="pending" />
```

Shows: Loading spinner + "Transaction Pending" message

#### Success

```typescript
<TransactionStatus status="success" hash="abc123def456..." network="testnet" />
```

Shows: ✅ + "Transaction Successful!" + Stellar Expert link

#### Error

```typescript
<TransactionStatus
  status="error"
  error="Insufficient balance"
  onRetry={handleRetry}
/>
```

Shows: ❌ + Error message + Retry button

**Props:**

- `status`: 'idle' | 'pending' | 'success' | 'error'
- `hash?`: string - Transaction hash (for success state)
- `error?`: string - Error message (for error state)
- `onRetry?`: () => void - Retry callback (for error state)
- `network?`: 'testnet' | 'public' (default: 'testnet')

---

### 4. MilestoneCard

**Incomplete Milestone:**

```typescript
<MilestoneCard
  milestone={{
    id: 1,
    title: "Complete Semester 1",
    description: "Maintain GPA above 3.0",
    required_progress: 25,
    reward_amount: 1000,
    is_completed: false,
  }}
  tokenType="XLM"
  onSubmitProof={(id) => console.log("Submit proof for", id)}
/>
```

**Completed Milestone:**

```typescript
<MilestoneCard
  milestone={{
    id: 2,
    title: "Complete Project",
    required_progress: 50,
    reward_amount: 2000,
    is_completed: true,
    proof_data: "ipfs://QmHash...",
  }}
  tokenType="BRS"
/>
```

**Props:**

- `milestone`: Object with:
  - `id`: number
  - `title`: string
  - `description?`: string
  - `required_progress`: number
  - `reward_amount`: number
  - `is_completed`: boolean
  - `proof_data?`: string
- `tokenType?`: string (default: 'BRS')
- `onSubmitProof?`: (id: number) => void
- `disabled?`: boolean

---

### 5. LoadingSpinner

**Variants:**

```typescript
// Small
<LoadingSpinner size="sm" />

// Medium (default)
<LoadingSpinner size="md" message="Loading..." />

// Large
<LoadingSpinner size="lg" message="Please wait..." />

// Fullscreen
<LoadingSpinner fullScreen message="Loading scholarships..." />
```

**Props:**

- `size?`: 'sm' | 'md' | 'lg' (default: 'md')
- `message?`: string - Optional loading message
- `fullScreen?`: boolean - Cover entire screen (default: false)

---

### 6. ErrorBoundary

**Usage:**

```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}

// Or with custom fallback
<ErrorBoundary fallback={<div>Custom error UI</div>}>
  <YourApp />
</ErrorBoundary>;
```

**What it catches:**

- React render errors
- Component lifecycle errors
- Constructor errors

**What it shows:**

- ⚠️ Warning icon
- Error message
- "Try Again" button
- "Go Home" button

---

## 🎨 Layout Examples

### Dashboard Grid

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard icon="🎓" title="Total" value={10} color="blue" />
  <StatCard icon="✅" title="Active" value={7} color="green" />
  <StatCard icon="⏳" title="Pending" value={2} color="orange" />
  <StatCard icon="🏆" title="Completed" value={1} color="purple" />
</div>
```

### Scholarship List

```typescript
<div className="space-y-4">
  {scholarships.map((s) => (
    <div key={s.id} className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-xl font-bold mb-4">Scholarship #{s.id}</h3>

      <ProgressBar
        current={s.milestonesCompleted}
        total={s.totalMilestones}
        label="Progress"
        color="green"
      />

      <div className="mt-4 space-y-3">
        {s.milestones.map((m) => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            tokenType={s.tokenType}
            onSubmitProof={handleSubmit}
          />
        ))}
      </div>
    </div>
  ))}
</div>
```

### Form with Validation

```typescript
function CreateForm() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validation = validateScholarshipInputs(...);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Submit
    setStatus('pending');
    try {
      const result = await submitTransaction();
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <input type="text" className="w-full px-4 py-2 border rounded" />

      {/* Transaction status */}
      <TransactionStatus
        status={status}
        error={error}
        onRetry={() => setStatus('idle')}
      />

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === 'pending'}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {status === 'pending' ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

---

## 🎯 Real-World Patterns

### Pattern 1: Data Fetching with Loading & Error

```typescript
function ScholarshipList() {
  const { scholarships, loading, error, refetch } = useScholarships(
    address,
    role
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading scholarships..." />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {scholarships.map((s) => (
        <ScholarshipCard key={s.id} data={s} />
      ))}
    </div>
  );
}
```

### Pattern 2: Multi-Step Form

```typescript
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  return (
    <div>
      {/* Progress indicator */}
      <ProgressBar
        current={step}
        total={3}
        label="Form Progress"
        color="blue"
      />

      {/* Step content */}
      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && (
        <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />
      )}
      {step === 3 && <Step3 onBack={() => setStep(2)} />}
    </div>
  );
}
```

### Pattern 3: Dashboard with Stats & Charts

```typescript
function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon="🎓"
          title="Total Scholarships"
          value={stats.total}
          change={{ value: 15, positive: true }}
          color="blue"
        />
        <StatCard
          icon="💰"
          title="Distributed"
          value={`${stats.distributed} XLM`}
          change={{ value: 25, positive: true }}
          color="green"
        />
        <StatCard
          icon="👥"
          title="Students"
          value={stats.students}
          color="purple"
        />
        <StatCard
          icon="✅"
          title="Completion"
          value={`${stats.completion}%`}
          color="orange"
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        {/* Activity list */}
      </div>
    </div>
  );
}
```

---

## 🌈 Color Palette

All components support these color variants:

- **blue** - Primary actions, default
- **green** - Success, positive changes
- **purple** - Special features
- **orange** - Warnings, pending states
- **teal** - Info, secondary actions
- **indigo** - Admin, privileged actions

---

## 📐 Responsive Breakpoints

All components are mobile-first and support Tailwind breakpoints:

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

```typescript
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <StatCard ... />
</div>

// Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl">
  Title
</h1>
```

---

## ✨ Animation & Transitions

All components include smooth transitions:

- Progress bars: 500ms ease-out
- Loading spinners: Continuous rotation
- Hover states: 200ms
- Color changes: 300ms

---

## 🎭 Dark Mode Ready

Components use Tailwind's utility classes and can be adapted for dark mode:

```typescript
<div className="bg-white dark:bg-gray-800">
  <StatCard ... />
</div>
```

---

## 📱 Accessibility

All components include:

- ✅ Semantic HTML
- ✅ Proper ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast (WCAG AA)

---

## 💡 Tips & Tricks

1. **Combine components for powerful UIs**

   ```typescript
   <div className="bg-white rounded-lg p-6 shadow">
     <div className="flex justify-between items-center mb-4">
       <h2>Scholarship #1</h2>
       <TransactionStatus status={status} hash={hash} />
     </div>
     <ProgressBar current={3} total={5} />
     <MilestoneCard ... />
   </div>
   ```

2. **Use loading states everywhere**

   ```typescript
   if (loading) return <LoadingSpinner />;
   ```

3. **Show progress for better UX**

   ```typescript
   <ProgressBar
     current={currentStep}
     total={totalSteps}
     label="Step Progress"
   />
   ```

4. **Always handle errors**
   ```typescript
   <TransactionStatus
     status={error ? "error" : "success"}
     error={error}
     onRetry={handleRetry}
   />
   ```

---

## 🚀 Next Steps

1. Copy these examples into your pages
2. Customize colors and props
3. Combine components for complex UIs
4. Test on mobile devices
5. Add your own variants

Happy building! 🎨
