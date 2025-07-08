Write-Host "🚀 Installing Modular People Portal Dependencies..." -ForegroundColor Green

# Install shell dependencies
Write-Host "📦 Installing Shell dependencies..." -ForegroundColor Yellow
Set-Location shell
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Shell dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install Shell dependencies" -ForegroundColor Red
    exit 1
}

# Install auth-mfe dependencies  
Write-Host "📦 Installing Auth MFE dependencies..." -ForegroundColor Yellow
Set-Location ..\auth-mfe
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auth MFE dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install Auth MFE dependencies" -ForegroundColor Red
    exit 1
}

# Install directory-mfe dependencies
Write-Host "📦 Installing Directory MFE dependencies..." -ForegroundColor Yellow
Set-Location ..\directory-mfe
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Directory MFE dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install Directory MFE dependencies" -ForegroundColor Red
    exit 1
}

# Install memory-game-mfe dependencies
Write-Host "📦 Installing Memory Game MFE dependencies..." -ForegroundColor Yellow
Set-Location ..\memory-game-mfe
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Memory Game MFE dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install Memory Game MFE dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host "🎉 All dependencies installed successfully!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run 'npm run start:all' to start all applications" -ForegroundColor White
Write-Host "   2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "   3. Use demo credentials: username kminchelle, password 0lelplR" -ForegroundColor White
