# 2. Deploy to Stellar Testnet

## Setup Summary

Here's what we've accomplished so far:

- Set up our local environment for writing Rust smart contracts
- Installed the `stellar-cli` tool
- Configured `stellar-cli` to communicate with Stellar Testnet via RPC
- Configured an identity to sign transactions

## Hello World

- Created a project called `hello-world`
- Learned how to test and compile the contract

Now we're ready to deploy this contract to **Testnet** and interact with it.

---

## 🚀 Deploy

To deploy the HelloWorld contract, run the following command:

### macOS / Linux

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hello_world.wasm \
  --source alice \
  --network testnet \
  --alias hello_world
```

### Windows (PowerShell)

```powershell
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/hello_world.wasm `
  --source alice `
  --network testnet `
  --alias hello_world
```

This command will return a **contract ID** for you. The ID typically starts with the letter `C`.

> Örnek contract id:
> `CACDYF3CYMJEJTIVFESQYZTN67GO2R5D5IUABTCUG3HXQSRXCSOROBAN`
> (Kendi contract id'niz ile değiştirin.)

### 📝 Note

- The `--alias` flag creates the `.stellar/contract-ids/hello_world.json` file.
- This allows you to reference the contract using the `hello_world` alias instead of the ID.

---
