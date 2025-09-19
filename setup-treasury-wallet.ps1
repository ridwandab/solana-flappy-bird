# Setup Treasury Wallet Script for Windows
# Run this script to create and fund a treasury wallet

Write-Host "🚀 Setting up Treasury Wallet for Real SOL Transfer..." -ForegroundColor Green

# Step 1: Check if Solana CLI is installed
Write-Host "`n📋 Step 1: Checking Solana CLI..." -ForegroundColor Yellow
try {
    $solanaVersion = solana --version
    Write-Host "✅ Solana CLI found: $solanaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Solana CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   Download from: https://docs.solana.com/cli/install-solana-cli-tools" -ForegroundColor Cyan
    Write-Host "   Or use: winget install Solana.SolanaCLI" -ForegroundColor Cyan
    exit 1
}

# Step 2: Set network to devnet
Write-Host "`n📋 Step 2: Setting network to devnet..." -ForegroundColor Yellow
solana config set --url https://api.devnet.solana.com
Write-Host "✅ Network set to devnet" -ForegroundColor Green

# Step 3: Generate new treasury wallet
Write-Host "`n📋 Step 3: Generating new treasury wallet..." -ForegroundColor Yellow
$walletPath = "treasury-wallet.json"
if (Test-Path $walletPath) {
    Write-Host "⚠️  Treasury wallet already exists. Backing up..." -ForegroundColor Yellow
    Copy-Item $walletPath "treasury-wallet-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
}

# Generate new keypair
solana-keygen new --outfile $walletPath --no-bip39-passphrase
Write-Host "✅ Treasury wallet created: $walletPath" -ForegroundColor Green

# Step 4: Get wallet address
Write-Host "`n📋 Step 4: Getting wallet address..." -ForegroundColor Yellow
$walletAddress = solana address --keypair $walletPath
Write-Host "✅ Treasury wallet address: $walletAddress" -ForegroundColor Green

# Step 5: Check balance
Write-Host "`n📋 Step 5: Checking wallet balance..." -ForegroundColor Yellow
$balance = solana balance --keypair $walletPath
Write-Host "💰 Current balance: $balance SOL" -ForegroundColor Cyan

# Step 6: Request airdrop if balance is 0
if ($balance -eq "0 SOL") {
    Write-Host "`n📋 Step 6: Requesting airdrop..." -ForegroundColor Yellow
    Write-Host "🔄 Requesting 2 SOL airdrop..." -ForegroundColor Cyan
    solana airdrop 2 --keypair $walletPath
    Start-Sleep -Seconds 5
    $newBalance = solana balance --keypair $walletPath
    Write-Host "✅ New balance: $newBalance SOL" -ForegroundColor Green
} else {
    Write-Host "✅ Wallet already has sufficient balance" -ForegroundColor Green
}

# Step 7: Get private key for environment variable
Write-Host "`n📋 Step 7: Getting private key..." -ForegroundColor Yellow
$privateKeyJson = Get-Content $walletPath | ConvertFrom-Json
$privateKeyArray = $privateKeyJson -join ","
Write-Host "🔑 Private key array: [$privateKeyArray]" -ForegroundColor Cyan

# Step 8: Generate API key
Write-Host "`n📋 Step 8: Generating API key..." -ForegroundColor Yellow
$apiKey = [System.Guid]::NewGuid().ToString("N")
Write-Host "🔐 API Key: $apiKey" -ForegroundColor Cyan

# Step 9: Create environment file
Write-Host "`n📋 Step 9: Creating environment file..." -ForegroundColor Yellow
$envContent = @"
# Real SOL Transfer Configuration
TREASURY_PRIVATE_KEY=[$privateKeyArray]
API_KEY=$apiKey
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ Environment file created: .env.local" -ForegroundColor Green

# Step 10: Summary
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "📁 Treasury Wallet: $walletPath" -ForegroundColor White
Write-Host "📍 Wallet Address: $walletAddress" -ForegroundColor White
Write-Host "💰 Balance: $(solana balance --keypair $walletPath)" -ForegroundColor White
Write-Host "🔑 API Key: $apiKey" -ForegroundColor White
Write-Host "📄 Environment File: .env.local" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Set environment variables in Vercel:" -ForegroundColor White
Write-Host "   vercel env add TREASURY_PRIVATE_KEY" -ForegroundColor Cyan
Write-Host "   vercel env add API_KEY" -ForegroundColor Cyan
Write-Host "2. Deploy to production:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host "3. Test real transfer in the game!" -ForegroundColor White

Write-Host "`n⚠️  Important Security Notes:" -ForegroundColor Red
Write-Host "- Keep your private key secure and never share it" -ForegroundColor White
Write-Host "- Keep your API key secure and never commit it to git" -ForegroundColor White
Write-Host "- This is for devnet only - use mainnet for production" -ForegroundColor White
