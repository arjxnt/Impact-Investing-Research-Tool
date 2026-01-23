"""
Quick script to verify all data is present in the database
"""

from database import SessionLocal
from models import Investment, ESGScore, ClimateRisk, GHGEmissions, SocialImpact

db = SessionLocal()

print("=" * 60)
print("DATABASE DATA VERIFICATION")
print("=" * 60)
print()

# Count all records
investments_count = db.query(Investment).count()
esg_count = db.query(ESGScore).count()
climate_count = db.query(ClimateRisk).count()
emissions_count = db.query(GHGEmissions).count()
social_count = db.query(SocialImpact).count()

print(f"Investments: {investments_count}")
print(f"ESG Scores: {esg_count}")
print(f"Climate Risks: {climate_count}")
print(f"Emissions: {emissions_count}")
print(f"Social Impacts: {social_count}")
print()

# Check if all investments have complete data
incomplete = []
for inv in db.query(Investment).all():
    has_esg = db.query(ESGScore).filter(ESGScore.investment_id == inv.id).first() is not None
    has_risk = db.query(ClimateRisk).filter(ClimateRisk.investment_id == inv.id).first() is not None
    has_emissions = db.query(GHGEmissions).filter(GHGEmissions.investment_id == inv.id).first() is not None
    has_impact = db.query(SocialImpact).filter(SocialImpact.investment_id == inv.id).first() is not None
    
    if not (has_esg and has_risk and has_emissions and has_impact):
        incomplete.append({
            'name': inv.name,
            'has_esg': has_esg,
            'has_risk': has_risk,
            'has_emissions': has_emissions,
            'has_impact': has_impact
        })

if incomplete:
    print(f"WARNING: {len(incomplete)} investments missing data:")
    for item in incomplete:
        print(f"  - {item['name']}: ESG={item['has_esg']}, Risk={item['has_risk']}, Emissions={item['has_emissions']}, Impact={item['has_impact']}")
else:
    print("SUCCESS: All investments have complete data!")

print()
print("Sample companies:")
for inv in db.query(Investment).limit(5).all():
    print(f"  - {inv.name} ({inv.sector})")

print()
print("=" * 60)
if investments_count == 25 and esg_count == 25 and climate_count == 25 and emissions_count == 25 and social_count == 25:
    print("SUCCESS: ALL DATA PRESENT - 25 companies with complete records")
else:
    print("WARNING: DATA INCOMPLETE - Run seed_data.py to populate")
print("=" * 60)

db.close()

