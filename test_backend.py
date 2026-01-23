"""Quick test script to verify backend is working"""
import requests
import json

try:
    # Test health endpoint
    health = requests.get("http://localhost:8000/api/health", timeout=5)
    print("[OK] Backend is running")
    
    # Test investments endpoint
    investments = requests.get("http://localhost:8000/api/investments", timeout=5)
    inv_data = investments.json()
    print(f"[OK] Investments API: {len(inv_data)} companies")
    
    # Test dashboard endpoint
    dashboard = requests.get("http://localhost:8000/api/portfolio/dashboard", timeout=5)
    dash_data = dashboard.json()
    print(f"[OK] Dashboard API: {dash_data.get('summary', {}).get('total_investments', 0)} investments")
    print(f"  Total Value: ${dash_data.get('summary', {}).get('total_value', 0):,.0f}")
    print(f"  Average ESG: {dash_data.get('summary', {}).get('average_esg_score', 0):.1f}")
    
    print("\n=== BACKEND IS WORKING ===")
    print("All data is available! Refresh your browser now.")
    
except requests.exceptions.ConnectionError:
    print("[ERROR] Backend is NOT running!")
    print("Please start the backend server:")
    print("  cd backend")
    print("  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
except Exception as e:
    print(f"[ERROR] {e}")

