# Dependency Installation Status

## Current Status

### Python
- **Status:** ⚠️ Windows Store stub detected (not a full installation)
- **Action Required:** Install Python 3.9+ from python.org

### Node.js
- **Status:** ❌ Not found
- **Action Required:** Install Node.js 18+ from nodejs.org

## Quick Installation

### Step 1: Install Python

1. **Download Python:**
   - Visit: https://www.python.org/downloads/
   - Download Python 3.9 or higher for Windows

2. **Install Python:**
   - Run the installer
   - **CRITICAL:** Check "Add Python to PATH" during installation
   - Click "Install Now"

3. **Verify Installation:**
   - Close and reopen your terminal
   - Run: `python --version`
   - Should show: `Python 3.x.x`

### Step 2: Install Node.js

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the LTS version (recommended)

2. **Install Node.js:**
   - Run the installer
   - Follow the installation wizard (default settings are fine)
   - This will also install npm

3. **Verify Installation:**
   - Close and reopen your terminal
   - Run: `node --version` (should show v18.x.x or higher)
   - Run: `npm --version` (should show version number)

### Step 3: Install Dependencies

After installing Python and Node.js:

**Windows:**
```cmd
install_dependencies.bat
```

**Or manually:**
```cmd
cd backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cd ..\frontend
npm install
```

## Troubleshooting

### Python Issues

**"Python was not found" after installation:**
1. Make sure you checked "Add Python to PATH" during installation
2. Restart your terminal completely
3. Try using full path: `C:\Users\YourName\AppData\Local\Programs\Python\Python3XX\python.exe`

**"pip is not recognized":**
```cmd
python -m ensurepip --upgrade
```

**Permission errors:**
```cmd
python -m pip install --user -r requirements.txt
```

### Node.js Issues

**"node is not recognized" after installation:**
1. Restart your terminal completely
2. Verify Node.js is in PATH: Check `C:\Program Files\nodejs\` exists

**npm install fails:**
```cmd
npm cache clean --force
npm install
```

## What Gets Installed

### Backend Dependencies (Python)
- FastAPI - Web framework
- Uvicorn - ASGI server
- SQLAlchemy - Database ORM
- psycopg2-binary - PostgreSQL driver
- Pydantic - Data validation
- And more... (see `backend/requirements.txt`)

### Frontend Dependencies (Node.js)
- React - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Recharts - Data visualization
- Axios - HTTP client
- And more... (see `frontend/package.json`)

## Verification Commands

After installation, verify everything works:

```cmd
# Check Python
python --version
python -m pip list

# Check Node.js
node --version
npm --version
npm list --depth=0
```

## Next Steps After Installation

1. **Configure environment:**
   ```cmd
   cd backend
   python configure_env.py
   ```

2. **Initialize database:**
   ```cmd
   python init_db.py
   ```

3. **Start backend:**
   ```cmd
   python -m uvicorn main:app --reload
   ```

4. **Start frontend (new terminal):**
   ```cmd
   cd frontend
   npm run dev
   ```

## Need Help?

- See [INSTALL_GUIDE.md](INSTALL_GUIDE.md) for detailed instructions
- See [SETUP.md](SETUP.md) for application setup
- Check [backend/ENV_CONFIGURATION.md](backend/ENV_CONFIGURATION.md) for environment variables

