# Install script with retry logic
Write-Host "Installing NFT Ticketing Platform dependencies..." -ForegroundColor Green

$maxRetries = 3
$modules = @("blockchain", "backend", "frontend")

function Install-WithRetry {
    param (
        [string]$Path,
        [string]$Name
    )
    
    $retryCount = 0
    $success = $false
    
    while (-not $success -and $retryCount -lt $maxRetries) {
        Write-Host "`nInstalling $Name (Attempt $($retryCount + 1)/$maxRetries)..." -ForegroundColor Cyan
        
        Push-Location $Path
        
        try {
            npm install --prefer-offline --no-audit --legacy-peer-deps
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ $Name installed successfully!" -ForegroundColor Green
                $success = $true
            } else {
                throw "npm install failed with exit code $LASTEXITCODE"
            }
        }
        catch {
            $retryCount++
            Write-Host "✗ Failed to install $Name. Error: $_" -ForegroundColor Red
            
            if ($retryCount -lt $maxRetries) {
                Write-Host "Retrying in 5 seconds..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
                
                # Clear cache before retry
                npm cache clean --force 2>$null
            }
        }
        finally {
            Pop-Location
        }
    }
    
    return $success
}

# Configure npm for better stability
Write-Host "`nConfiguring npm..." -ForegroundColor Cyan
npm config set fetch-timeout 60000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# Install each module
$failedModules = @()

foreach ($module in $modules) {
    if (Test-Path $module) {
        $success = Install-WithRetry -Path $module -Name $module
        
        if (-not $success) {
            $failedModules += $module
        }
    } else {
        Write-Host "Warning: $module directory not found" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($failedModules.Count -eq 0) {
    Write-Host "✓ All modules installed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. cd blockchain && npm run compile" -ForegroundColor White
    Write-Host "2. Setup .env files in each module" -ForegroundColor White
    Write-Host "3. npm run deploy:mumbai" -ForegroundColor White
} else {
    Write-Host "✗ Failed to install: $($failedModules -join ', ')" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check your internet connection" -ForegroundColor White
    Write-Host "2. Try: npm cache clean --force" -ForegroundColor White
    Write-Host "3. Try: npm config set registry https://registry.npmmirror.com" -ForegroundColor White
    Write-Host "4. Install manually: cd <module> && npm install" -ForegroundColor White
}
Write-Host "========================================`n" -ForegroundColor Cyan
