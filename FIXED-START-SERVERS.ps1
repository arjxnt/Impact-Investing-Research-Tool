# Fixed Server Startup Script
# This script properly starts both servers with error handling

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Impact Investing Research Tool" -ForegroundColor Cyan
Write-Host "Server Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set project directory
$projectDir = "C:\Users\arjun\OneDrive\Documents\Impact Investing Project"
Set-Location $projectDir

# Check if database exists
Write-Host "Checking database..." -ForegroundColor Yellow
$dbPath = Join-Path $projectDir "backend\impact_investing.db"
if (Test-Path $dbPath) {
    Write-Host "[OK] Database exists" -ForegroundColor Green
} else {
    Write-Host "[INIT] Creating database..." -ForegroundColor Yellow
    Set-Location "$projectDir\backend"
    python init_db.py
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to create database!" -ForegroundColor Red
        exit 1
    }
    Set-Location $projectDir
}

Write-Host ""
Write-Host "Starting servers in separate windows..." -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend (Port 8000)..." -ForegroundColor Yellow
$backendCmd = @"
`$Host.UI.RawUI.WindowTitle = 'Backend Server - Port 8000'
cd '$projectDir\backend'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Backend Server Starting...' -ForegroundColor Cyan
Write-Host 'Port: 8000' -ForegroundColor White
Write-Host 'API Docs: http://localhost:8000/docs' -ForegroundColor White
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
Write-Host ''
Write-Host 'Server stopped. Press any key to close...' -ForegroundColor Yellow
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "Starting Frontend (Port 3000)..." -ForegroundColor Yellow
$frontendCmd = @"
`$Host.UI.RawUI.WindowTitle = 'Frontend Server - Port 3000'
cd '$projectDir\frontend'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Frontend Server Starting...' -ForegroundColor Cyan
Write-Host 'Port: 3000' -ForegroundColor White
Write-Host 'URL: http://localhost:3000' -ForegroundColor White
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
npm run dev
Write-Host ''
Write-Host 'Server stopped. Press any key to close...' -ForegroundColor Yellow
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Servers are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two terminal windows have opened:" -ForegroundColor White
Write-Host "  - Backend Server (Port 8000)" -ForegroundColor Gray
Write-Host "  - Frontend Server (Port 3000)" -ForegroundColor Gray
Write-Host ""
Write-Host "Please wait 15-20 seconds for servers to fully start." -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open your browser and go to:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you see errors in the terminal windows:" -ForegroundColor Yellow
Write-Host "  1. Check for red error messages" -ForegroundColor Gray
Write-Host "  2. Make sure Python and Node.js are installed" -ForegroundColor Gray
Write-Host "  3. Verify dependencies are installed (pip install -r requirements.txt)" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop servers: Close the terminal windows or press Ctrl+C" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this script (servers will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

