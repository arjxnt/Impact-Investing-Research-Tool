"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import date, datetime


# ==================== Investment Schemas ====================

class InvestmentBase(BaseModel):
    name: str
    company_name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    investment_type: Optional[str] = None
    investment_date: Optional[date] = None
    investment_amount: Optional[float] = None
    current_value: Optional[float] = None
    ownership_percentage: Optional[float] = None
    description: Optional[str] = None
    website: Optional[str] = None
    status: str = "active"


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    investment_type: Optional[str] = None
    investment_date: Optional[date] = None
    investment_amount: Optional[float] = None
    current_value: Optional[float] = None
    ownership_percentage: Optional[float] = None
    description: Optional[str] = None
    website: Optional[str] = None
    status: Optional[str] = None


class InvestmentResponse(InvestmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Climate Risk Schemas ====================

class ClimateRiskBase(BaseModel):
    investment_id: int
    assessment_date: date
    physical_risk_score: Optional[float] = Field(None, ge=0, le=10)
    flood_risk: Optional[float] = Field(None, ge=0, le=10)
    drought_risk: Optional[float] = Field(None, ge=0, le=10)
    extreme_weather_risk: Optional[float] = Field(None, ge=0, le=10)
    sea_level_rise_risk: Optional[float] = Field(None, ge=0, le=10)
    heat_stress_risk: Optional[float] = Field(None, ge=0, le=10)
    transition_risk_score: Optional[float] = Field(None, ge=0, le=10)
    policy_risk: Optional[float] = Field(None, ge=0, le=10)
    technology_risk: Optional[float] = Field(None, ge=0, le=10)
    market_risk: Optional[float] = Field(None, ge=0, le=10)
    reputation_risk: Optional[float] = Field(None, ge=0, le=10)
    climate_opportunity_score: Optional[float] = Field(None, ge=0, le=10)
    adaptation_opportunities: Optional[str] = None
    mitigation_opportunities: Optional[str] = None
    scenario_1_5c_impact: Optional[float] = None
    scenario_2c_impact: Optional[float] = None
    scenario_3c_impact: Optional[float] = None
    mitigation_strategies: Optional[str] = None
    risk_management_plan: Optional[str] = None
    notes: Optional[str] = None
    assessed_by: Optional[str] = None


class ClimateRiskCreate(ClimateRiskBase):
    pass


class ClimateRiskResponse(ClimateRiskBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ClimateRiskAnalysisResponse(BaseModel):
    investment_id: int
    investment_name: str
    latest_assessment: Optional[ClimateRiskResponse] = None
    overall_risk_level: str  # low, medium, high, critical
    risk_trend: str  # improving, stable, worsening
    key_risks: List[str]
    key_opportunities: List[str]
    recommended_actions: List[str]


# ==================== GHG Emissions Schemas ====================

class GHGEmissionsBase(BaseModel):
    investment_id: int
    reporting_year: int
    reporting_period_start: Optional[date] = None
    reporting_period_end: Optional[date] = None
    scope1_emissions: Optional[float] = None
    scope1_breakdown: Optional[Dict[str, Any]] = None
    scope2_emissions: Optional[float] = None
    scope2_location_based: Optional[float] = None
    scope2_market_based: Optional[float] = None
    scope3_emissions: Optional[float] = None
    scope3_breakdown: Optional[Dict[str, Any]] = None
    total_emissions: Optional[float] = None
    revenue: Optional[float] = None
    employees: Optional[int] = None
    emissions_intensity_revenue: Optional[float] = None
    emissions_intensity_employee: Optional[float] = None
    reduction_target_year: Optional[int] = None
    reduction_target_percentage: Optional[float] = None
    baseline_year: Optional[int] = None
    baseline_emissions: Optional[float] = None
    verification_status: Optional[str] = None
    verification_body: Optional[str] = None
    methodology: Optional[str] = None
    notes: Optional[str] = None


class GHGEmissionsCreate(GHGEmissionsBase):
    pass


class GHGEmissionsResponse(GHGEmissionsBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Social Impact Schemas ====================

class SocialImpactBase(BaseModel):
    investment_id: int
    assessment_date: date
    sdg_alignment: Optional[Dict[str, float]] = None
    primary_sdgs: Optional[str] = None
    total_employees: Optional[int] = None
    direct_employees: Optional[int] = None
    indirect_employees: Optional[int] = None
    jobs_created: Optional[int] = None
    average_wage: Optional[float] = None
    living_wage_compliance: Optional[bool] = None
    union_presence: Optional[bool] = None
    labor_rights_score: Optional[float] = Field(None, ge=0, le=10)
    communities_served: Optional[int] = None
    local_procurement_percentage: Optional[float] = None
    community_investment_amount: Optional[float] = None
    community_engagement_score: Optional[float] = Field(None, ge=0, le=10)
    beneficiaries_reached: Optional[int] = None
    underserved_populations_served: Optional[int] = None
    affordability_score: Optional[float] = Field(None, ge=0, le=10)
    accessibility_score: Optional[float] = Field(None, ge=0, le=10)
    gender_diversity_score: Optional[float] = Field(None, ge=0, le=10)
    racial_ethnic_diversity_score: Optional[float] = Field(None, ge=0, le=10)
    leadership_diversity: Optional[float] = None
    workplace_safety_score: Optional[float] = Field(None, ge=0, le=10)
    incidents_rate: Optional[float] = None
    health_programs: Optional[bool] = None
    overall_impact_score: Optional[float] = Field(None, ge=0, le=10)
    impact_metrics: Optional[Dict[str, Any]] = None
    impact_story: Optional[str] = None
    challenges: Optional[str] = None
    opportunities: Optional[str] = None
    assessed_by: Optional[str] = None


class SocialImpactCreate(SocialImpactBase):
    pass


class SocialImpactResponse(SocialImpactBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== ESG Score Schemas ====================

class ESGScoreBase(BaseModel):
    investment_id: int
    assessment_date: date
    overall_esg_score: Optional[float] = Field(None, ge=0, le=100)
    environmental_score: Optional[float] = Field(None, ge=0, le=100)
    climate_change_score: Optional[float] = Field(None, ge=0, le=100)
    resource_use_score: Optional[float] = Field(None, ge=0, le=100)
    pollution_waste_score: Optional[float] = Field(None, ge=0, le=100)
    biodiversity_score: Optional[float] = Field(None, ge=0, le=100)
    social_score: Optional[float] = Field(None, ge=0, le=100)
    human_rights_score: Optional[float] = Field(None, ge=0, le=100)
    labor_practices_score: Optional[float] = Field(None, ge=0, le=100)
    product_safety_score: Optional[float] = Field(None, ge=0, le=100)
    community_relations_score: Optional[float] = Field(None, ge=0, le=100)
    governance_score: Optional[float] = Field(None, ge=0, le=100)
    board_structure_score: Optional[float] = Field(None, ge=0, le=100)
    executive_compensation_score: Optional[float] = Field(None, ge=0, le=100)
    audit_risk_score: Optional[float] = Field(None, ge=0, le=100)
    business_ethics_score: Optional[float] = Field(None, ge=0, le=100)
    transparency_score: Optional[float] = Field(None, ge=0, le=100)
    material_risks: Optional[List[str]] = None
    risk_severity: Optional[float] = Field(None, ge=0, le=10)
    risk_mitigation_status: Optional[str] = None
    gri_aligned: Optional[bool] = None
    sasb_aligned: Optional[bool] = None
    tcfd_aligned: Optional[bool] = None
    frameworks_used: Optional[List[str]] = None
    score_trend: Optional[str] = None
    year_over_year_change: Optional[float] = None
    assessment_methodology: Optional[str] = None
    data_quality: Optional[str] = None
    assessed_by: Optional[str] = None
    notes: Optional[str] = None


class ESGScoreCreate(ESGScoreBase):
    pass


class ESGScoreResponse(ESGScoreBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Analytics Schemas ====================

class PortfolioAnalysisResponse(BaseModel):
    total_investments: int
    total_investment_value: float
    average_esg_score: Optional[float] = None
    average_climate_risk_score: Optional[float] = None
    total_portfolio_emissions: Optional[float] = None
    average_social_impact_score: Optional[float] = None
    sector_distribution: Dict[str, int]
    region_distribution: Dict[str, int]
    risk_distribution: Dict[str, int]
    top_performers: List[Dict[str, Any]]
    areas_for_improvement: List[Dict[str, Any]]


# ==================== Recommendation Schemas ====================

class InvestmentRecommendation(BaseModel):
    recommendation: str  # "hold", "buy", "sell", "monitor", "divest"
    confidence: float  # 0-100
    reasoning: List[str]
    key_risks: List[str]
    key_opportunities: List[str]
    action_items: List[str]
    financial_impact: Optional[str] = None
    timeline: Optional[str] = None
    priority: str  # "high", "medium", "low"


class InvestmentRecommendationResponse(BaseModel):
    investment_id: int
    investment_name: str
    overall_recommendation: InvestmentRecommendation
    esg_analysis: Dict[str, Any]
    climate_risk_analysis: Dict[str, Any]
    financial_analysis: Dict[str, Any]
    social_impact_analysis: Dict[str, Any]
    comparison_to_portfolio: Dict[str, Any]


# ==================== Advanced Analytics Schemas ====================

class PeerBenchmarkBase(BaseModel):
    sector: str
    industry: Optional[str] = None
    region: Optional[str] = None
    benchmark_date: date
    avg_esg_score: Optional[float] = None
    median_esg_score: Optional[float] = None
    percentile_25_esg: Optional[float] = None
    percentile_75_esg: Optional[float] = None
    avg_physical_risk: Optional[float] = None
    avg_transition_risk: Optional[float] = None
    avg_climate_opportunity: Optional[float] = None
    avg_roi: Optional[float] = None
    median_roi: Optional[float] = None
    avg_investment_size: Optional[float] = None
    avg_impact_score: Optional[float] = None
    avg_beneficiaries: Optional[float] = None
    avg_emissions_intensity: Optional[float] = None
    median_emissions_intensity: Optional[float] = None
    sample_size: Optional[int] = None
    data_source: Optional[str] = None
    notes: Optional[str] = None


class PeerBenchmarkCreate(PeerBenchmarkBase):
    pass


class PeerBenchmarkResponse(PeerBenchmarkBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvestmentBenchmarkComparison(BaseModel):
    """Comparison of an investment against its peer benchmarks"""
    investment_id: int
    investment_name: str
    sector: str
    industry: Optional[str] = None
    region: Optional[str] = None
    
    # Investment Metrics
    investment_esg_score: Optional[float] = None
    investment_physical_risk: Optional[float] = None
    investment_transition_risk: Optional[float] = None
    investment_roi: Optional[float] = None
    investment_impact_score: Optional[float] = None
    
    # Benchmark Metrics
    benchmark: Optional[PeerBenchmarkResponse] = None
    
    # Comparison
    esg_percentile: Optional[float] = None  # Where investment ranks (0-100)
    risk_percentile: Optional[float] = None
    roi_percentile: Optional[float] = None
    impact_percentile: Optional[float] = None
    
    # Insights
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommendations: List[str] = []


class ImpactAttributionBase(BaseModel):
    investment_id: int
    attribution_date: date
    sdg_contributions: Optional[Dict[str, float]] = None
    primary_sdg_contribution: Optional[int] = None
    secondary_sdg_contributions: Optional[List[int]] = None
    total_impact_score: Optional[float] = None
    beneficiaries_attributed: Optional[int] = None
    jobs_attributed: Optional[int] = None
    emissions_reduction_attributed: Optional[float] = None
    portfolio_impact_percentage: Optional[float] = None
    portfolio_esg_contribution: Optional[float] = None
    portfolio_climate_contribution: Optional[float] = None
    attribution_method: Optional[str] = None
    confidence_level: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None


class ImpactAttributionCreate(ImpactAttributionBase):
    pass


class ImpactAttributionResponse(ImpactAttributionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioOptimizationBase(BaseModel):
    analysis_date: date
    target_impact_score: Optional[float] = None
    target_esg_score: Optional[float] = None
    max_climate_risk: Optional[float] = None
    min_roi_threshold: Optional[float] = None
    current_impact_score: Optional[float] = None
    current_esg_score: Optional[float] = None
    current_climate_risk: Optional[float] = None
    current_roi: Optional[float] = None
    suggested_rebalancing: Optional[Dict[str, float]] = None
    suggested_additions: Optional[List[int]] = None
    suggested_reductions: Optional[List[int]] = None
    optimized_impact_score: Optional[float] = None
    optimized_esg_score: Optional[float] = None
    optimized_climate_risk: Optional[float] = None
    optimized_roi: Optional[float] = None
    optimization_method: Optional[str] = None
    constraints: Optional[Dict[str, Any]] = None
    analysis_notes: Optional[str] = None
    created_by: Optional[str] = None


class PortfolioOptimizationCreate(PortfolioOptimizationBase):
    pass


class PortfolioOptimizationResponse(PortfolioOptimizationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CorrelationAnalysisBase(BaseModel):
    analysis_date: date
    correlation_matrix: Optional[Dict[str, float]] = None
    esg_roi_correlation: Optional[float] = None
    climate_risk_roi_correlation: Optional[float] = None
    impact_roi_correlation: Optional[float] = None
    esg_climate_correlation: Optional[float] = None
    p_values: Optional[Dict[str, float]] = None
    sample_size: Optional[int] = None
    key_insights: Optional[List[str]] = None
    recommendations: Optional[str] = None


class CorrelationAnalysisCreate(CorrelationAnalysisBase):
    pass


class CorrelationAnalysisResponse(CorrelationAnalysisBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MonteCarloSimulationBase(BaseModel):
    simulation_name: str
    simulation_date: date
    num_iterations: int = 10000
    time_horizon_years: int = 5
    confidence_levels: Optional[List[int]] = None
    scenario_type: Optional[str] = None
    climate_scenario: Optional[str] = None
    market_volatility: Optional[float] = None
    expected_roi: Optional[float] = None
    roi_std_dev: Optional[float] = None
    roi_percentiles: Optional[Dict[str, float]] = None
    expected_impact_score: Optional[float] = None
    impact_score_std_dev: Optional[float] = None
    impact_score_percentiles: Optional[Dict[str, float]] = None
    expected_esg_score: Optional[float] = None
    esg_score_std_dev: Optional[float] = None
    value_at_risk_95: Optional[float] = None
    value_at_risk_99: Optional[float] = None
    conditional_var_95: Optional[float] = None
    probability_positive_roi: Optional[float] = None
    probability_target_impact: Optional[float] = None
    probability_risk_threshold: Optional[float] = None
    iteration_results: Optional[Dict[str, Any]] = None
    scenario_analysis: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None


class MonteCarloSimulationCreate(MonteCarloSimulationBase):
    pass


class MonteCarloSimulationResponse(MonteCarloSimulationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

