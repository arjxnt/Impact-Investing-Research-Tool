# Test script to diagnose server startup issues
Write-Host "=== DIAGNOSTIC TEST ===" -ForegroundColor Cyan
Write-Host ""

# Test Python
Write-Host "Testing Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python not found!" -ForegroundColor Red
    exit 1
}

# Test Node
Write-Host "Testing Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    exit 1
}

# Test Backend Dependencies
Write-Host "Testing Backend Dependencies..." -ForegroundColor Yellow
Set-Location "backend"
try {
    python -c "import fastapi, uvicorn, sqlalchemy; print('[OK] Backend dependencies installed')" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Backend dependencies missing! Run: pip install -r requirements.txt" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Failed to test backend dependencies" -ForegroundColor Red
}

# Test Database
Write-Host "Testing Database..." -ForegroundColor Yellow
try {
    python -c "from database import engine; engine.connect(); print('[OK] Database connection works')" 2>&1
} catch {
    Write-Host "[WARNING] Database issue: $_" -ForegroundColor Yellow
    Write-Host "Initializing database..." -ForegroundColor Yellow
    python init_db.py
}

# Test Frontend Dependencies
Write-Host "Testing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location "..\frontend"
if (Test-Path "node_modules") {
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Frontend dependencies not installed. Run: npm install" -ForegroundColor Yellow
}

Set-Location ".."
Write-Host ""
Write-Host "=== STARTING SERVERS ===" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendScript = @"
cd 'C:\Users\arjun\OneDrive\Documents\Impact Investing Project\backend'
Write-Host 'Backend Server Starting...' -ForegroundColor Cyan
Write-Host 'If you see errors below, please share them' -ForegroundColor Yellow
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendScript = @"
cd 'C:\Users\arjun\OneDrive\Documents\Impact Investing Project\frontend'
Write-Host 'Frontend Server Starting...' -ForegroundColor Cyan
Write-Host 'If you see errors below, please share them' -ForegroundColor Yellow
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "=== SERVERS STARTING ===" -ForegroundColor Green
Write-Host "Two terminal windows have opened." -ForegroundColor White
Write-Host "Please check them for any error messages." -ForegroundColor White
Write-Host ""
Write-Host "Wait 15 seconds, then try: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you see errors in the terminal windows, please share them!" -ForegroundColor Cyan

