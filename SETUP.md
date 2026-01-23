# Setup Guide

## Prerequisites

Before running the application, you need to install:

### 1. Python 3.9 or higher
- Download from: https://www.python.org/downloads/
- **Important**: During installation, check "Add Python to PATH"
- Verify installation: Open a new terminal and run `python --version`

### 2. Node.js 18 or higher
- Download from: https://nodejs.org/
- This will also install npm (Node Package Manager)
- Verify installation: Open a new terminal and run `node --version` and `npm --version`

## Installation Steps

### Step 1: Install Backend Dependencies

Open a terminal in the project root and run:

```powershell
cd backend
python -m pip install -r requirements.txt
```

### Step 2: Start Backend Server

```powershell
python -m uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`
API documentation will be available at `http://localhost:8000/docs`

### Step 3: Install Frontend Dependencies

Open a **new terminal** in the project root and run:

```powershell
cd frontend
npm install
```

### Step 4: Start Frontend Development Server

```powershell
npm run dev
```

The frontend will run on `http://localhost:3000`

## Quick Start Scripts

Once prerequisites are installed, you can use the provided scripts:

- **Windows**: Run `start-backend.bat` and `start-frontend.bat` (in separate terminals)
- **Mac/Linux**: Run `./start-backend.sh` and `./start-frontend.sh` (in separate terminals)

## Troubleshooting

### Python not found
- Make sure Python is added to your PATH
- Try using `python3` instead of `python`
- On Windows, you may need to use `py` launcher

### Node.js not found
- Make sure Node.js is installed and added to PATH
- Restart your terminal after installation
- Try using `nodejs` instead of `node` (on some Linux systems)

### Port already in use
- Backend uses port 8000, frontend uses port 3000
- If these are in use, you can change them:
  - Backend: Edit `backend/main.py` and change the port in `uvicorn.run()`
  - Frontend: Edit `frontend/vite.config.ts` and change the port

### Database issues
- The database file (`impact_investing.db`) will be created automatically
- If you encounter database errors, delete the `.db` file and restart the backend

## Verification

After starting both servers:
1. Visit `http://localhost:3000` - You should see the dashboard
2. Visit `http://localhost:8000/docs` - You should see the API documentation
3. The frontend should be able to communicate with the backend

## Next Steps

1. Add your first investment via the API or frontend
2. Create climate risk assessments
3. Record GHG emissions data
4. Assess social impact
5. Generate ESG scores
6. View reports and analytics

