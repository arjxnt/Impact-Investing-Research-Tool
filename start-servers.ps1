# Impact Investing Research Tool - Server Startup Script
# This script starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Impact Investing Research Tool" -ForegroundColor Cyan
Write-Host "Starting Servers..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if database exists
Write-Host "Checking database..." -ForegroundColor Yellow
if (Test-Path "backend\impact_investing.db") {
    Write-Host "[OK] Database file exists" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Database not found. Initializing..." -ForegroundColor Yellow
    Set-Location backend
    python init_db.py
    Set-Location ..
}

Write-Host ""
Write-Host "Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Servers are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Please wait 10-15 seconds for servers to fully start." -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open your browser and go to:" -ForegroundColor White
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Other URLs:" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor Gray
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Two terminal windows have opened - one for each server." -ForegroundColor Cyan
Write-Host "Keep these windows open while using the application." -ForegroundColor Cyan
Write-Host "Press Ctrl+C in each window to stop the servers." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

