"""
Database models for Impact Investing Research Tool
"""

from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime, ForeignKey, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    company_name = Column(String(200), nullable=False)
    sector = Column(String(100), index=True)
    industry = Column(String(100))
    region = Column(String(100), index=True)
    country = Column(String(100))
    investment_type = Column(String(50))  # Equity, Debt, Hybrid, etc.
    investment_date = Column(Date)
    investment_amount = Column(Float)
    current_value = Column(Float)
    ownership_percentage = Column(Float)
    description = Column(Text)
    website = Column(String(255))
    status = Column(String(50), default="active")  # active, exited, under_review
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    climate_risks = relationship("ClimateRisk", back_populates="investment", cascade="all, delete-orphan")
    ghg_emissions = relationship("GHGEmissions", back_populates="investment", cascade="all, delete-orphan")
    social_impacts = relationship("SocialImpact", back_populates="investment", cascade="all, delete-orphan")
    esg_scores = relationship("ESGScore", back_populates="investment", cascade="all, delete-orphan")


class ClimateRisk(Base):
    __tablename__ = "climate_risks"

    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=False, index=True)
    assessment_date = Column(Date, nullable=False)
    
    # Physical Risk Scores (1-10 scale)
    physical_risk_score = Column(Float)  # Overall physical risk
    flood_risk = Column(Float)
    drought_risk = Column(Float)
    extreme_weather_risk = Column(Float)
    sea_level_rise_risk = Column(Float)
    heat_stress_risk = Column(Float)
    
    # Transition Risk Scores (1-10 scale)
    transition_risk_score = Column(Float)  # Overall transition risk
    policy_risk = Column(Float)  # Carbon pricing, regulations
    technology_risk = Column(Float)  # Disruptive technologies
    market_risk = Column(Float)  # Changing consumer preferences
    reputation_risk = Column(Float)
    
    # Opportunities
    climate_opportunity_score = Column(Float)  # 1-10 scale
    adaptation_opportunities = Column(Text)
    mitigation_opportunities = Column(Text)
    
    # Scenario Analysis
    scenario_1_5c_impact = Column(Float)  # Impact under 1.5°C scenario
    scenario_2c_impact = Column(Float)  # Impact under 2°C scenario
    scenario_3c_impact = Column(Float)  # Impact under 3°C+ scenario
    
    # Risk Mitigation
    mitigation_strategies = Column(Text)
    risk_management_plan = Column(Text)
    
    # Additional Data
    notes = Column(Text)
    assessed_by = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    investment = relationship("Investment", back_populates="climate_risks")


class GHGEmissions(Base):
    __tablename__ = "ghg_emissions"

    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=False, index=True)
    reporting_year = Column(Integer, nullable=False, index=True)
    reporting_period_start = Column(Date)
    reporting_period_end = Column(Date)
    
    # Scope 1 Emissions (Direct)
    scope1_emissions = Column(Float)  # tCO2e
    scope1_breakdown = Column(JSON)  # Detailed breakdown
    
    # Scope 2 Emissions (Indirect - Energy)
    scope2_emissions = Column(Float)  # tCO2e
    scope2_location_based = Column(Float)
    scope2_market_based = Column(Float)
    
    # Scope 3 Emissions (Other Indirect)
    scope3_emissions = Column(Float)  # tCO2e
    scope3_breakdown = Column(JSON)  # Categories 1-15
    
    # Total Emissions
    total_emissions = Column(Float)  # tCO2e
    
    # Intensity Metrics
    revenue = Column(Float)  # For intensity calculation
    employees = Column(Integer)  # For per-employee metrics
    emissions_intensity_revenue = Column(Float)  # tCO2e / $ revenue
    emissions_intensity_employee = Column(Float)  # tCO2e / employee
    
    # Targets
    reduction_target_year = Column(Integer)
    reduction_target_percentage = Column(Float)
    baseline_year = Column(Integer)
    baseline_emissions = Column(Float)
    
    # Verification
    verification_status = Column(String(50))  # verified, self-reported, estimated
    verification_body = Column(String(200))
    methodology = Column(String(100))  # GHG Protocol, ISO 14064, etc.
    
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    investment = relationship("Investment", back_populates="ghg_emissions")


class SocialImpact(Base):
    __tablename__ = "social_impacts"

    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=False, index=True)
    assessment_date = Column(Date, nullable=False)
    
    # SDG Alignment (1-17)
    sdg_alignment = Column(JSON)  # {sdg_number: score (1-10)}
    primary_sdgs = Column(String(100))  # Comma-separated SDG numbers
    
    # Employment & Labor
    total_employees = Column(Integer)
    direct_employees = Column(Integer)
    indirect_employees = Column(Integer)  # Through supply chain
    jobs_created = Column(Integer)
    average_wage = Column(Float)
    living_wage_compliance = Column(Boolean)
    union_presence = Column(Boolean)
    labor_rights_score = Column(Float)  # 1-10
    
    # Community Impact
    communities_served = Column(Integer)
    local_procurement_percentage = Column(Float)
    community_investment_amount = Column(Float)
    community_engagement_score = Column(Float)  # 1-10
    
    # Product/Service Impact
    beneficiaries_reached = Column(Integer)
    underserved_populations_served = Column(Integer)
    affordability_score = Column(Float)  # 1-10
    accessibility_score = Column(Float)  # 1-10
    
    # Diversity & Inclusion
    gender_diversity_score = Column(Float)  # 1-10
    racial_ethnic_diversity_score = Column(Float)  # 1-10
    leadership_diversity = Column(Float)  # Percentage diverse leadership
    
    # Health & Safety
    workplace_safety_score = Column(Float)  # 1-10
    incidents_rate = Column(Float)  # Per 1000 employees
    health_programs = Column(Boolean)
    
    # Overall Impact Score
    overall_impact_score = Column(Float)  # Calculated composite score 1-10
    
    # Additional Metrics
    impact_metrics = Column(JSON)  # Custom metrics
    impact_story = Column(Text)
    challenges = Column(Text)
    opportunities = Column(Text)
    
    assessed_by = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    investment = relationship("Investment", back_populates="social_impacts")


class ESGScore(Base):
    __tablename__ = "esg_scores"

    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=False, index=True)
    assessment_date = Column(Date, nullable=False, index=True)
    
    # Overall ESG Score (0-100)
    overall_esg_score = Column(Float)
    
    # Environmental Score (0-100)
    environmental_score = Column(Float)
    climate_change_score = Column(Float)
    resource_use_score = Column(Float)
    pollution_waste_score = Column(Float)
    biodiversity_score = Column(Float)
    
    # Social Score (0-100)
    social_score = Column(Float)
    human_rights_score = Column(Float)
    labor_practices_score = Column(Float)
    product_safety_score = Column(Float)
    community_relations_score = Column(Float)
    
    # Governance Score (0-100)
    governance_score = Column(Float)
    board_structure_score = Column(Float)
    executive_compensation_score = Column(Float)
    audit_risk_score = Column(Float)
    business_ethics_score = Column(Float)
    transparency_score = Column(Float)
    
    # Risk Assessment
    material_risks = Column(JSON)  # List of material ESG risks
    risk_severity = Column(Float)  # Overall risk severity 1-10
    risk_mitigation_status = Column(String(50))  # managed, in_progress, not_addressed
    
    # Framework Alignment
    gri_aligned = Column(Boolean)
    sasb_aligned = Column(Boolean)
    tcfd_aligned = Column(Boolean)
    frameworks_used = Column(JSON)
    
    # Trend Analysis
    score_trend = Column(String(20))  # improving, stable, declining
    year_over_year_change = Column(Float)
    
    # Additional Data
    assessment_methodology = Column(String(100))
    data_quality = Column(String(50))  # high, medium, low
    assessed_by = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    investment = relationship("Investment", back_populates="esg_scores")


# ==================== Advanced Analytics Models ====================

class PeerBenchmark(Base):
    """Benchmark data for comparing investments against sector/industry peers"""
    __tablename__ = "peer_benchmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String(100), nullable=False, index=True)
    industry = Column(String(100), index=True)
    region = Column(String(100), index=True)
    benchmark_date = Column(Date, nullable=False, index=True)
    
    # ESG Benchmarks
    avg_esg_score = Column(Float)
    median_esg_score = Column(Float)
    percentile_25_esg = Column(Float)
    percentile_75_esg = Column(Float)
    
    # Climate Risk Benchmarks
    avg_physical_risk = Column(Float)
    avg_transition_risk = Column(Float)
    avg_climate_opportunity = Column(Float)
    
    # Financial Benchmarks
    avg_roi = Column(Float)
    median_roi = Column(Float)
    avg_investment_size = Column(Float)
    
    # Social Impact Benchmarks
    avg_impact_score = Column(Float)
    avg_beneficiaries = Column(Float)
    
    # Emissions Benchmarks
    avg_emissions_intensity = Column(Float)
    median_emissions_intensity = Column(Float)
    
    # Sample size
    sample_size = Column(Integer)
    
    # Metadata
    data_source = Column(String(100))  # internal, external, hybrid
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ImpactAttribution(Base):
    """Track each investment's contribution to SDG goals and portfolio impact"""
    __tablename__ = "impact_attributions"
    
    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=False, index=True)
    attribution_date = Column(Date, nullable=False, index=True)
    
    # SDG Contributions (1-17)
    sdg_contributions = Column(JSON)  # {sdg_number: contribution_score (0-100)}
    primary_sdg_contribution = Column(Integer)  # Main SDG (1-17)
    secondary_sdg_contributions = Column(JSON)  # [sdg_numbers]
    
    # Impact Metrics
    total_impact_score = Column(Float)  # Weighted contribution to portfolio impact
    beneficiaries_attributed = Column(Integer)
    jobs_attributed = Column(Integer)
    emissions_reduction_attributed = Column(Float)  # tCO2e
    
    # Portfolio Contribution
    portfolio_impact_percentage = Column(Float)  # % of total portfolio impact
    portfolio_esg_contribution = Column(Float)  # Contribution to portfolio ESG score
    portfolio_climate_contribution = Column(Float)  # Contribution to portfolio climate performance
    
    # Attribution Methodology
    attribution_method = Column(String(100))  # direct, proportional, estimated
    confidence_level = Column(Float)  # 0-100
    
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    investment = relationship("Investment")


class PortfolioOptimization(Base):
    """Portfolio optimization suggestions and analysis"""
    __tablename__ = "portfolio_optimizations"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_date = Column(Date, nullable=False, index=True)
    
    # Optimization Parameters
    target_impact_score = Column(Float)
    target_esg_score = Column(Float)
    max_climate_risk = Column(Float)
    min_roi_threshold = Column(Float)
    
    # Current Portfolio Metrics
    current_impact_score = Column(Float)
    current_esg_score = Column(Float)
    current_climate_risk = Column(Float)
    current_roi = Column(Float)
    
    # Suggested Changes
    suggested_rebalancing = Column(JSON)  # {investment_id: suggested_weight_change}
    suggested_additions = Column(JSON)  # List of investment IDs to consider
    suggested_reductions = Column(JSON)  # List of investment IDs to reduce/exit
    
    # Optimization Results
    optimized_impact_score = Column(Float)
    optimized_esg_score = Column(Float)
    optimized_climate_risk = Column(Float)
    optimized_roi = Column(Float)
    
    # Analysis Details
    optimization_method = Column(String(100))  # mean_variance, impact_weighted, custom
    constraints = Column(JSON)  # Optimization constraints applied
    analysis_notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(100))


class CorrelationAnalysis(Base):
    """Correlation analysis between ESG, climate, and financial metrics"""
    __tablename__ = "correlation_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_date = Column(Date, nullable=False, index=True)
    
    # Correlation Matrix Data
    correlation_matrix = Column(JSON)  # {metric1_metric2: correlation_coefficient}
    
    # Key Correlations
    esg_roi_correlation = Column(Float)
    climate_risk_roi_correlation = Column(Float)
    impact_roi_correlation = Column(Float)
    esg_climate_correlation = Column(Float)
    
    # Statistical Significance
    p_values = Column(JSON)  # {metric_pair: p_value}
    sample_size = Column(Integer)
    
    # Insights
    key_insights = Column(JSON)  # List of insights from correlation analysis
    recommendations = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MonteCarloSimulation(Base):
    """Monte Carlo simulation results for portfolio scenarios"""
    __tablename__ = "monte_carlo_simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    simulation_name = Column(String(200), nullable=False)
    simulation_date = Column(Date, nullable=False, index=True)
    
    # Simulation Parameters
    num_iterations = Column(Integer, default=10000)
    time_horizon_years = Column(Integer, default=5)
    confidence_levels = Column(JSON)  # [90, 95, 99] percentiles
    
    # Scenario Parameters
    scenario_type = Column(String(100))  # baseline, optimistic, pessimistic, stress_test
    climate_scenario = Column(String(50))  # 1.5c, 2c, 3c
    market_volatility = Column(Float)
    
    # Results
    expected_roi = Column(Float)
    roi_std_dev = Column(Float)
    roi_percentiles = Column(JSON)  # {percentile: roi_value}
    
    expected_impact_score = Column(Float)
    impact_score_std_dev = Column(Float)
    impact_score_percentiles = Column(JSON)
    
    expected_esg_score = Column(Float)
    esg_score_std_dev = Column(Float)
    
    # Risk Metrics
    value_at_risk_95 = Column(Float)  # VaR at 95% confidence
    value_at_risk_99 = Column(Float)  # VaR at 99% confidence
    conditional_var_95 = Column(Float)  # CVaR at 95%
    
    # Probability of Outcomes
    probability_positive_roi = Column(Float)
    probability_target_impact = Column(Float)
    probability_risk_threshold = Column(Float)
    
    # Detailed Results
    iteration_results = Column(JSON)  # Sample of iteration results
    scenario_analysis = Column(JSON)  # Results by scenario
    
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(100))

