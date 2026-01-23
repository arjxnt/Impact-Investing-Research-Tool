@echo off
echo ============================================
echo Impact Investing Research Tool
echo Dependency Installation Script
echo ============================================
echo.

REM Check for Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo.
    echo Please install Python 3.9+ from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    goto :check_node
) else (
    echo [OK] Python found
    python --version
)

REM Install backend dependencies
echo.
echo ============================================
echo Installing Backend Dependencies (Python)
echo ============================================
cd backend
if exist requirements.txt (
    echo Installing packages from requirements.txt...
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Backend dependencies installed!
    ) else (
        echo.
        echo [ERROR] Failed to install backend dependencies
    )
) else (
    echo [ERROR] requirements.txt not found
)
cd ..

:check_node
echo.
echo ============================================
echo Checking Node.js
echo ============================================

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org/
    echo After installation, restart your terminal and run this script again
    echo.
    goto :end
) else (
    echo [OK] Node.js found
    node --version
    npm --version
)

REM Install frontend dependencies
echo.
echo ============================================
echo Installing Frontend Dependencies (Node.js)
echo ============================================
cd frontend
if exist package.json (
    echo Installing packages from package.json...
    call npm install
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Frontend dependencies installed!
    ) else (
        echo.
        echo [ERROR] Failed to install frontend dependencies
    )
) else (
    echo [ERROR] package.json not found
)
cd ..

:end
echo.
echo ============================================
echo Installation Complete
echo ============================================
echo.
echo Next steps:
echo 1. Configure environment: cd backend ^&^& python configure_env.py
echo 2. Initialize database: cd backend ^&^& python init_db.py
echo 3. Start backend: cd backend ^&^& python -m uvicorn main:app --reload
echo 4. Start frontend: cd frontend ^&^& npm run dev
echo.
pause

