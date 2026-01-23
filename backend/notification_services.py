"""
Notification Services for Impact Investing Research Tool
Real-time alerts for metric changes, assessments, and risk thresholds
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from enum import Enum
from models import Investment, ClimateRisk, GHGEmissions, SocialImpact, ESGScore


class NotificationType(str, Enum):
    """Types of notifications"""
    METRIC_CHANGE = "metric_change"
    RISK_THRESHOLD = "risk_threshold"
    ASSESSMENT_DUE = "assessment_due"
    DATA_QUALITY = "data_quality"
    PORTFOLIO_ALERT = "portfolio_alert"


class NotificationSeverity(str, Enum):
    """Severity levels for notifications"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class NotificationService:
    """Service for managing notifications and alerts"""
    
    @staticmethod
    def check_metric_changes(
        db: Session,
        investment_id: int,
        days_back: int = 30
    ) -> List[Dict[str, Any]]:
        """Check for significant metric changes in an investment"""
        notifications = []
        investment = db.query(Investment).filter(Investment.id == investment_id).first()
        
        if not investment:
            return notifications
        
        cutoff_date = datetime.now().date() - timedelta(days=days_back)
        
        # Check ESG score changes
        esg_scores = db.query(ESGScore).filter(
            ESGScore.investment_id == investment_id
        ).order_by(desc(ESGScore.assessment_date)).limit(2).all()
        
        if len(esg_scores) >= 2:
            current = esg_scores[0]
            previous = esg_scores[1]
            
            if current.assessment_date >= cutoff_date:
                if current.overall_esg_score and previous.overall_esg_score:
                    change = current.overall_esg_score - previous.overall_esg_score
                    if abs(change) >= 10:  # 10 point change
                        notifications.append({
                            "type": NotificationType.METRIC_CHANGE.value,
                            "severity": NotificationSeverity.HIGH.value if change < 0 else NotificationSeverity.MEDIUM.value,
                            "title": f"ESG Score Change: {investment.name}",
                            "message": f"ESG score changed by {change:+.1f} points ({previous.overall_esg_score:.1f} → {current.overall_esg_score:.1f})",
                            "investment_id": investment_id,
                            "investment_name": investment.name,
                            "metric": "esg_score",
                            "change": change,
                            "timestamp": datetime.now().isoformat()
                        })
        
        # Check climate risk changes
        climate_risks = db.query(ClimateRisk).filter(
            ClimateRisk.investment_id == investment_id
        ).order_by(desc(ClimateRisk.assessment_date)).limit(2).all()
        
        if len(climate_risks) >= 2:
            current = climate_risks[0]
            previous = climate_risks[1]
            
            if current.assessment_date >= cutoff_date:
                current_max = max(
                    current.physical_risk_score or 0,
                    current.transition_risk_score or 0
                )
                previous_max = max(
                    previous.physical_risk_score or 0,
                    previous.transition_risk_score or 0
                )
                
                if abs(current_max - previous_max) >= 2:  # 2 point change
                    notifications.append({
                        "type": NotificationType.METRIC_CHANGE.value,
                        "severity": NotificationSeverity.HIGH.value if current_max > previous_max else NotificationSeverity.MEDIUM.value,
                        "title": f"Climate Risk Change: {investment.name}",
                        "message": f"Climate risk changed by {current_max - previous_max:+.1f} points ({previous_max:.1f} → {current_max:.1f})",
                        "investment_id": investment_id,
                        "investment_name": investment.name,
                        "metric": "climate_risk",
                        "change": current_max - previous_max,
                        "timestamp": datetime.now().isoformat()
                    })
        
        # Check emissions changes
        emissions = db.query(GHGEmissions).filter(
            GHGEmissions.investment_id == investment_id
        ).order_by(desc(GHGEmissions.reporting_year)).limit(2).all()
        
        if len(emissions) >= 2:
            current = emissions[0]
            previous = emissions[1]
            
            if current.total_emissions and previous.total_emissions:
                change_pct = ((current.total_emissions - previous.total_emissions) / previous.total_emissions) * 100
                if abs(change_pct) >= 15:  # 15% change
                    notifications.append({
                        "type": NotificationType.METRIC_CHANGE.value,
                        "severity": NotificationSeverity.HIGH.value if change_pct > 0 else NotificationSeverity.MEDIUM.value,
                        "title": f"Emissions Change: {investment.name}",
                        "message": f"Emissions changed by {change_pct:+.1f}% ({previous.total_emissions:.0f} → {current.total_emissions:.0f} tCO2e)",
                        "investment_id": investment_id,
                        "investment_name": investment.name,
                        "metric": "emissions",
                        "change": change_pct,
                        "timestamp": datetime.now().isoformat()
                    })
        
        return notifications
    
    @staticmethod
    def check_risk_thresholds(db: Session, investment_id: int) -> List[Dict[str, Any]]:
        """Check if investments exceed risk thresholds"""
        notifications = []
        investment = db.query(Investment).filter(Investment.id == investment_id).first()
        
        if not investment:
            return notifications
        
        # Check climate risk thresholds
        latest_risk = db.query(ClimateRisk).filter(
            ClimateRisk.investment_id == investment_id
        ).order_by(desc(ClimateRisk.assessment_date)).first()
        
        if latest_risk:
            max_risk = max(
                latest_risk.physical_risk_score or 0,
                latest_risk.transition_risk_score or 0
            )
            
            if max_risk >= 8:
                notifications.append({
                    "type": NotificationType.RISK_THRESHOLD.value,
                    "severity": NotificationSeverity.CRITICAL.value,
                    "title": f"Critical Climate Risk: {investment.name}",
                    "message": f"Climate risk score of {max_risk:.1f}/10 exceeds critical threshold (8.0)",
                    "investment_id": investment_id,
                    "investment_name": investment.name,
                    "threshold": 8.0,
                    "current_value": max_risk,
                    "timestamp": datetime.now().isoformat()
                })
            elif max_risk >= 6:
                notifications.append({
                    "type": NotificationType.RISK_THRESHOLD.value,
                    "severity": NotificationSeverity.HIGH.value,
                    "title": f"High Climate Risk: {investment.name}",
                    "message": f"Climate risk score of {max_risk:.1f}/10 exceeds high threshold (6.0)",
                    "investment_id": investment_id,
                    "investment_name": investment.name,
                    "threshold": 6.0,
                    "current_value": max_risk,
                    "timestamp": datetime.now().isoformat()
                })
        
        # Check ESG score thresholds
        latest_esg = db.query(ESGScore).filter(
            ESGScore.investment_id == investment_id
        ).order_by(desc(ESGScore.assessment_date)).first()
        
        if latest_esg and latest_esg.overall_esg_score:
            if latest_esg.overall_esg_score < 30:
                notifications.append({
                    "type": NotificationType.RISK_THRESHOLD.value,
                    "severity": NotificationSeverity.HIGH.value,
                    "title": f"Low ESG Score: {investment.name}",
                    "message": f"ESG score of {latest_esg.overall_esg_score:.1f}/100 is below critical threshold (30)",
                    "investment_id": investment_id,
                    "investment_name": investment.name,
                    "threshold": 30.0,
                    "current_value": latest_esg.overall_esg_score,
                    "timestamp": datetime.now().isoformat()
                })
        
        return notifications
    
    @staticmethod
    def check_assessments_due(db: Session, days_overdue: int = 90) -> List[Dict[str, Any]]:
        """Check for assessments that are overdue"""
        notifications = []
        cutoff_date = datetime.now().date() - timedelta(days=days_overdue)
        
        investments = db.query(Investment).filter(Investment.status == "active").all()
        
        for investment in investments:
            # Check ESG assessment
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == investment.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            
            if not latest_esg or latest_esg.assessment_date < cutoff_date:
                days_ago = (datetime.now().date() - (latest_esg.assessment_date if latest_esg else investment.investment_date or datetime.now().date())).days
                notifications.append({
                    "type": NotificationType.ASSESSMENT_DUE.value,
                    "severity": NotificationSeverity.MEDIUM.value if days_ago < 180 else NotificationSeverity.HIGH.value,
                    "title": f"ESG Assessment Overdue: {investment.name}",
                    "message": f"ESG assessment is {days_ago} days overdue. Last assessment: {latest_esg.assessment_date if latest_esg else 'Never'}",
                    "investment_id": investment.id,
                    "investment_name": investment.name,
                    "assessment_type": "esg",
                    "days_overdue": days_ago,
                    "timestamp": datetime.now().isoformat()
                })
            
            # Check climate risk assessment
            latest_risk = db.query(ClimateRisk).filter(
                ClimateRisk.investment_id == investment.id
            ).order_by(desc(ClimateRisk.assessment_date)).first()
            
            if not latest_risk or latest_risk.assessment_date < cutoff_date:
                days_ago = (datetime.now().date() - (latest_risk.assessment_date if latest_risk else investment.investment_date or datetime.now().date())).days
                notifications.append({
                    "type": NotificationType.ASSESSMENT_DUE.value,
                    "severity": NotificationSeverity.MEDIUM.value if days_ago < 180 else NotificationSeverity.HIGH.value,
                    "title": f"Climate Risk Assessment Overdue: {investment.name}",
                    "message": f"Climate risk assessment is {days_ago} days overdue. Last assessment: {latest_risk.assessment_date if latest_risk else 'Never'}",
                    "investment_id": investment.id,
                    "investment_name": investment.name,
                    "assessment_type": "climate_risk",
                    "days_overdue": days_ago,
                    "timestamp": datetime.now().isoformat()
                })
        
        return notifications
    
    @staticmethod
    def check_data_quality(db: Session, investment_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Check for data quality issues"""
        notifications = []
        
        if investment_id:
            investments = [db.query(Investment).filter(Investment.id == investment_id).first()]
        else:
            investments = db.query(Investment).all()
        
        for investment in investments:
            if not investment:
                continue
            
            # Check for missing ESG data
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == investment.id
            ).first()
            
            if not latest_esg:
                notifications.append({
                    "type": NotificationType.DATA_QUALITY.value,
                    "severity": NotificationSeverity.MEDIUM.value,
                    "title": f"Missing ESG Data: {investment.name}",
                    "message": "No ESG assessment data available for this investment",
                    "investment_id": investment.id,
                    "investment_name": investment.name,
                    "issue": "missing_esg",
                    "timestamp": datetime.now().isoformat()
                })
            
            # Check for missing climate risk data
            latest_risk = db.query(ClimateRisk).filter(
                ClimateRisk.investment_id == investment.id
            ).first()
            
            if not latest_risk:
                notifications.append({
                    "type": NotificationType.DATA_QUALITY.value,
                    "severity": NotificationSeverity.MEDIUM.value,
                    "title": f"Missing Climate Risk Data: {investment.name}",
                    "message": "No climate risk assessment data available for this investment",
                    "investment_id": investment.id,
                    "investment_name": investment.name,
                    "issue": "missing_climate_risk",
                    "timestamp": datetime.now().isoformat()
                })
            
            # Check for missing financial data
            if not investment.investment_amount or not investment.current_value:
                notifications.append({
                    "type": NotificationType.DATA_QUALITY.value,
                    "severity": NotificationSeverity.LOW.value,
                    "title": f"Incomplete Financial Data: {investment.name}",
                    "message": "Investment amount or current value is missing",
                    "investment_id": investment.id,
                    "investment_name": investment.name,
                    "issue": "missing_financial_data",
                    "timestamp": datetime.now().isoformat()
                })
        
        return notifications
    
    @staticmethod
    def get_all_notifications(
        db: Session,
        investment_id: Optional[int] = None,
        notification_type: Optional[str] = None,
        severity: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get all notifications with optional filtering"""
        all_notifications = []
        
        if investment_id:
            investments = [db.query(Investment).filter(Investment.id == investment_id).first()]
        else:
            investments = db.query(Investment).all()
        
        for investment in investments:
            if not investment:
                continue
            
            # Get all notification types
            all_notifications.extend(NotificationService.check_metric_changes(db, investment.id))
            all_notifications.extend(NotificationService.check_risk_thresholds(db, investment.id))
            all_notifications.extend(NotificationService.check_data_quality(db, investment.id))
        
        # Add portfolio-wide notifications
        all_notifications.extend(NotificationService.check_assessments_due(db))
        
        # Filter by type if specified
        if notification_type:
            all_notifications = [n for n in all_notifications if n['type'] == notification_type]
        
        # Filter by severity if specified
        if severity:
            all_notifications = [n for n in all_notifications if n['severity'] == severity]
        
        # Sort by severity (critical > high > medium > low > info) and timestamp
        severity_order = {
            NotificationSeverity.CRITICAL.value: 0,
            NotificationSeverity.HIGH.value: 1,
            NotificationSeverity.MEDIUM.value: 2,
            NotificationSeverity.LOW.value: 3,
            NotificationSeverity.INFO.value: 4
        }
        
        all_notifications.sort(
            key=lambda x: (severity_order.get(x['severity'], 99), x.get('timestamp', ''))
        )
        
        return all_notifications

