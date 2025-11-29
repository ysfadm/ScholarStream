# Scholarship Milestone Smart Contract

A minimal Soroban smart contract for tracking scholarship milestone progress.

## Functions

### `update_progress(student: Address, progress: u32)`

Records milestone progress for a student. Adds progress to the total and updates the last student.

### `get_total_progress() -> u32`

Returns the sum of all progress updates.

### `get_last_student() -> Option<Address>`

Returns the address of the last student who submitted progress.

## Build

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

## Test

```bash
cargo test
```

## Deploy

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/scholarship_milestone.wasm \
  --source alice \
  --network testnet \
  --alias scholarship_milestone
```
