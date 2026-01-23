# Installation Guide

## Prerequisites

Before installing dependencies, you need:

### 1. Python 3.9 or higher

**Windows:**
- Download from: https://www.python.org/downloads/
- **Important:** During installation, check "Add Python to PATH"
- Verify: Open a new terminal and run `python --version`

**Mac:**
```bash
brew install python3
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip
```

**Linux (Fedora):**
```bash
sudo dnf install python3 python3-pip
```

### 2. Node.js 18 or higher

**Windows:**
- Download from: https://nodejs.org/
- This will also install npm
- Verify: Open a new terminal and run `node --version` and `npm --version`

**Mac:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install nodejs npm
```

**Linux (Fedora):**
```bash
sudo dnf install nodejs npm
```

## Installing Dependencies

### Automatic Installation (Recommended)

**Windows:**
```cmd
install_dependencies.bat
```

**Mac/Linux:**
```bash
chmod +x install_dependencies.sh
./install_dependencies.sh
```

### Manual Installation

#### Backend Dependencies

```bash
cd backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Or with Python 3:
```bash
cd backend
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
```

#### Frontend Dependencies

```bash
cd frontend
npm install
```

## Verifying Installation

### Check Backend Dependencies

```bash
cd backend
python -m pip list
```

You should see packages like:
- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- etc.

### Check Frontend Dependencies

```bash
cd frontend
npm list --depth=0
```

You should see packages like:
- react
- react-dom
- axios
- recharts
- etc.

## Troubleshooting

### Python not found

**Windows:**
- Reinstall Python and make sure "Add Python to PATH" is checked
- Or manually add Python to PATH:
  1. Find Python installation (usually `C:\Users\YourName\AppData\Local\Programs\Python\Python3XX`)
  2. Add to System Environment Variables PATH

**Mac/Linux:**
- Use `python3` instead of `python`
- Make sure pip is installed: `python3 -m ensurepip --upgrade`

### Node.js not found

**Windows:**
- Reinstall Node.js from nodejs.org
- Restart your terminal after installation

**Mac/Linux:**
- Verify installation: `which node`
- Add to PATH if needed

### pip install fails

**Permission errors (Mac/Linux):**
```bash
# Use --user flag
python3 -m pip install --user -r requirements.txt
```

**SSL errors:**
```bash
# Upgrade pip and try again
python3 -m pip install --upgrade pip
```

**Connection timeouts:**
```bash
# Use a different index or increase timeout
python3 -m pip install --timeout=100 -r requirements.txt
```

### npm install fails

**Permission errors:**
```bash
# Fix npm permissions (Mac/Linux)
sudo chown -R $(whoami) ~/.npm
```

**Network issues:**
```bash
# Clear npm cache
npm cache clean --force
npm install
```

**Node version issues:**
- Make sure you have Node.js 18+ installed
- Check version: `node --version`

## Next Steps

After installing dependencies:

1. **Configure environment variables:**
   ```bash
   cd backend
   python configure_env.py
   ```

2. **Initialize database:**
   ```bash
   cd backend
   python init_db.py
   ```

3. **Start backend server:**
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

4. **Start frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

## Development vs Production

### Development
- Use SQLite (default, no configuration needed)
- Auto-reload enabled
- Debug mode on

### Production
- Use PostgreSQL
- Configure environment variables
- Disable debug mode
- Use production server (gunicorn)

See [SETUP.md](SETUP.md) and [backend/ENV_CONFIGURATION.md](backend/ENV_CONFIGURATION.md) for more details.

