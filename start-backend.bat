@echo off
echo Starting Impact Investing Research Tool - Backend Server
echo.
cd backend
echo Installing dependencies...
python -m pip install -r requirements.txt
echo.
echo Starting server on http://localhost:8000
echo API docs available at http://localhost:8000/docs
echo.
python -m uvicorn main:app --reload
pause

