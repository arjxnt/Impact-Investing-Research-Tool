"""
Scheduled Report Generation Service
Automated weekly/monthly report creation and email delivery
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
from enum import Enum
import json
from models import Investment, ESGScore, ClimateRisk, GHGEmissions, SocialImpact
from services import AnalyticsService, GHGEmissionsService
from sqlalchemy import desc


class ReportType(str, Enum):
    """Types of reports that can be generated"""
    PORTFOLIO_SUMMARY = "portfolio_summary"
    CLIMATE_RISK = "climate_risk"
    ESG_PERFORMANCE = "esg_performance"
    EMISSIONS_REPORT = "emissions_report"
    SOCIAL_IMPACT = "social_impact"
    COMPREHENSIVE = "comprehensive"


class ReportFrequency(str, Enum):
    """Report generation frequencies"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    ON_DEMAND = "on_demand"


class ReportGenerationService:
    """Service for generating automated reports"""
    
    @staticmethod
    def generate_portfolio_summary(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict[str, Any]:
        """Generate portfolio summary report"""
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=30)  # Default to last 30 days
        
        dashboard_data = AnalyticsService.get_portfolio_dashboard(db)
        investments = db.query(Investment).filter(Investment.status == "active").all()
        
        # Calculate key metrics
        total_value = sum(inv.current_value or 0 for inv in investments)
        total_invested = sum(inv.investment_amount or 0 for inv in investments)
        total_return = total_value - total_invested
        roi_percentage = (total_return / total_invested * 100) if total_invested > 0 else 0
        
        # Get ESG performance
        avg_esg = dashboard_data.get('summary', {}).get('average_esg_score', 0)
        
        # Get climate risk summary
        avg_climate_risk = dashboard_data.get('summary', {}).get('average_climate_risk_score', 0)
        
        # Get emissions summary
        total_emissions = dashboard_data.get('summary', {}).get('total_portfolio_emissions', 0)
        
        # Top performers
        top_performers = []
        for inv in investments[:5]:
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            
            if latest_esg and latest_esg.overall_esg_score:
                top_performers.append({
                    "name": inv.name,
                    "esg_score": latest_esg.overall_esg_score,
                    "current_value": inv.current_value or 0
                })
        
        top_performers.sort(key=lambda x: x['esg_score'], reverse=True)
        
        return {
            "report_type": ReportType.PORTFOLIO_SUMMARY.value,
            "generated_at": datetime.now().isoformat(),
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_investments": len(investments),
                "total_portfolio_value": total_value,
                "total_invested": total_invested,
                "total_return": total_return,
                "roi_percentage": round(roi_percentage, 2),
                "average_esg_score": round(avg_esg, 2) if avg_esg else None,
                "average_climate_risk": round(avg_climate_risk, 2) if avg_climate_risk else None,
                "total_emissions_tco2e": round(total_emissions, 2) if total_emissions else None
            },
            "top_performers": top_performers[:5],
            "sector_distribution": dashboard_data.get('distribution', {}).get('sectors', {}),
            "risk_distribution": dashboard_data.get('distribution', {}).get('risks', {})
        }
    
    @staticmethod
    def generate_climate_risk_report(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict[str, Any]:
        """Generate climate risk assessment report"""
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=90)  # Default to last quarter
        
        investments = db.query(Investment).filter(Investment.status == "active").all()
        
        high_risk_investments = []
        medium_risk_investments = []
        low_risk_investments = []
        
        for inv in investments:
            latest_risk = db.query(ClimateRisk).filter(
                ClimateRisk.investment_id == inv.id
            ).order_by(desc(ClimateRisk.assessment_date)).first()
            
            if latest_risk:
                max_risk = max(
                    latest_risk.physical_risk_score or 0,
                    latest_risk.transition_risk_score or 0
                )
                
                risk_data = {
                    "investment_id": inv.id,
                    "name": inv.name,
                    "sector": inv.sector,
                    "physical_risk": latest_risk.physical_risk_score or 0,
                    "transition_risk": latest_risk.transition_risk_score or 0,
                    "max_risk": max_risk,
                    "assessment_date": latest_risk.assessment_date.isoformat() if latest_risk.assessment_date else None
                }
                
                if max_risk >= 7:
                    high_risk_investments.append(risk_data)
                elif max_risk >= 4:
                    medium_risk_investments.append(risk_data)
                else:
                    low_risk_investments.append(risk_data)
        
        return {
            "report_type": ReportType.CLIMATE_RISK.value,
            "generated_at": datetime.now().isoformat(),
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_assessments": len(high_risk_investments) + len(medium_risk_investments) + len(low_risk_investments),
                "high_risk_count": len(high_risk_investments),
                "medium_risk_count": len(medium_risk_investments),
                "low_risk_count": len(low_risk_investments)
            },
            "high_risk_investments": sorted(high_risk_investments, key=lambda x: x['max_risk'], reverse=True),
            "medium_risk_investments": sorted(medium_risk_investments, key=lambda x: x['max_risk'], reverse=True),
            "low_risk_investments": sorted(low_risk_investments, key=lambda x: x['max_risk'], reverse=True)
        }
    
    @staticmethod
    def generate_esg_performance_report(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict[str, Any]:
        """Generate ESG performance report"""
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=90)
        
        investments = db.query(Investment).filter(Investment.status == "active").all()
        
        esg_data = []
        for inv in investments:
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            
            if latest_esg:
                esg_data.append({
                    "investment_id": inv.id,
                    "name": inv.name,
                    "sector": inv.sector,
                    "overall_score": latest_esg.overall_esg_score or 0,
                    "environmental_score": latest_esg.environmental_score or 0,
                    "social_score": latest_esg.social_score or 0,
                    "governance_score": latest_esg.governance_score or 0,
                    "assessment_date": latest_esg.assessment_date.isoformat() if latest_esg.assessment_date else None
                })
        
        # Calculate averages
        if esg_data:
            avg_overall = sum(d['overall_score'] for d in esg_data) / len(esg_data)
            avg_env = sum(d['environmental_score'] for d in esg_data) / len(esg_data)
            avg_social = sum(d['social_score'] for d in esg_data) / len(esg_data)
            avg_gov = sum(d['governance_score'] for d in esg_data) / len(esg_data)
        else:
            avg_overall = avg_env = avg_social = avg_gov = 0
        
        # Sort by overall score
        esg_data.sort(key=lambda x: x['overall_score'], reverse=True)
        
        return {
            "report_type": ReportType.ESG_PERFORMANCE.value,
            "generated_at": datetime.now().isoformat(),
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_investments": len(esg_data),
                "average_overall_esg": round(avg_overall, 2),
                "average_environmental": round(avg_env, 2),
                "average_social": round(avg_social, 2),
                "average_governance": round(avg_gov, 2)
            },
            "investments": esg_data,
            "top_performers": esg_data[:5],
            "needs_improvement": [d for d in esg_data if d['overall_score'] < 50][:5]
        }
    
    @staticmethod
    def generate_emissions_report(db: Session, year: Optional[int] = None) -> Dict[str, Any]:
        """Generate emissions report"""
        if not year:
            year = date.today().year
        
        emissions_data = GHGEmissionsService.get_portfolio_dashboard(db)
        investments = db.query(Investment).filter(Investment.status == "active").all()
        
        investment_emissions = []
        for inv in investments:
            latest_emissions = db.query(GHGEmissions).filter(
                GHGEmissions.investment_id == inv.id,
                GHGEmissions.reporting_year == year
            ).order_by(desc(GHGEmissions.reporting_year)).first()
            
            if latest_emissions:
                investment_emissions.append({
                    "investment_id": inv.id,
                    "name": inv.name,
                    "sector": inv.sector,
                    "total_emissions": latest_emissions.total_emissions or 0,
                    "scope1": latest_emissions.scope1_emissions or 0,
                    "scope2": latest_emissions.scope2_emissions or 0,
                    "scope3": latest_emissions.scope3_emissions or 0,
                    "year": latest_emissions.reporting_year
                })
        
        investment_emissions.sort(key=lambda x: x['total_emissions'], reverse=True)
        
        return {
            "report_type": ReportType.EMISSIONS_REPORT.value,
            "generated_at": datetime.now().isoformat(),
            "reporting_year": year,
            "summary": {
                "total_portfolio_emissions": emissions_data.get('portfolio_total_emissions', 0),
                "scope1_total": emissions_data.get('portfolio_scope1', 0),
                "scope2_total": emissions_data.get('portfolio_scope2', 0),
                "scope3_total": emissions_data.get('portfolio_scope3', 0),
                "investments_with_data": emissions_data.get('investments_with_data', 0),
                "coverage_percentage": round(emissions_data.get('coverage_percentage', 0), 2)
            },
            "investment_breakdown": investment_emissions
        }
    
    @staticmethod
    def generate_comprehensive_report(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict[str, Any]:
        """Generate comprehensive report combining all report types"""
        portfolio_summary = ReportGenerationService.generate_portfolio_summary(db, start_date, end_date)
        climate_risk = ReportGenerationService.generate_climate_risk_report(db, start_date, end_date)
        esg_performance = ReportGenerationService.generate_esg_performance_report(db, start_date, end_date)
        emissions = ReportGenerationService.generate_emissions_report()
        
        return {
            "report_type": ReportType.COMPREHENSIVE.value,
            "generated_at": datetime.now().isoformat(),
            "period": {
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            },
            "portfolio_summary": portfolio_summary,
            "climate_risk": climate_risk,
            "esg_performance": esg_performance,
            "emissions": emissions
        }
    
    @staticmethod
    def generate_report(
        report_type: str,
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        year: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate a report by type"""
        if report_type == ReportType.PORTFOLIO_SUMMARY.value:
            return ReportGenerationService.generate_portfolio_summary(db, start_date, end_date)
        elif report_type == ReportType.CLIMATE_RISK.value:
            return ReportGenerationService.generate_climate_risk_report(db, start_date, end_date)
        elif report_type == ReportType.ESG_PERFORMANCE.value:
            return ReportGenerationService.generate_esg_performance_report(db, start_date, end_date)
        elif report_type == ReportType.EMISSIONS_REPORT.value:
            return ReportGenerationService.generate_emissions_report(db, year)
        elif report_type == ReportType.COMPREHENSIVE.value:
            return ReportGenerationService.generate_comprehensive_report(db, start_date, end_date)
        else:
            raise ValueError(f"Unknown report type: {report_type}")

