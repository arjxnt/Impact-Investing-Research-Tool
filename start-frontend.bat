@echo off
echo Starting Impact Investing Research Tool - Frontend Server
echo.
cd frontend
echo Installing dependencies...
call npm install
echo.
echo Starting development server on http://localhost:3000
echo.
call npm run dev
pause

