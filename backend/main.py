"""
Impact Investing Market Research Tool - Backend API
Main FastAPI application for portfolio management, climate risk, and impact analysis
"""

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
import uvicorn
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# Load environment variables from .env file
load_dotenv()

from database import SessionLocal, engine, Base
from models import (
    Investment, ClimateRisk, GHGEmissions, SocialImpact, ESGScore,
    PeerBenchmark, ImpactAttribution, PortfolioOptimization,
    CorrelationAnalysis, MonteCarloSimulation
)
from schemas import (
    InvestmentCreate, InvestmentResponse, InvestmentUpdate,
    ClimateRiskCreate, ClimateRiskResponse,
    GHGEmissionsCreate, GHGEmissionsResponse,
    SocialImpactCreate, SocialImpactResponse,
    ESGScoreCreate, ESGScoreResponse,
    PortfolioAnalysisResponse,
    ClimateRiskAnalysisResponse,
    InvestmentRecommendationResponse,
    PeerBenchmarkCreate, PeerBenchmarkResponse,
    ImpactAttributionCreate, ImpactAttributionResponse,
    PortfolioOptimizationCreate, PortfolioOptimizationResponse,
    CorrelationAnalysisCreate, CorrelationAnalysisResponse,
    MonteCarloSimulationCreate, MonteCarloSimulationResponse,
    InvestmentBenchmarkComparison
)
from services import (
    InvestmentService, ClimateRiskService, GHGEmissionsService,
    SocialImpactService, ESGScoreService, AnalyticsService,
    RecommendationService
)
from analytics_services import (
    PeerBenchmarkService, ImpactAttributionService,
    PortfolioOptimizationService, CorrelationAnalysisService,
    MonteCarloSimulationService
)
from data_import_services import DataImportService
from validation_rules import validation_engine
from notification_services import NotificationService
from api_integration import api_integration_service, DataProvider, DataType
from report_generation import ReportGenerationService, ReportType, ReportFrequency
from collaboration_models import User, Comment, Task, AuditLog, VersionHistory
from collaboration_schemas import (
    UserCreate, UserResponse, UserUpdate, UserLogin, Token,
    CommentCreate, CommentResponse, CommentUpdate,
    TaskCreate, TaskResponse, TaskUpdate,
    AuditLogResponse,
    VersionHistoryResponse, VersionHistoryCreate
)
from collaboration_services import (
    UserService, CommentService, TaskService,
    AuditLogService, VersionHistoryService
)
from jose import JWTError, jwt
import os

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-impact-investing")
ALGORITHM = "HS256"

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Impact Investing Research Tool API",
    description="Comprehensive API for impact investing analysis, climate risk assessment, and sustainability tracking",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================== Investment Endpoints ====================

@app.post("/api/investments", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
def create_investment(investment: InvestmentCreate, db: Session = Depends(get_db)):
    """Create a new investment in the portfolio"""
    return InvestmentService.create_investment(db, investment)

@app.get("/api/investments", response_model=List[InvestmentResponse])
def get_investments(
    skip: int = 0,
    limit: int = 100,
    sector: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all investments with optional filtering"""
    return InvestmentService.get_investments(db, skip=skip, limit=limit, sector=sector, region=region)

@app.get("/api/investments/{investment_id}", response_model=InvestmentResponse)
def get_investment(investment_id: int, db: Session = Depends(get_db)):
    """Get a specific investment by ID"""
    investment = InvestmentService.get_investment(db, investment_id)
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    return investment

@app.put("/api/investments/{investment_id}", response_model=InvestmentResponse)
def update_investment(
    investment_id: int,
    investment: InvestmentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing investment"""
    updated = InvestmentService.update_investment(db, investment_id, investment)
    if not updated:
        raise HTTPException(status_code=404, detail="Investment not found")
    return updated

@app.delete("/api/investments/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(investment_id: int, db: Session = Depends(get_db)):
    """Delete an investment"""
    success = InvestmentService.delete_investment(db, investment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Investment not found")

# ==================== Climate Risk Endpoints ====================

@app.post("/api/climate-risks", response_model=ClimateRiskResponse, status_code=status.HTTP_201_CREATED)
def create_climate_risk(risk: ClimateRiskCreate, db: Session = Depends(get_db)):
    """Create a climate risk assessment for an investment"""
    return ClimateRiskService.create_climate_risk(db, risk)

@app.get("/api/climate-risks", response_model=List[ClimateRiskResponse])
def get_climate_risks(
    investment_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get climate risk assessments, optionally filtered by investment"""
    return ClimateRiskService.get_climate_risks(db, investment_id)

@app.get("/api/climate-risks/{risk_id}", response_model=ClimateRiskResponse)
def get_climate_risk(risk_id: int, db: Session = Depends(get_db)):
    """Get a specific climate risk assessment"""
    risk = ClimateRiskService.get_climate_risk(db, risk_id)
    if not risk:
        raise HTTPException(status_code=404, detail="Climate risk not found")
    return risk

@app.get("/api/investments/{investment_id}/climate-analysis", response_model=ClimateRiskAnalysisResponse)
def get_climate_analysis(investment_id: int, db: Session = Depends(get_db)):
    """Get comprehensive climate risk analysis for an investment"""
    analysis = ClimateRiskService.get_comprehensive_analysis(db, investment_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Investment not found or no climate data")
    return analysis

# ==================== GHG Emissions Endpoints ====================

@app.post("/api/ghg-emissions", response_model=GHGEmissionsResponse, status_code=status.HTTP_201_CREATED)
def create_ghg_emissions(emissions: GHGEmissionsCreate, db: Session = Depends(get_db)):
    """Record GHG emissions for an investment"""
    return GHGEmissionsService.create_emissions(db, emissions)

@app.get("/api/ghg-emissions", response_model=List[GHGEmissionsResponse])
def get_ghg_emissions(
    investment_id: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get GHG emissions records, optionally filtered"""
    return GHGEmissionsService.get_emissions(db, investment_id, year)

@app.get("/api/investments/{investment_id}/emissions-summary")
def get_emissions_summary(investment_id: int, db: Session = Depends(get_db)):
    """Get emissions summary and trends for an investment"""
    return GHGEmissionsService.get_emissions_summary(db, investment_id)

@app.get("/api/portfolio/emissions-dashboard")
def get_portfolio_emissions_dashboard(db: Session = Depends(get_db)):
    """Get portfolio-wide emissions dashboard data"""
    return GHGEmissionsService.get_portfolio_dashboard(db)

# ==================== Social Impact Endpoints ====================

@app.post("/api/social-impacts", response_model=SocialImpactResponse, status_code=status.HTTP_201_CREATED)
def create_social_impact(impact: SocialImpactCreate, db: Session = Depends(get_db)):
    """Create a social impact assessment"""
    return SocialImpactService.create_social_impact(db, impact)

@app.get("/api/social-impacts", response_model=List[SocialImpactResponse])
def get_social_impacts(
    investment_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get social impact assessments"""
    return SocialImpactService.get_social_impacts(db, investment_id)

@app.get("/api/investments/{investment_id}/social-impact-score")
def get_social_impact_score(investment_id: int, db: Session = Depends(get_db)):
    """Get calculated social impact score for an investment"""
    return SocialImpactService.calculate_impact_score(db, investment_id)

# ==================== ESG Score Endpoints ====================

@app.post("/api/esg-scores", response_model=ESGScoreResponse, status_code=status.HTTP_201_CREATED)
def create_esg_score(score: ESGScoreCreate, db: Session = Depends(get_db)):
    """Create or update an ESG score"""
    return ESGScoreService.create_esg_score(db, score)

@app.get("/api/esg-scores", response_model=List[ESGScoreResponse])
def get_esg_scores(
    investment_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get ESG scores"""
    return ESGScoreService.get_esg_scores(db, investment_id)

@app.get("/api/investments/{investment_id}/esg-analysis")
def get_esg_analysis(investment_id: int, db: Session = Depends(get_db)):
    """Get comprehensive ESG analysis for an investment"""
    return ESGScoreService.get_esg_analysis(db, investment_id)

# ==================== Analytics & Reporting Endpoints ====================

@app.get("/api/portfolio/analysis", response_model=PortfolioAnalysisResponse)
def get_portfolio_analysis(db: Session = Depends(get_db)):
    """Get comprehensive portfolio analysis"""
    return AnalyticsService.get_portfolio_analysis(db)

@app.get("/api/portfolio/dashboard")
def get_portfolio_dashboard(db: Session = Depends(get_db)):
    """Get portfolio dashboard data with key metrics"""
    try:
        return AnalyticsService.get_portfolio_dashboard(db)
    except Exception as e:
        import traceback
        print(f"Error in get_portfolio_dashboard endpoint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating dashboard: {str(e)}")

@app.get("/api/portfolio/performance-trends")
def get_performance_trends(
    metric: str = "esg_score",
    period: str = "1y",
    db: Session = Depends(get_db)
):
    """Get performance trends for the portfolio"""
    return AnalyticsService.get_performance_trends(db, metric, period)

@app.get("/api/reports/portfolio-summary")
def generate_portfolio_summary_report(db: Session = Depends(get_db)):
    """Generate a comprehensive portfolio summary report"""
    return AnalyticsService.generate_portfolio_summary(db)

@app.get("/api/reports/climate-risk-report")
def generate_climate_risk_report(db: Session = Depends(get_db)):
    """Generate a climate risk report for the portfolio"""
    return AnalyticsService.generate_climate_risk_report(db)

@app.get("/api/reports/impact-report")
def generate_impact_report(db: Session = Depends(get_db)):
    """Generate a social impact report for the portfolio"""
    return AnalyticsService.generate_impact_report(db)

# ==================== Recommendation Endpoints ====================

@app.get("/api/investments/{investment_id}/recommendation", response_model=InvestmentRecommendationResponse)
def get_investment_recommendation(investment_id: int, db: Session = Depends(get_db)):
    """Get comprehensive investment recommendation and analysis"""
    try:
        return RecommendationService.get_investment_recommendation(db, investment_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/portfolio/recommendations")
def get_portfolio_recommendations(db: Session = Depends(get_db)):
    """Get recommendations for all investments in portfolio"""
    try:
        investments = InvestmentService.get_investments(db)
        recommendations = []
        
        for inv in investments:
            try:
                rec = RecommendationService.get_investment_recommendation(db, inv.id)
                recommendations.append({
                    "investment_id": inv.id,
                    "investment_name": inv.name,
                    "recommendation": rec.overall_recommendation.recommendation,
                    "confidence": rec.overall_recommendation.confidence,
                    "priority": rec.overall_recommendation.priority,
                    "roi": rec.financial_analysis.get("roi", 0) if rec.financial_analysis else 0
                })
            except Exception as e:
                import traceback
                print(f"Error getting recommendation for investment {inv.id}: {str(e)}")
                print(traceback.format_exc())
                continue
        
        # Sort by priority and confidence
        recommendations.sort(key=lambda x: (
            {"high": 0, "medium": 1, "low": 2}.get(x["priority"], 3),
            -x["confidence"]
        ))
        
        return {
            "total_investments": len(investments),
            "recommendations": recommendations,
            "summary": {
                "buy": len([r for r in recommendations if r["recommendation"] == "buy"]),
                "hold": len([r for r in recommendations if r["recommendation"] == "hold"]),
                "monitor": len([r for r in recommendations if r["recommendation"] == "monitor"]),
                "sell": len([r for r in recommendations if r["recommendation"] == "sell"]),
                "divest": len([r for r in recommendations if r["recommendation"] == "divest"]),
                "high_priority_count": len([r for r in recommendations if r["priority"] == "high"]),
                "medium_priority_count": len([r for r in recommendations if r["priority"] == "medium"]),
                "low_priority_count": len([r for r in recommendations if r["priority"] == "low"])
            }
        }
    except Exception as e:
        import traceback
        print(f"Error in get_portfolio_recommendations endpoint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

# ==================== Advanced Analytics Endpoints ====================

@app.post("/api/analytics/benchmarks/calculate", response_model=PeerBenchmarkResponse)
def calculate_benchmarks(
    sector: Optional[str] = None,
    industry: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Calculate peer benchmarks for a given sector/industry/region"""
    try:
        benchmark = PeerBenchmarkService.calculate_benchmarks(db, sector, industry, region)
        return benchmark
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/analytics/benchmarks", response_model=List[PeerBenchmarkResponse])
def get_benchmarks(
    sector: Optional[str] = None,
    industry: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get peer benchmarks"""
    return PeerBenchmarkService.get_benchmarks(db, sector, industry, region)


@app.get("/api/investments/{investment_id}/benchmark-comparison", response_model=InvestmentBenchmarkComparison)
def get_investment_benchmark_comparison(
    investment_id: int,
    db: Session = Depends(get_db)
):
    """Compare an investment against its peer benchmarks"""
    try:
        return PeerBenchmarkService.compare_investment_to_peers(db, investment_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/analytics/impact-attribution/calculate", response_model=ImpactAttributionResponse)
def calculate_impact_attribution(
    investment_id: int,
    attribution_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Calculate impact attribution for an investment"""
    try:
        return ImpactAttributionService.calculate_attribution(db, investment_id, attribution_date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/analytics/impact-attribution", response_model=List[ImpactAttributionResponse])
def get_impact_attributions(
    investment_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get impact attributions"""
    return ImpactAttributionService.get_attribution(db, investment_id)


@app.post("/api/analytics/portfolio-optimization", response_model=PortfolioOptimizationResponse)
def optimize_portfolio(
    target_impact_score: Optional[float] = None,
    target_esg_score: Optional[float] = None,
    max_climate_risk: Optional[float] = None,
    min_roi_threshold: Optional[float] = None,
    optimization_method: str = "impact_weighted",
    created_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Generate portfolio optimization suggestions"""
    try:
        return PortfolioOptimizationService.optimize_portfolio(
            db, target_impact_score, target_esg_score,
            max_climate_risk, min_roi_threshold,
            optimization_method, created_by
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/analytics/portfolio-optimization", response_model=List[PortfolioOptimizationResponse])
def get_portfolio_optimizations(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get recent portfolio optimization analyses"""
    return PortfolioOptimizationService.get_optimizations(db, limit)


@app.post("/api/analytics/correlation-analysis", response_model=CorrelationAnalysisResponse)
def calculate_correlations(db: Session = Depends(get_db)):
    """Calculate correlations between ESG, climate, and financial metrics"""
    try:
        return CorrelationAnalysisService.calculate_correlations(db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/analytics/correlation-analysis/latest", response_model=Optional[CorrelationAnalysisResponse])
def get_latest_correlation_analysis(db: Session = Depends(get_db)):
    """Get the latest correlation analysis"""
    return CorrelationAnalysisService.get_latest_analysis(db)


@app.post("/api/analytics/monte-carlo", response_model=MonteCarloSimulationResponse)
def run_monte_carlo_simulation(
    simulation_name: str,
    num_iterations: int = 10000,
    time_horizon_years: int = 5,
    scenario_type: str = "baseline",
    climate_scenario: Optional[str] = None,
    market_volatility: float = 0.15,
    created_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Run Monte Carlo simulation for portfolio scenarios"""
    try:
        return MonteCarloSimulationService.run_simulation(
            db, simulation_name, num_iterations, time_horizon_years,
            scenario_type, climate_scenario, market_volatility, created_by
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/analytics/monte-carlo", response_model=List[MonteCarloSimulationResponse])
def get_monte_carlo_simulations(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get recent Monte Carlo simulations"""
    return MonteCarloSimulationService.get_simulations(db, limit)


@app.get("/api/analytics/monte-carlo/{simulation_id}", response_model=MonteCarloSimulationResponse)
def get_monte_carlo_simulation(
    simulation_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific Monte Carlo simulation"""
    simulation = MonteCarloSimulationService.get_simulation(db, simulation_id)
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return simulation

# ==================== Data Validation Endpoints ====================

@app.post("/api/validation/validate")
def validate_data(
    data_type: str,
    data: dict,
    db: Session = Depends(get_db)
):
    """Validate data against validation rules"""
    try:
        result = validation_engine.validate_data(data_type, data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")

@app.post("/api/validation/validate-batch")
def validate_batch_data(
    data_type: str,
    data_list: List[dict],
    db: Session = Depends(get_db)
):
    """Validate a batch of records"""
    try:
        result = validation_engine.validate_batch(data_type, data_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")

# ==================== Notification Endpoints ====================

@app.get("/api/notifications")
def get_notifications(
    investment_id: Optional[int] = None,
    notification_type: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all notifications with optional filtering"""
    try:
        notifications = NotificationService.get_all_notifications(
            db, investment_id, notification_type, severity
        )
        return {
            "notifications": notifications,
            "total": len(notifications),
            "critical": len([n for n in notifications if n['severity'] == 'critical']),
            "high": len([n for n in notifications if n['severity'] == 'high']),
            "medium": len([n for n in notifications if n['severity'] == 'medium']),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")

@app.get("/api/investments/{investment_id}/notifications")
def get_investment_notifications(
    investment_id: int,
    db: Session = Depends(get_db)
):
    """Get notifications for a specific investment"""
    try:
        metric_changes = NotificationService.check_metric_changes(db, investment_id)
        risk_thresholds = NotificationService.check_risk_thresholds(db, investment_id)
        data_quality = NotificationService.check_data_quality(db, investment_id)
        
        all_notifications = metric_changes + risk_thresholds + data_quality
        
        return {
            "investment_id": investment_id,
            "notifications": all_notifications,
            "total": len(all_notifications)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")

# ==================== API Integration Endpoints ====================

@app.get("/api/integrations/providers")
def list_api_providers():
    """List all available API providers"""
    try:
        providers = api_integration_service.list_providers()
        return {
            "providers": providers,
            "total": len(providers)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing providers: {str(e)}")

@app.post("/api/integrations/fetch")
def fetch_external_data(
    provider: str,
    data_type: str,
    company_name: str,
    isin: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Fetch data from an external API provider"""
    try:
        result = api_integration_service.fetch_data(
            provider_name=provider,
            data_type=data_type,
            company_name=company_name,
            isin=isin,
            year=year or datetime.now().year
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@app.post("/api/integrations/configure")
def configure_api_provider(
    provider: str,
    api_key: str,
    base_url: Optional[str] = None
):
    """Configure an API provider with credentials"""
    try:
        result = api_integration_service.configure_provider(
            provider_name=provider,
            api_key=api_key,
            base_url=base_url
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error configuring provider: {str(e)}")

@app.get("/api/integrations/test/{provider}")
def test_api_connection(provider: str):
    """Test connection to an API provider"""
    try:
        api_provider = api_integration_service.get_provider(provider)
        if not api_provider:
            raise HTTPException(status_code=404, detail=f"Provider '{provider}' not found")
        
        is_connected = api_provider.test_connection()
        return {
            "provider": provider,
            "connected": is_connected,
            "message": "Connection successful" if is_connected else "Connection failed or not configured"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error testing connection: {str(e)}")

# ==================== Data Import Endpoints ====================

@app.post("/api/data-import/parse")
async def parse_import_file(
    file: UploadFile = File(...),
    data_type: str = "investment"
):
    """Parse CSV/Excel file and return field mapping suggestions"""
    try:
        file_content = await file.read()
        df = DataImportService.parse_file(file_content, file.filename)
        
        # Get field mapping suggestions
        suggestions = DataImportService.get_field_mapping_suggestions(df, data_type)
        
        # Get validation results
        validation = DataImportService.validate_import_data(df, {}, data_type)
        
        return {
            "columns": list(df.columns),
            "row_count": len(df),
            "field_suggestions": suggestions,
            "validation": validation,
            "sample_data": df.head(5).to_dict(orient='records')
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/data-import/import")
async def import_data(
    file: UploadFile = File(...),
    data_type: str = Form("investment"),
    field_mapping_json: str = Form(...),
    skip_errors: bool = Form(True),
    db: Session = Depends(get_db)
):
    """Import data from CSV/Excel file"""
    try:
        import json
        field_mapping = json.loads(field_mapping_json)
        
        file_content = await file.read()
        df = DataImportService.parse_file(file_content, file.filename)
        
        if not field_mapping:
            raise HTTPException(status_code=400, detail="Field mapping is required")
        
        # Validate
        validation = DataImportService.validate_import_data(df, field_mapping, data_type)
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=f"Validation failed: {validation['errors']}")
        
        # Import based on data type
        if data_type == "investment":
            results = DataImportService.import_investments(db, df, field_mapping, skip_errors)
        elif data_type == "climate_risk":
            results = DataImportService.import_climate_risks(db, df, field_mapping, None, skip_errors)
        elif data_type == "esg_score":
            # Similar implementation for other types
            results = {"success": 0, "errors": [], "skipped": 0, "message": "Not yet implemented"}
        elif data_type == "emissions":
            results = {"success": 0, "errors": [], "skipped": 0, "message": "Not yet implemented"}
        elif data_type == "social_impact":
            results = {"success": 0, "errors": [], "skipped": 0, "message": "Not yet implemented"}
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported data type: {data_type}")
        
        return {
            "success": True,
            "results": results,
            "warnings": validation.get('warnings', [])
        }
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in field_mapping")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


# ==================== Report Generation Endpoints ====================

@app.get("/api/reports/generate")
def generate_report(
    report_type: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Generate a report"""
    try:
        report = ReportGenerationService.generate_report(
            report_type=report_type,
            db=db,
            start_date=start_date,
            end_date=end_date,
            year=year
        )
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@app.get("/api/reports/portfolio-summary")
def get_portfolio_summary_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Generate portfolio summary report"""
    try:
        report = ReportGenerationService.generate_portfolio_summary(db, start_date, end_date)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@app.get("/api/reports/climate-risk")
def get_climate_risk_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Generate climate risk report"""
    try:
        report = ReportGenerationService.generate_climate_risk_report(db, start_date, end_date)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@app.get("/api/reports/esg-performance")
def get_esg_performance_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Generate ESG performance report"""
    try:
        report = ReportGenerationService.generate_esg_performance_report(db, start_date, end_date)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@app.get("/api/reports/emissions")
def get_emissions_report(
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Generate emissions report"""
    try:
        report = ReportGenerationService.generate_emissions_report(db, year)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@app.get("/api/reports/comprehensive")
def get_comprehensive_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Generate comprehensive report"""
    try:
        report = ReportGenerationService.generate_comprehensive_report(db, start_date, end_date)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

# ==================== User Authentication Endpoints ====================

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    """Get current authenticated user from JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
    except JWTError:
        return None
    
    user = UserService.get_user_by_username(db, username)
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user or not current_user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    return current_user

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    if UserService.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if UserService.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return UserService.create_user(db, user)

@app.post("/api/auth/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    user = UserService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = UserService.create_access_token(data={"sub": user.username})
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@app.get("/api/users", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users (admin only)"""
    return UserService.get_users(db, skip=skip, limit=limit)

# ==================== Comment Endpoints ====================

@app.post("/api/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new comment"""
    db_comment = CommentService.create_comment(db, comment, current_user.id)
    # Add user name for response
    response = CommentResponse.model_validate(db_comment)
    response.user_name = current_user.full_name or current_user.username
    return response

@app.get("/api/comments", response_model=List[CommentResponse])
def get_comments(
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get comments with optional filtering"""
    comments = CommentService.get_comments(db, entity_type, entity_id, skip, limit)
    result = []
    for comment in comments:
        response = CommentResponse.model_validate(comment)
        if comment.user:
            response.user_name = comment.user.full_name or comment.user.username
        result.append(response)
    return result

@app.put("/api/comments/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a comment"""
    db_comment = CommentService.update_comment(db, comment_id, comment_update, current_user.id)
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found or unauthorized")
    response = CommentResponse.model_validate(db_comment)
    response.user_name = current_user.full_name or current_user.username
    return response

@app.delete("/api/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a comment"""
    is_admin = current_user.role == "admin"
    success = CommentService.delete_comment(db, comment_id, current_user.id, is_admin)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found or unauthorized")
    return {"message": "Comment deleted"}

# ==================== Task Endpoints ====================

@app.post("/api/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new task"""
    db_task = TaskService.create_task(db, task, current_user.id)
    response = TaskResponse.model_validate(db_task)
    if db_task.created_by_user:
        response.created_by_name = db_task.created_by_user.full_name or db_task.created_by_user.username
    if db_task.assigned_to_user:
        response.assigned_to_name = db_task.assigned_to_user.full_name or db_task.assigned_to_user.username
    if db_task.investment:
        response.investment_name = db_task.investment.name
    return response

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(
    investment_id: Optional[int] = None,
    assigned_to_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get tasks with optional filtering"""
    tasks = TaskService.get_tasks(db, investment_id, assigned_to_id, status, skip, limit)
    result = []
    for task in tasks:
        response = TaskResponse.model_validate(task)
        if task.created_by_user:
            response.created_by_name = task.created_by_user.full_name or task.created_by_user.username
        if task.assigned_to_user:
            response.assigned_to_name = task.assigned_to_user.full_name or task.assigned_to_user.username
        if task.investment:
            response.investment_name = task.investment.name
        result.append(response)
    return result

@app.put("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db)
):
    """Update a task"""
    db_task = TaskService.update_task(db, task_id, task_update)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    response = TaskResponse.model_validate(db_task)
    if db_task.created_by_user:
        response.created_by_name = db_task.created_by_user.full_name or db_task.created_by_user.username
    if db_task.assigned_to_user:
        response.assigned_to_name = db_task.assigned_to_user.full_name or db_task.assigned_to_user.username
    if db_task.investment:
        response.investment_name = db_task.investment.name
    return response

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    success = TaskService.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

# ==================== Audit Log Endpoints ====================

@app.get("/api/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get audit logs with optional filtering"""
    logs = AuditLogService.get_audit_logs(db, entity_type, entity_id, user_id, action, skip, limit)
    result = []
    for log in logs:
        response = AuditLogResponse.model_validate(log)
        if log.user:
            response.user_name = log.user.full_name or log.user.username
        result.append(response)
    return result

# ==================== Version History Endpoints ====================

@app.get("/api/versions/{entity_type}/{entity_id}", response_model=List[VersionHistoryResponse])
def get_versions(
    entity_type: str,
    entity_id: int,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get version history for an entity"""
    versions = VersionHistoryService.get_versions(db, entity_type, entity_id, limit)
    result = []
    for version in versions:
        response = VersionHistoryResponse.model_validate(version)
        if version.user:
            response.user_name = version.user.full_name or version.user.username
        result.append(response)
    return result

@app.get("/api/versions/{version_id}/restore")
def get_version_data(version_id: int, db: Session = Depends(get_db)):
    """Get entity data from a version (for restoration)"""
    data = VersionHistoryService.restore_version(db, version_id)
    if not data:
        raise HTTPException(status_code=404, detail="Version not found")
    return {"entity_data": data}

# ==================== Health Check ====================

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import os
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    reload = os.getenv("API_RELOAD", "true").lower() == "true"
    uvicorn.run("main:app", host=host, port=port, reload=reload)

