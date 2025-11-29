# ScholarStream Quick Setup Script
# Run this script to verify your environment is ready

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ScholarStream Environment Checker" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ $nodeVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Write-Host "  Install from: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -NoNewline
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ v$npmVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check Rust
Write-Host "Checking Rust..." -NoNewline
try {
    $rustVersion = rustc --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ $rustVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Write-Host "  Install from: https://rustup.rs/" -ForegroundColor Yellow
    $allGood = $false
}

# Check Cargo
Write-Host "Checking Cargo..." -NoNewline
try {
    $cargoVersion = cargo --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ $cargoVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check Stellar CLI
Write-Host "Checking Stellar CLI..." -NoNewline
try {
    $stellarVersion = stellar --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ $stellarVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Write-Host "  Install with: cargo install --locked stellar-cli --features opt" -ForegroundColor Yellow
    $allGood = $false
}

# Check wasm32 target
Write-Host "Checking wasm32 target..." -NoNewline
try {
    $targets = rustup target list --installed 2>&1
    if ($targets -match "wasm32-unknown-unknown") {
        Write-Host " ✓ Installed" -ForegroundColor Green
    } else {
        Write-Host " ✗ Not installed" -ForegroundColor Red
        Write-Host "  Install with: rustup target add wasm32-unknown-unknown" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ✗ Cannot check" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✓ All prerequisites met!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. npm install" -ForegroundColor White
    Write-Host "2. cd contract; cargo build --target wasm32-unknown-unknown --release" -ForegroundColor White
    Write-Host "3. See DEPLOYMENT.md for full deployment guide" -ForegroundColor White
} else {
    Write-Host "✗ Some prerequisites are missing" -ForegroundColor Red
    Write-Host "  Please install the missing components above" -ForegroundColor Yellow
}

Write-Host ""
