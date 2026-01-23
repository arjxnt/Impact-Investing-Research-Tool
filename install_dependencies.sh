#!/bin/bash

echo "============================================"
echo "Impact Investing Research Tool"
echo "Dependency Installation Script"
echo "============================================"
echo ""

# Check for Python
if command -v python3 &> /dev/null; then
    echo "[OK] Python found"
    python3 --version
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    echo "[OK] Python found"
    python --version
    PYTHON_CMD=python
else
    echo "[ERROR] Python is not installed or not in PATH"
    echo ""
    echo "Please install Python 3.9+ from: https://www.python.org/downloads/"
    echo "Or use your package manager:"
    echo "  - Mac: brew install python3"
    echo "  - Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "  - Fedora: sudo dnf install python3 python3-pip"
    PYTHON_CMD=""
fi

# Install backend dependencies
if [ ! -z "$PYTHON_CMD" ]; then
    echo ""
    echo "============================================"
    echo "Installing Backend Dependencies (Python)"
    echo "============================================"
    cd backend
    
    if [ -f requirements.txt ]; then
        echo "Installing packages from requirements.txt..."
        $PYTHON_CMD -m pip install --upgrade pip
        $PYTHON_CMD -m pip install -r requirements.txt
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "[SUCCESS] Backend dependencies installed!"
        else
            echo ""
            echo "[ERROR] Failed to install backend dependencies"
        fi
    else
        echo "[ERROR] requirements.txt not found"
    fi
    
    cd ..
fi

# Check for Node.js
echo ""
echo "============================================"
echo "Checking Node.js"
echo "============================================"

if command -v node &> /dev/null; then
    echo "[OK] Node.js found"
    node --version
    npm --version
else
    echo "[ERROR] Node.js is not installed or not in PATH"
    echo ""
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    echo "Or use your package manager:"
    echo "  - Mac: brew install node"
    echo "  - Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  - Fedora: sudo dnf install nodejs npm"
    echo ""
    exit 1
fi

# Install frontend dependencies
echo ""
echo "============================================"
echo "Installing Frontend Dependencies (Node.js)"
echo "============================================"
cd frontend

if [ -f package.json ]; then
    echo "Installing packages from package.json..."
    npm install
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "[SUCCESS] Frontend dependencies installed!"
    else
        echo ""
        echo "[ERROR] Failed to install frontend dependencies"
    fi
else
    echo "[ERROR] package.json not found"
fi

cd ..

echo ""
echo "============================================"
echo "Installation Complete"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Configure environment: cd backend && python3 configure_env.py"
echo "2. Initialize database: cd backend && python3 init_db.py"
echo "3. Start backend: cd backend && python3 -m uvicorn main:app --reload"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""

