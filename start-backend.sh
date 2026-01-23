#!/bin/bash

echo "Starting Impact Investing Research Tool - Backend Server"
echo ""
cd backend
echo "Installing dependencies..."
python3 -m pip install -r requirements.txt
echo ""
echo "Starting server on http://localhost:8000"
echo "API docs available at http://localhost:8000/docs"
echo ""
python3 -m uvicorn main:app --reload

