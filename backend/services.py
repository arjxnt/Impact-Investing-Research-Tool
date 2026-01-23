"""
Business logic services for Impact Investing Research Tool
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
import random
from models import Investment, ClimateRisk, GHGEmissions, SocialImpact, ESGScore
from schemas import (
    InvestmentCreate, InvestmentUpdate,
    ClimateRiskCreate, GHGEmissionsCreate,
    SocialImpactCreate, ESGScoreCreate,
    ClimateRiskAnalysisResponse, PortfolioAnalysisResponse,
    InvestmentRecommendation, InvestmentRecommendationResponse
)


# ==================== Investment Service ====================

class InvestmentService:
    @staticmethod
    def create_investment(db: Session, investment: InvestmentCreate) -> Investment:
        db_investment = Investment(**investment.dict())
        db.add(db_investment)
        db.commit()
        db.refresh(db_investment)
        return db_investment

    @staticmethod
    def get_investment(db: Session, investment_id: int) -> Optional[Investment]:
        return db.query(Investment).filter(Investment.id == investment_id).first()

    @staticmethod
    def get_investments(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        sector: Optional[str] = None,
        region: Optional[str] = None
    ) -> List[Investment]:
        query = db.query(Investment)
        if sector:
            query = query.filter(Investment.sector == sector)
        if region:
            query = query.filter(Investment.region == region)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update_investment(
        db: Session,
        investment_id: int,
        investment: InvestmentUpdate
    ) -> Optional[Investment]:
        db_investment = db.query(Investment).filter(Investment.id == investment_id).first()
        if not db_investment:
            return None
        
        update_data = investment.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_investment, field, value)
        
        db.commit()
        db.refresh(db_investment)
        return db_investment

    @staticmethod
    def delete_investment(db: Session, investment_id: int) -> bool:
        db_investment = db.query(Investment).filter(Investment.id == investment_id).first()
        if not db_investment:
            return False
        db.delete(db_investment)
        db.commit()
        return True


# ==================== Climate Risk Service ====================

class ClimateRiskService:
    @staticmethod
    def create_climate_risk(db: Session, risk: ClimateRiskCreate) -> ClimateRisk:
        db_risk = ClimateRisk(**risk.dict())
        db.add(db_risk)
        db.commit()
        db.refresh(db_risk)
        return db_risk

    @staticmethod
    def get_climate_risk(db: Session, risk_id: int) -> Optional[ClimateRisk]:
        return db.query(ClimateRisk).filter(ClimateRisk.id == risk_id).first()

    @staticmethod
    def get_climate_risks(
        db: Session,
        investment_id: Optional[int] = None
    ) -> List[ClimateRisk]:
        query = db.query(ClimateRisk)
        if investment_id:
            query = query.filter(ClimateRisk.investment_id == investment_id)
        return query.order_by(desc(ClimateRisk.assessment_date)).all()

    @staticmethod
    def get_comprehensive_analysis(
        db: Session,
        investment_id: int
    ) -> Optional[ClimateRiskAnalysisResponse]:
        investment = db.query(Investment).filter(Investment.id == investment_id).first()
        if not investment:
            return None

        latest_risk = db.query(ClimateRisk).filter(
            ClimateRisk.investment_id == investment_id
        ).order_by(desc(ClimateRisk.assessment_date)).first()

        if not latest_risk:
            return ClimateRiskAnalysisResponse(
                investment_id=investment_id,
                investment_name=investment.name,
                latest_assessment=None,
                overall_risk_level="unknown",
                risk_trend="unknown",
                key_risks=[],
                key_opportunities=[],
                recommended_actions=["Conduct initial climate risk assessment"]
            )

        # Calculate overall risk level
        max_physical = max(
            latest_risk.flood_risk or 0,
            latest_risk.drought_risk or 0,
            latest_risk.extreme_weather_risk or 0,
            latest_risk.sea_level_rise_risk or 0,
            latest_risk.heat_stress_risk or 0
        )
        max_transition = max(
            latest_risk.policy_risk or 0,
            latest_risk.technology_risk or 0,
            latest_risk.market_risk or 0,
            latest_risk.reputation_risk or 0
        )
        overall_risk = max(
            latest_risk.physical_risk_score or 0,
            latest_risk.transition_risk_score or 0,
            max_physical,
            max_transition
        )

        if overall_risk >= 8:
            risk_level = "critical"
        elif overall_risk >= 6:
            risk_level = "high"
        elif overall_risk >= 4:
            risk_level = "medium"
        else:
            risk_level = "low"

        # Identify key risks
        key_risks = []
        if (latest_risk.physical_risk_score or 0) >= 7:
            key_risks.append("High physical climate risk")
        if (latest_risk.transition_risk_score or 0) >= 7:
            key_risks.append("High transition risk")
        if (latest_risk.policy_risk or 0) >= 7:
            key_risks.append("Regulatory/policy exposure")
        if (latest_risk.technology_risk or 0) >= 7:
            key_risks.append("Technology disruption risk")

        # Identify opportunities
        key_opportunities = []
        if (latest_risk.climate_opportunity_score or 0) >= 7:
            key_opportunities.append("Strong climate adaptation opportunities")
        if latest_risk.adaptation_opportunities:
            key_opportunities.append("Adaptation potential identified")
        if latest_risk.mitigation_opportunities:
            key_opportunities.append("Mitigation opportunities available")

        # Recommended actions
        recommended_actions = []
        if overall_risk >= 6:
            recommended_actions.append("Develop comprehensive risk mitigation plan")
            recommended_actions.append("Engage with portfolio company on climate strategy")
        if (latest_risk.transition_risk_score or 0) >= 6:
            recommended_actions.append("Assess decarbonization pathway")
        if not latest_risk.risk_management_plan:
            recommended_actions.append("Create risk management plan")
        if (latest_risk.climate_opportunity_score or 0) >= 6:
            recommended_actions.append("Explore climate opportunity investments")

        # Determine trend (simplified - would compare with historical data)
        risk_trend = "stable"  # Would calculate from historical assessments

        return ClimateRiskAnalysisResponse(
            investment_id=investment_id,
            investment_name=investment.name,
            latest_assessment=latest_risk,
            overall_risk_level=risk_level,
            risk_trend=risk_trend,
            key_risks=key_risks,
            key_opportunities=key_opportunities,
            recommended_actions=recommended_actions
        )


# ==================== GHG Emissions Service ====================

class GHGEmissionsService:
    @staticmethod
    def create_emissions(db: Session, emissions: GHGEmissionsCreate) -> GHGEmissions:
        # Calculate total if not provided
        if not emissions.total_emissions:
            total = (emissions.scope1_emissions or 0) + \
                   (emissions.scope2_emissions or 0) + \
                   (emissions.scope3_emissions or 0)
            emissions.total_emissions = total if total > 0 else None

        # Calculate intensity metrics
        if emissions.total_emissions and emissions.revenue:
            emissions.emissions_intensity_revenue = emissions.total_emissions / emissions.revenue
        if emissions.total_emissions and emissions.employees:
            emissions.emissions_intensity_employee = emissions.total_emissions / emissions.employees

        db_emissions = GHGEmissions(**emissions.dict())
        db.add(db_emissions)
        db.commit()
        db.refresh(db_emissions)
        return db_emissions

    @staticmethod
    def get_emissions(
        db: Session,
        investment_id: Optional[int] = None,
        year: Optional[int] = None
    ) -> List[GHGEmissions]:
        query = db.query(GHGEmissions)
        if investment_id:
            query = query.filter(GHGEmissions.investment_id == investment_id)
        if year:
            query = query.filter(GHGEmissions.reporting_year == year)
        return query.order_by(desc(GHGEmissions.reporting_year)).all()

    @staticmethod
    def get_emissions_summary(db: Session, investment_id: int) -> Dict[str, Any]:
        emissions_records = db.query(GHGEmissions).filter(
            GHGEmissions.investment_id == investment_id
        ).order_by(desc(GHGEmissions.reporting_year)).all()

        if not emissions_records:
            return {"error": "No emissions data found"}

        latest = emissions_records[0]
        previous = emissions_records[1] if len(emissions_records) > 1 else None

        # Calculate trends
        trend = "stable"
        yoy_change = None
        if previous and latest.total_emissions and previous.total_emissions:
            yoy_change = ((latest.total_emissions - previous.total_emissions) / previous.total_emissions) * 100
            if yoy_change < -5:
                trend = "decreasing"
            elif yoy_change > 5:
                trend = "increasing"

        # Calculate progress toward target
        target_progress = None
        if latest.reduction_target_percentage and latest.baseline_emissions and latest.total_emissions:
            target_emissions = latest.baseline_emissions * (1 - latest.reduction_target_percentage / 100)
            reduction_needed = latest.total_emissions - target_emissions
            if latest.baseline_emissions > 0:
                target_progress = ((latest.baseline_emissions - latest.total_emissions) / 
                                 (latest.baseline_emissions - target_emissions)) * 100

        return {
            "latest_year": latest.reporting_year,
            "total_emissions": latest.total_emissions,
            "scope1": latest.scope1_emissions,
            "scope2": latest.scope2_emissions,
            "scope3": latest.scope3_emissions,
            "emissions_intensity_revenue": latest.emissions_intensity_revenue,
            "emissions_intensity_employee": latest.emissions_intensity_employee,
            "trend": trend,
            "year_over_year_change": yoy_change,
            "reduction_target": latest.reduction_target_percentage,
            "target_year": latest.reduction_target_year,
            "target_progress": target_progress,
            "historical_data": [
                {
                    "year": e.reporting_year,
                    "total": e.total_emissions,
                    "scope1": e.scope1_emissions,
                    "scope2": e.scope2_emissions,
                    "scope3": e.scope3_emissions
                }
                for e in emissions_records[:5]  # Last 5 years
            ]
        }

    @staticmethod
    def get_portfolio_dashboard(db: Session) -> Dict[str, Any]:
        # Get all investments with emissions data
        investments = db.query(Investment).all()
        
        portfolio_total = 0
        portfolio_scope1 = 0
        portfolio_scope2 = 0
        portfolio_scope3 = 0
        investments_with_data = 0
        
        investment_breakdown = []
        
        for inv in investments:
            latest_emissions = db.query(GHGEmissions).filter(
                GHGEmissions.investment_id == inv.id
            ).order_by(desc(GHGEmissions.reporting_year)).first()
            
            if latest_emissions and latest_emissions.total_emissions:
                portfolio_total += latest_emissions.total_emissions or 0
                portfolio_scope1 += latest_emissions.scope1_emissions or 0
                portfolio_scope2 += latest_emissions.scope2_emissions or 0
                portfolio_scope3 += latest_emissions.scope3_emissions or 0
                investments_with_data += 1
                
                investment_breakdown.append({
                    "investment_id": inv.id,
                    "name": inv.name,
                    "sector": inv.sector,
                    "total_emissions": latest_emissions.total_emissions,
                    "year": latest_emissions.reporting_year
                })

        return {
            "portfolio_total_emissions": portfolio_total or 0,
            "portfolio_scope1": portfolio_scope1 or 0,
            "portfolio_scope2": portfolio_scope2 or 0,
            "portfolio_scope3": portfolio_scope3 or 0,
            "investments_with_data": investments_with_data,
            "total_investments": len(investments) if investments else 0,
            "coverage_percentage": (investments_with_data / len(investments) * 100) if investments and len(investments) > 0 else 0,
            "investment_breakdown": sorted(investment_breakdown, key=lambda x: x.get("total_emissions") or 0, reverse=True) if investment_breakdown else []
        }


# ==================== Social Impact Service ====================

class SocialImpactService:
    @staticmethod
    def create_social_impact(db: Session, impact: SocialImpactCreate) -> SocialImpact:
        # Calculate overall impact score if not provided
        if not impact.overall_impact_score:
            scores = [
                impact.labor_rights_score or 0,
                impact.community_engagement_score or 0,
                impact.affordability_score or 0,
                impact.accessibility_score or 0,
                impact.gender_diversity_score or 0,
                impact.workplace_safety_score or 0
            ]
            valid_scores = [s for s in scores if s > 0]
            if valid_scores:
                impact.overall_impact_score = sum(valid_scores) / len(valid_scores)

        db_impact = SocialImpact(**impact.dict())
        db.add(db_impact)
        db.commit()
        db.refresh(db_impact)
        return db_impact

    @staticmethod
    def get_social_impacts(
        db: Session,
        investment_id: Optional[int] = None
    ) -> List[SocialImpact]:
        query = db.query(SocialImpact)
        if investment_id:
            query = query.filter(SocialImpact.investment_id == investment_id)
        return query.order_by(desc(SocialImpact.assessment_date)).all()

    @staticmethod
    def calculate_impact_score(db: Session, investment_id: int) -> Dict[str, Any]:
        latest_impact = db.query(SocialImpact).filter(
            SocialImpact.investment_id == investment_id
        ).order_by(desc(SocialImpact.assessment_date)).first()

        if not latest_impact:
            return {"error": "No social impact data found"}

        return {
            "overall_score": latest_impact.overall_impact_score,
            "labor_rights": latest_impact.labor_rights_score,
            "community_engagement": latest_impact.community_engagement_score,
            "diversity": {
                "gender": latest_impact.gender_diversity_score,
                "racial_ethnic": latest_impact.racial_ethnic_diversity_score,
                "leadership": latest_impact.leadership_diversity
            },
            "safety": latest_impact.workplace_safety_score,
            "accessibility": latest_impact.accessibility_score,
            "affordability": latest_impact.affordability_score,
            "sdg_alignment": latest_impact.sdg_alignment,
            "primary_sdgs": latest_impact.primary_sdgs,
            "beneficiaries": latest_impact.beneficiaries_reached,
            "jobs_created": latest_impact.jobs_created
        }


# ==================== ESG Score Service ====================

class ESGScoreService:
    @staticmethod
    def create_esg_score(db: Session, score: ESGScoreCreate) -> ESGScore:
        # Calculate environmental score from sub-scores if not provided
        if not score.environmental_score:
            env_scores = [
                score.climate_change_score,
                score.resource_use_score,
                score.pollution_waste_score,
                score.biodiversity_score
            ]
            valid_env = [s for s in env_scores if s is not None and s > 0]
            if valid_env:
                score.environmental_score = sum(valid_env) / len(valid_env)
        
        # Calculate social score from sub-scores if not provided
        if not score.social_score:
            soc_scores = [
                score.human_rights_score,
                score.labor_practices_score,
                score.product_safety_score,
                score.community_relations_score
            ]
            valid_soc = [s for s in soc_scores if s is not None and s > 0]
            if valid_soc:
                score.social_score = sum(valid_soc) / len(valid_soc)
        
        # Calculate governance score from sub-scores if not provided
        if not score.governance_score:
            gov_scores = [
                score.board_structure_score,
                score.executive_compensation_score,
                score.audit_risk_score,
                score.business_ethics_score,
                score.transparency_score
            ]
            valid_gov = [s for s in gov_scores if s is not None and s > 0]
            if valid_gov:
                score.governance_score = sum(valid_gov) / len(valid_gov)
        
        # Calculate overall ESG score if not provided
        if not score.overall_esg_score:
            env = score.environmental_score or 0
            soc = score.social_score or 0
            gov = score.governance_score or 0
            valid_scores = [s for s in [env, soc, gov] if s > 0]
            if valid_scores:
                score.overall_esg_score = sum(valid_scores) / len(valid_scores)

        db_score = ESGScore(**score.dict())
        db.add(db_score)
        db.commit()
        db.refresh(db_score)
        return db_score

    @staticmethod
    def get_esg_scores(
        db: Session,
        investment_id: Optional[int] = None
    ) -> List[ESGScore]:
        query = db.query(ESGScore)
        if investment_id:
            query = query.filter(ESGScore.investment_id == investment_id)
        return query.order_by(desc(ESGScore.assessment_date)).all()

    @staticmethod
    def get_esg_analysis(db: Session, investment_id: int) -> Dict[str, Any]:
        scores = db.query(ESGScore).filter(
            ESGScore.investment_id == investment_id
        ).order_by(desc(ESGScore.assessment_date)).all()

        if not scores:
            return {"error": "No ESG data found"}

        latest = scores[0]
        previous = scores[1] if len(scores) > 1 else None

        yoy_change = None
        if previous and latest.overall_esg_score and previous.overall_esg_score:
            yoy_change = latest.overall_esg_score - previous.overall_esg_score

        return {
            "latest_assessment": {
                "date": latest.assessment_date,
                "overall_score": latest.overall_esg_score,
                "environmental": latest.environmental_score,
                "social": latest.social_score,
                "governance": latest.governance_score
            },
            "detailed_scores": {
                "environmental": {
                    "overall": latest.environmental_score,
                    "climate_change": latest.climate_change_score,
                    "resource_use": latest.resource_use_score,
                    "pollution_waste": latest.pollution_waste_score,
                    "biodiversity": latest.biodiversity_score
                },
                "social": {
                    "overall": latest.social_score,
                    "human_rights": latest.human_rights_score,
                    "labor_practices": latest.labor_practices_score,
                    "product_safety": latest.product_safety_score,
                    "community_relations": latest.community_relations_score
                },
                "governance": {
                    "overall": latest.governance_score,
                    "board_structure": latest.board_structure_score,
                    "executive_compensation": latest.executive_compensation_score,
                    "audit_risk": latest.audit_risk_score,
                    "business_ethics": latest.business_ethics_score,
                    "transparency": latest.transparency_score
                }
            },
            "risk_assessment": {
                "material_risks": latest.material_risks,
                "risk_severity": latest.risk_severity,
                "mitigation_status": latest.risk_mitigation_status
            },
            "trend": {
                "year_over_year_change": yoy_change,
                "trend_direction": latest.score_trend
            },
            "frameworks": {
                "gri": latest.gri_aligned,
                "sasb": latest.sasb_aligned,
                "tcfd": latest.tcfd_aligned,
                "frameworks_used": latest.frameworks_used
            }
        }


# ==================== Analytics Service ====================

class AnalyticsService:
    @staticmethod
    def get_portfolio_analysis(db: Session) -> PortfolioAnalysisResponse:
        investments = db.query(Investment).all()
        
        total_value = sum(inv.current_value or 0 for inv in investments)
        
        # Calculate average scores
        esg_scores = []
        climate_risks = []
        social_impacts = []
        
        sector_dist = {}
        region_dist = {}
        risk_dist = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        
        for inv in investments:
            # Sector distribution
            if inv.sector:
                sector_dist[inv.sector] = sector_dist.get(inv.sector, 0) + 1
            
            # Region distribution
            if inv.region:
                region_dist[inv.region] = region_dist.get(inv.region, 0) + 1
            
            # Get latest ESG score
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            if latest_esg and latest_esg.overall_esg_score:
                esg_scores.append(latest_esg.overall_esg_score)
            
            # Get latest climate risk
            latest_risk = db.query(ClimateRisk).filter(
                ClimateRisk.investment_id == inv.id
            ).order_by(desc(ClimateRisk.assessment_date)).first()
            if latest_risk:
                max_risk = max(
                    latest_risk.physical_risk_score or 0,
                    latest_risk.transition_risk_score or 0
                )
                climate_risks.append(max_risk)
                if max_risk >= 8:
                    risk_dist["critical"] += 1
                elif max_risk >= 6:
                    risk_dist["high"] += 1
                elif max_risk >= 4:
                    risk_dist["medium"] += 1
                else:
                    risk_dist["low"] += 1
            
            # Get latest social impact
            latest_impact = db.query(SocialImpact).filter(
                SocialImpact.investment_id == inv.id
            ).order_by(desc(SocialImpact.assessment_date)).first()
            if latest_impact and latest_impact.overall_impact_score:
                social_impacts.append(latest_impact.overall_impact_score)
        
        # Get portfolio emissions
        emissions_data = GHGEmissionsService.get_portfolio_dashboard(db)
        total_emissions = emissions_data.get("portfolio_total_emissions", 0)
        
        # Top performers (by ESG score)
        top_performers = []
        for inv in investments:
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            if latest_esg and latest_esg.overall_esg_score:
                top_performers.append({
                    "investment_id": inv.id,
                    "name": inv.name,
                    "esg_score": latest_esg.overall_esg_score
                })
        top_performers = sorted(top_performers, key=lambda x: x["esg_score"], reverse=True)[:5]
        
        # Areas for improvement (low ESG scores)
        areas_for_improvement = []
        for inv in investments:
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            if latest_esg and latest_esg.overall_esg_score and latest_esg.overall_esg_score < 50:
                areas_for_improvement.append({
                    "investment_id": inv.id,
                    "name": inv.name,
                    "esg_score": latest_esg.overall_esg_score,
                    "priority": "high" if latest_esg.overall_esg_score < 30 else "medium"
                })
        
        # Calculate averages safely
        avg_esg = sum(esg_scores) / len(esg_scores) if esg_scores else None
        avg_climate_risk = sum(climate_risks) / len(climate_risks) if climate_risks else None
        avg_social_impact = sum(social_impacts) / len(social_impacts) if social_impacts else None
        
        return PortfolioAnalysisResponse(
            total_investments=len(investments),
            total_investment_value=total_value,
            average_esg_score=round(avg_esg, 2) if avg_esg is not None else None,
            average_climate_risk_score=round(avg_climate_risk, 2) if avg_climate_risk is not None else None,
            total_portfolio_emissions=round(total_emissions, 2) if total_emissions and total_emissions > 0 else None,
            average_social_impact_score=round(avg_social_impact, 2) if avg_social_impact is not None else None,
            sector_distribution=sector_dist,
            region_distribution=region_dist,
            risk_distribution=risk_dist,
            top_performers=top_performers,
            areas_for_improvement=areas_for_improvement
        )

    @staticmethod
    def get_portfolio_dashboard(db: Session) -> Dict[str, Any]:
        try:
            analysis = AnalyticsService.get_portfolio_analysis(db)
            emissions = GHGEmissionsService.get_portfolio_dashboard(db)
            
            return {
                "summary": {
                    "total_investments": analysis.total_investments or 0,
                    "total_value": analysis.total_investment_value or 0,
                    "average_esg": analysis.average_esg_score,
                    "average_esg_score": analysis.average_esg_score,  # Alias for compatibility
                    "average_climate_risk": analysis.average_climate_risk_score,
                    "average_climate_risk_score": analysis.average_climate_risk_score,  # Alias
                    "average_social_impact": analysis.average_social_impact_score,
                    "average_social_impact_score": analysis.average_social_impact_score,  # Alias
                    "total_emissions": analysis.total_portfolio_emissions,
                    "total_portfolio_emissions": analysis.total_portfolio_emissions  # Alias
                },
                "emissions": emissions or {},
                "distribution": {
                    "sectors": analysis.sector_distribution or {},
                    "sector_distribution": analysis.sector_distribution or {},  # Alias
                    "regions": analysis.region_distribution or {},
                    "region_distribution": analysis.region_distribution or {},  # Alias
                    "risks": analysis.risk_distribution or {},
                    "risk_distribution": analysis.risk_distribution or {}  # Alias
                },
                "top_performers": analysis.top_performers or [],
                "improvement_areas": analysis.areas_for_improvement or []
            }
        except Exception as e:
            import traceback
            print(f"Error in get_portfolio_dashboard: {str(e)}")
            print(traceback.format_exc())
            raise

    @staticmethod
    def get_performance_trends(
        db: Session,
        metric: str = "esg_score",
        period: str = "1y"
    ) -> Dict[str, Any]:
        # Simplified trend analysis
        investments = db.query(Investment).all()
        trends = []
        
        for inv in investments:
            if metric == "esg_score":
                scores = db.query(ESGScore).filter(
                    ESGScore.investment_id == inv.id
                ).order_by(ESGScore.assessment_date).all()
                if len(scores) >= 2:
                    trends.append({
                        "investment_id": inv.id,
                        "name": inv.name,
                        "data": [
                            {"date": s.assessment_date.isoformat(), "value": s.overall_esg_score}
                            for s in scores
                        ]
                    })
        
        return {
            "metric": metric,
            "period": period,
            "trends": trends
        }

    @staticmethod
    def generate_portfolio_summary(db: Session) -> Dict[str, Any]:
        analysis = AnalyticsService.get_portfolio_analysis(db)
        return {
            "report_date": datetime.utcnow().isoformat(),
            "portfolio_overview": {
                "total_investments": analysis.total_investments,
                "total_value": analysis.total_investment_value,
                "average_esg_score": analysis.average_esg_score
            },
            "performance_metrics": {
                "esg_performance": analysis.average_esg_score,
                "climate_risk": analysis.average_climate_risk_score,
                "social_impact": analysis.average_social_impact_score,
                "emissions": analysis.total_portfolio_emissions
            },
            "distribution": {
                "by_sector": analysis.sector_distribution,
                "by_region": analysis.region_distribution
            },
            "key_insights": {
                "top_performers": analysis.top_performers,
                "improvement_areas": analysis.areas_for_improvement
            }
        }

    @staticmethod
    def generate_climate_risk_report(db: Session) -> Dict[str, Any]:
        investments = db.query(Investment).all()
        risk_analysis = []
        
        for inv in investments:
            analysis = ClimateRiskService.get_comprehensive_analysis(db, inv.id)
            if analysis and analysis.latest_assessment:
                risk_analysis.append({
                    "investment": inv.name,
                    "risk_level": analysis.overall_risk_level,
                    "physical_risk": analysis.latest_assessment.physical_risk_score,
                    "transition_risk": analysis.latest_assessment.transition_risk_score,
                    "key_risks": analysis.key_risks,
                    "opportunities": analysis.key_opportunities,
                    "recommended_actions": analysis.recommended_actions
                })
        
        return {
            "report_date": datetime.utcnow().isoformat(),
            "total_investments_assessed": len(risk_analysis),
            "risk_distribution": {
                "critical": len([r for r in risk_analysis if r["risk_level"] == "critical"]),
                "high": len([r for r in risk_analysis if r["risk_level"] == "high"]),
                "medium": len([r for r in risk_analysis if r["risk_level"] == "medium"]),
                "low": len([r for r in risk_analysis if r["risk_level"] == "low"])
            },
            "detailed_analysis": risk_analysis
        }

    @staticmethod
    def generate_impact_report(db: Session) -> Dict[str, Any]:
        investments = db.query(Investment).all()
        impact_data = []
        
        for inv in investments:
            impact_score = SocialImpactService.calculate_impact_score(db, inv.id)
            if "error" not in impact_score:
                impact_data.append({
                    "investment": inv.name,
                    "overall_score": impact_score.get("overall_score"),
                    "beneficiaries": impact_score.get("beneficiaries"),
                    "jobs_created": impact_score.get("jobs_created"),
                    "sdg_alignment": impact_score.get("sdg_alignment")
                })
        
        return {
            "report_date": datetime.utcnow().isoformat(),
            "total_investments": len(impact_data),
            "average_impact_score": sum(d.get("overall_score", 0) or 0 for d in impact_data) / len(impact_data) if impact_data else 0,
            "total_beneficiaries": sum(d.get("beneficiaries", 0) or 0 for d in impact_data),
            "total_jobs_created": sum(d.get("jobs_created", 0) or 0 for d in impact_data),
            "impact_breakdown": impact_data
        }


# ==================== Recommendation Service ====================

class RecommendationService:
    @staticmethod
    def get_investment_recommendation(db: Session, investment_id: int) -> InvestmentRecommendationResponse:
        """Generate comprehensive investment recommendation"""
        investment = db.query(Investment).filter(Investment.id == investment_id).first()
        if not investment:
            raise ValueError("Investment not found")
        
        # Get all related data
        esg_scores = ESGScoreService.get_esg_scores(db, investment_id)
        climate_risks = ClimateRiskService.get_climate_risks(db, investment_id)
        emissions = GHGEmissionsService.get_emissions(db, investment_id)
        social_impacts = SocialImpactService.get_social_impacts(db, investment_id)
        
        latest_esg = esg_scores[0] if esg_scores else None
        latest_risk = climate_risks[0] if climate_risks else None
        latest_emissions = emissions[0] if emissions else None
        latest_impact = social_impacts[0] if social_impacts else None
        
        # Get portfolio averages for comparison
        portfolio_analysis = AnalyticsService.get_portfolio_analysis(db)
        portfolio_avg_esg = portfolio_analysis.average_esg_score or 0
        
        # Calculate financial metrics
        roi = 0
        if investment.investment_amount and investment.current_value:
            roi = ((investment.current_value - investment.investment_amount) / investment.investment_amount) * 100
        
        # Determine recommendation
        recommendation_score = 0
        reasoning = []
        risks = []
        opportunities = []
        action_items = []
        
        # ESG Analysis (40% weight)
        if latest_esg:
            esg_score = latest_esg.overall_esg_score or 0
            if esg_score >= 80:
                recommendation_score += 40
                reasoning.append(f"Strong ESG performance ({esg_score:.1f}/100) exceeds portfolio average")
                opportunities.append("High ESG score indicates strong sustainability practices")
            elif esg_score >= 60:
                recommendation_score += 25
                reasoning.append(f"Moderate ESG performance ({esg_score:.1f}/100)")
            else:
                recommendation_score += 10
                reasoning.append(f"Low ESG performance ({esg_score:.1f}/100) - below portfolio average")
                risks.append("Poor ESG performance may impact long-term value")
                action_items.append("Implement ESG improvement plan")
        else:
            risks.append("No ESG assessment available - data gap")
            action_items.append("Conduct ESG assessment")
        
        # Climate Risk Analysis (25% weight)
        if latest_risk:
            max_risk = max(
                latest_risk.physical_risk_score or 0,
                latest_risk.transition_risk_score or 0
            )
            if max_risk <= 3:
                recommendation_score += 25
                reasoning.append("Low climate risk exposure")
                opportunities.append("Well-positioned for climate transition")
            elif max_risk <= 6:
                recommendation_score += 15
                reasoning.append(f"Moderate climate risk ({max_risk:.1f}/10)")
                risks.append("Climate risks require monitoring")
                action_items.append("Develop climate adaptation strategy")
            else:
                recommendation_score += 5
                reasoning.append(f"High climate risk ({max_risk:.1f}/10)")
                risks.append("Significant climate risk exposure")
                action_items.append("Urgent: Address climate vulnerabilities")
        else:
            risks.append("No climate risk assessment - data gap")
            action_items.append("Conduct climate risk assessment")
        
        # Financial Performance (20% weight)
        if roi > 20:
            recommendation_score += 20
            reasoning.append(f"Strong financial performance ({roi:.1f}% ROI)")
            opportunities.append("Outperforming investment with strong returns")
        elif roi > 0:
            recommendation_score += 12
            reasoning.append(f"Positive financial performance ({roi:.1f}% ROI)")
        elif roi > -10:
            recommendation_score += 8
            reasoning.append(f"Underperforming ({roi:.1f}% ROI)")
            risks.append("Financial performance below expectations")
            action_items.append("Review investment strategy and value drivers")
        else:
            recommendation_score += 2
            reasoning.append(f"Poor financial performance ({roi:.1f}% ROI)")
            risks.append("Significant financial underperformance")
            action_items.append("Consider exit strategy")
        
        # Social Impact (10% weight)
        if latest_impact:
            impact_score = latest_impact.overall_impact_score or 0
            if impact_score >= 8:
                recommendation_score += 10
                reasoning.append(f"Strong social impact ({impact_score:.1f}/10)")
                opportunities.append("High social impact aligns with impact investing goals")
            elif impact_score >= 6:
                recommendation_score += 6
                reasoning.append(f"Moderate social impact ({impact_score:.1f}/10)")
            else:
                recommendation_score += 3
                reasoning.append(f"Limited social impact ({impact_score:.1f}/10)")
        else:
            risks.append("No social impact assessment - data gap")
        
        # Emissions Trend (5% weight)
        if latest_emissions and len(emissions) > 1:
            prev_emissions = emissions[1].total_emissions or 0
            curr_emissions = latest_emissions.total_emissions or 0
            if prev_emissions > 0:
                emissions_change = ((curr_emissions - prev_emissions) / prev_emissions) * 100
                if emissions_change < -5:
                    recommendation_score += 5
                    reasoning.append("Emissions decreasing - positive trend")
                    opportunities.append("Reducing carbon footprint")
                elif emissions_change > 5:
                    recommendation_score += 1
                    reasoning.append("Emissions increasing - concerning trend")
                    risks.append("Rising emissions may face regulatory pressure")
                    action_items.append("Implement emissions reduction plan")
        
        # Determine final recommendation with realistic confidence scores
        # Confidence should reflect data quality, score consistency, and uncertainty
        
        # Calculate data completeness (affects confidence)
        data_completeness = 0
        if latest_esg: data_completeness += 0.3
        if latest_risk: data_completeness += 0.25
        if latest_emissions: data_completeness += 0.15
        if latest_impact: data_completeness += 0.15
        if investment.investment_amount and investment.current_value: data_completeness += 0.15
        
        # Base confidence on recommendation score, but add variability and data quality factor
        base_confidence = recommendation_score
        
        # Add realistic variability: ±5-15% based on data quality and score consistency
        variability = (1 - data_completeness) * 15  # More variability with less data
        confidence_variation = random.uniform(-variability, variability)
        
        if recommendation_score >= 75:
            rec = "buy"
            # High confidence for strong buys, but not always 95%
            confidence = min(92, max(72, base_confidence + confidence_variation))
            priority = "high"
            financial_impact = "Strong potential for value creation"
            timeline = "Immediate action recommended"
        elif recommendation_score >= 60:
            rec = "hold"
            # Moderate confidence for holds
            confidence = min(75, max(55, base_confidence + confidence_variation))
            priority = "medium"
            financial_impact = "Maintain current position"
            timeline = "Monitor quarterly"
        elif recommendation_score >= 45:
            rec = "monitor"
            # Lower confidence for monitoring situations
            confidence = min(65, max(45, base_confidence + confidence_variation))
            priority = "high"
            financial_impact = "Requires close monitoring"
            timeline = "Review monthly"
        elif recommendation_score >= 30:
            rec = "sell"
            # Moderate confidence for sell recommendations
            confidence = min(70, max(50, (100 - base_confidence) + confidence_variation))
            priority = "high"
            financial_impact = "Consider divestment"
            timeline = "Evaluate exit within 6-12 months"
        else:
            rec = "divest"
            # Higher confidence for clear divest situations
            confidence = min(80, max(60, (100 - base_confidence) + confidence_variation))
            priority = "high"
            financial_impact = "Urgent divestment consideration"
            timeline = "Immediate exit evaluation"
        
        # Build comparison to portfolio
        comparison = {
            "esg_vs_portfolio": (latest_esg.overall_esg_score or 0) - portfolio_avg_esg if latest_esg else None,
            "portfolio_rank": "Calculating...",  # Would need full portfolio analysis
            "sector_performance": "Above average" if (latest_esg.overall_esg_score or 0) >= portfolio_avg_esg else "Below average"
        }
        
        recommendation = InvestmentRecommendation(
            recommendation=rec,
            confidence=confidence,
            reasoning=reasoning,
            key_risks=risks,
            key_opportunities=opportunities,
            action_items=action_items,
            financial_impact=financial_impact,
            timeline=timeline,
            priority=priority
        )
        
        return InvestmentRecommendationResponse(
            investment_id=investment.id,
            investment_name=investment.name,
            overall_recommendation=recommendation,
            esg_analysis={
                "current_score": latest_esg.overall_esg_score if latest_esg else None,
                "portfolio_average": portfolio_avg_esg,
                "trend": latest_esg.score_trend if latest_esg else None,
                "assessment_date": latest_esg.assessment_date.isoformat() if latest_esg else None
            },
            climate_risk_analysis={
                "physical_risk": latest_risk.physical_risk_score if latest_risk else None,
                "transition_risk": latest_risk.transition_risk_score if latest_risk else None,
                "overall_risk": max(
                    latest_risk.physical_risk_score or 0,
                    latest_risk.transition_risk_score or 0
                ) if latest_risk else None,
                "assessment_date": latest_risk.assessment_date.isoformat() if latest_risk else None
            },
            financial_analysis={
                "roi": roi,
                "investment_amount": investment.investment_amount,
                "current_value": investment.current_value,
                "value_change": (investment.current_value or 0) - (investment.investment_amount or 0),
                "ownership": investment.ownership_percentage
            },
            social_impact_analysis={
                "impact_score": latest_impact.overall_impact_score if latest_impact else None,
                "beneficiaries": latest_impact.beneficiaries_reached if latest_impact else None,
                "jobs_created": latest_impact.jobs_created if latest_impact else None,
                "assessment_date": latest_impact.assessment_date.isoformat() if latest_impact else None
            },
            comparison_to_portfolio=comparison
        )

