# Check Setup Status Script
# Run this to verify your setup is correct

Write-Host "🔍 Checking Real SOL Transfer Setup Status..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green

$allGood = $true

# Check 1: Solana CLI
Write-Host "`n📋 1. Checking Solana CLI..." -ForegroundColor Yellow
try {
    $solanaVersion = solana --version
    Write-Host "   ✅ Solana CLI: $solanaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Solana CLI not found" -ForegroundColor Red
    $allGood = $false
}

# Check 2: Vercel CLI
Write-Host "`n📋 2. Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "   ✅ Vercel CLI: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Vercel CLI not found" -ForegroundColor Red
    $allGood = $false
}

# Check 3: Treasury Wallet
Write-Host "`n📋 3. Checking Treasury Wallet..." -ForegroundColor Yellow
if (Test-Path "treasury-wallet.json") {
    try {
        $walletAddress = solana address --keypair treasury-wallet.json
        $balance = solana balance --keypair treasury-wallet.json
        Write-Host "   ✅ Treasury Wallet: $walletAddress" -ForegroundColor Green
        Write-Host "   💰 Balance: $balance" -ForegroundColor Cyan
        
        if ($balance -eq "0 SOL") {
            Write-Host "   ⚠️  Warning: Treasury wallet has 0 SOL" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Treasury wallet invalid" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ Treasury wallet not found" -ForegroundColor Red
    $allGood = $false
}

# Check 4: Environment File
Write-Host "`n📋 4. Checking Environment File..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $hasPrivateKey = $envContent | Where-Object { $_ -match "^TREASURY_PRIVATE_KEY=" }
    $hasApiKey = $envContent | Where-Object { $_ -match "^API_KEY=" }
    
    if ($hasPrivateKey) {
        Write-Host "   ✅ TREASURY_PRIVATE_KEY found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ TREASURY_PRIVATE_KEY not found" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($hasApiKey) {
        Write-Host "   ✅ API_KEY found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ API_KEY not found" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ .env.local not found" -ForegroundColor Red
    $allGood = $false
}

# Check 5: Vercel Environment Variables
Write-Host "`n📋 5. Checking Vercel Environment Variables..." -ForegroundColor Yellow
try {
    $vercelEnvs = vercel env ls
    $hasTreasuryKey = $vercelEnvs | Where-Object { $_ -match "TREASURY_PRIVATE_KEY" }
    $hasApiKey = $vercelEnvs | Where-Object { $_ -match "API_KEY" }
    
    if ($hasTreasuryKey) {
        Write-Host "   ✅ TREASURY_PRIVATE_KEY set in Vercel" -ForegroundColor Green
    } else {
        Write-Host "   ❌ TREASURY_PRIVATE_KEY not set in Vercel" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($hasApiKey) {
        Write-Host "   ✅ API_KEY set in Vercel" -ForegroundColor Green
    } else {
        Write-Host "   ❌ API_KEY not set in Vercel" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   ⚠️  Could not check Vercel environment variables" -ForegroundColor Yellow
    Write-Host "   💡 Run: vercel env ls" -ForegroundColor Cyan
}

# Check 6: Network Configuration
Write-Host "`n📋 6. Checking Network Configuration..." -ForegroundColor Yellow
try {
    $config = solana config get
    if ($config -match "devnet") {
        Write-Host "   ✅ Network set to devnet" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Network not set to devnet" -ForegroundColor Yellow
        Write-Host "   💡 Run: solana config set --url https://api.devnet.solana.com" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Could not check network configuration" -ForegroundColor Red
    $allGood = $false
}

# Summary
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Green
if ($allGood) {
    Write-Host "🎉 Setup Status: READY FOR REAL TRANSFERS!" -ForegroundColor Green
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Deploy to production: vercel --prod" -ForegroundColor White
    Write-Host "2. Test real transfer in the game" -ForegroundColor White
    Write-Host "3. Check your wallet for real SOL!" -ForegroundColor White
} else {
    Write-Host "❌ Setup Status: INCOMPLETE" -ForegroundColor Red
    Write-Host "`n📋 Fix the issues above, then run:" -ForegroundColor Yellow
    Write-Host "1. .\setup-treasury-wallet.ps1" -ForegroundColor White
    Write-Host "2. .\setup-vercel-env.ps1" -ForegroundColor White
    Write-Host "3. .\check-setup.ps1 (this script)" -ForegroundColor White
}
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green

# Show API Key if available
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $apiKeyLine = $envContent | Where-Object { $_ -match "^API_KEY=" }
    if ($apiKeyLine) {
        $apiKey = $apiKeyLine -replace "^API_KEY=", ""
        Write-Host "`n🔑 Your API Key: $apiKey" -ForegroundColor Cyan
        Write-Host "💡 Use this key when testing real transfers" -ForegroundColor White
    }
}
