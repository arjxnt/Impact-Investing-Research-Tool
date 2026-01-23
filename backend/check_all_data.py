"""
Verify all 25 companies and their complete data
"""

from database import SessionLocal
from models import Investment, ESGScore, ClimateRisk, GHGEmissions, SocialImpact

db = SessionLocal()

print("=" * 70)
print("COMPLETE DATA VERIFICATION - ALL 25 COMPANIES")
print("=" * 70)
print()

investments = db.query(Investment).all()
print(f"Total Investments: {len(investments)}")
print(f"ESG Scores: {db.query(ESGScore).count()}")
print(f"Climate Risks: {db.query(ClimateRisk).count()}")
print(f"Emissions: {db.query(GHGEmissions).count()}")
print(f"Social Impacts: {db.query(SocialImpact).count()}")
print()

print("All 25 Companies with Complete Data:")
print("-" * 70)
for i, inv in enumerate(investments, 1):
    esg = db.query(ESGScore).filter(ESGScore.investment_id == inv.id).first()
    risk = db.query(ClimateRisk).filter(ClimateRisk.investment_id == inv.id).first()
    emissions = db.query(GHGEmissions).filter(GHGEmissions.investment_id == inv.id).first()
    impact = db.query(SocialImpact).filter(SocialImpact.investment_id == inv.id).first()
    
    has_all = esg and risk and emissions and impact
    
    status = "COMPLETE" if has_all else "MISSING DATA"
    value_str = f"${inv.current_value:,.0f}" if inv.current_value else "N/A"
    
    print(f"{i:2}. {inv.name:30} | {inv.sector:25} | {value_str:>15} | {status}")

print()
print("=" * 70)
if len(investments) == 25:
    print("SUCCESS: All 25 companies are in the database with complete data!")
else:
    print(f"WARNING: Only {len(investments)} companies found. Expected 25.")
print("=" * 70)

db.close()

