export interface Investment {
  id: number
  name: string
  company_name: string
  sector?: string
  industry?: string
  region?: string
  country?: string
  investment_type?: string
  investment_date?: string
  investment_amount?: number
  current_value?: number
  ownership_percentage?: number
  description?: string
  website?: string
  status: string
  created_at: string
  updated_at?: string
}

export interface ClimateRisk {
  id: number
  investment_id: number
  assessment_date: string
  physical_risk_score?: number
  flood_risk?: number
  drought_risk?: number
  extreme_weather_risk?: number
  sea_level_rise_risk?: number
  heat_stress_risk?: number
  transition_risk_score?: number
  policy_risk?: number
  technology_risk?: number
  market_risk?: number
  reputation_risk?: number
  climate_opportunity_score?: number
  adaptation_opportunities?: string
  mitigation_opportunities?: string
  scenario_1_5c_impact?: number
  scenario_2c_impact?: number
  scenario_3c_impact?: number
  mitigation_strategies?: string
  risk_management_plan?: string
  notes?: string
  assessed_by?: string
  created_at: string
}

export interface GHGEmissions {
  id: number
  investment_id: number
  reporting_year: number
  reporting_period_start?: string
  reporting_period_end?: string
  scope1_emissions?: number
  scope1_breakdown?: Record<string, any>
  scope2_emissions?: number
  scope2_location_based?: number
  scope2_market_based?: number
  scope3_emissions?: number
  scope3_breakdown?: Record<string, any>
  total_emissions?: number
  revenue?: number
  employees?: number
  emissions_intensity_revenue?: number
  emissions_intensity_employee?: number
  reduction_target_year?: number
  reduction_target_percentage?: number
  baseline_year?: number
  baseline_emissions?: number
  verification_status?: string
  verification_body?: string
  methodology?: string
  notes?: string
  created_at: string
}

export interface SocialImpact {
  id: number
  investment_id: number
  assessment_date: string
  sdg_alignment?: Record<string, number>
  primary_sdgs?: string
  total_employees?: number
  direct_employees?: number
  indirect_employees?: number
  jobs_created?: number
  average_wage?: number
  living_wage_compliance?: boolean
  union_presence?: boolean
  labor_rights_score?: number
  communities_served?: number
  local_procurement_percentage?: number
  community_investment_amount?: number
  community_engagement_score?: number
  beneficiaries_reached?: number
  underserved_populations_served?: number
  affordability_score?: number
  accessibility_score?: number
  gender_diversity_score?: number
  racial_ethnic_diversity_score?: number
  leadership_diversity?: number
  workplace_safety_score?: number
  incidents_rate?: number
  health_programs?: boolean
  overall_impact_score?: number
  impact_metrics?: Record<string, any>
  impact_story?: string
  challenges?: string
  opportunities?: string
  assessed_by?: string
  created_at: string
}

export interface ESGScore {
  id: number
  investment_id: number
  assessment_date: string
  overall_esg_score?: number
  environmental_score?: number
  climate_change_score?: number
  resource_use_score?: number
  pollution_waste_score?: number
  biodiversity_score?: number
  social_score?: number
  human_rights_score?: number
  labor_practices_score?: number
  product_safety_score?: number
  community_relations_score?: number
  governance_score?: number
  board_structure_score?: number
  executive_compensation_score?: number
  audit_risk_score?: number
  business_ethics_score?: number
  transparency_score?: number
  material_risks?: string[]
  risk_severity?: number
  risk_mitigation_status?: string
  gri_aligned?: boolean
  sasb_aligned?: boolean
  tcfd_aligned?: boolean
  frameworks_used?: string[]
  score_trend?: string
  year_over_year_change?: number
  assessment_methodology?: string
  data_quality?: string
  assessed_by?: string
  notes?: string
  created_at: string
}

// ==================== Advanced Analytics Types ====================

export interface PeerBenchmark {
  id: number
  sector: string
  industry?: string
  region?: string
  benchmark_date: string
  avg_esg_score?: number
  median_esg_score?: number
  percentile_25_esg?: number
  percentile_75_esg?: number
  avg_physical_risk?: number
  avg_transition_risk?: number
  avg_climate_opportunity?: number
  avg_roi?: number
  median_roi?: number
  avg_investment_size?: number
  avg_impact_score?: number
  avg_beneficiaries?: number
  avg_emissions_intensity?: number
  median_emissions_intensity?: number
  sample_size?: number
  data_source?: string
  notes?: string
  created_at: string
  updated_at?: string
}

export interface InvestmentBenchmarkComparison {
  investment_id: number
  investment_name: string
  sector: string
  industry?: string
  region?: string
  investment_esg_score?: number
  investment_physical_risk?: number
  investment_transition_risk?: number
  investment_roi?: number
  investment_impact_score?: number
  benchmark?: PeerBenchmark
  esg_percentile?: number
  risk_percentile?: number
  roi_percentile?: number
  impact_percentile?: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export interface ImpactAttribution {
  id: number
  investment_id: number
  attribution_date: string
  sdg_contributions?: Record<string, number>
  primary_sdg_contribution?: number
  secondary_sdg_contributions?: number[]
  total_impact_score?: number
  beneficiaries_attributed?: number
  jobs_attributed?: number
  emissions_reduction_attributed?: number
  portfolio_impact_percentage?: number
  portfolio_esg_contribution?: number
  portfolio_climate_contribution?: number
  attribution_method?: string
  confidence_level?: number
  notes?: string
  created_at: string
}

export interface PortfolioOptimization {
  id: number
  analysis_date: string
  target_impact_score?: number
  target_esg_score?: number
  max_climate_risk?: number
  min_roi_threshold?: number
  current_impact_score?: number
  current_esg_score?: number
  current_climate_risk?: number
  current_roi?: number
  suggested_rebalancing?: Record<string, number>
  suggested_additions?: number[]
  suggested_reductions?: number[]
  optimized_impact_score?: number
  optimized_esg_score?: number
  optimized_climate_risk?: number
  optimized_roi?: number
  optimization_method?: string
  constraints?: Record<string, any>
  analysis_notes?: string
  created_at: string
  created_by?: string
}

export interface CorrelationAnalysis {
  id: number
  analysis_date: string
  correlation_matrix?: Record<string, number>
  esg_roi_correlation?: number
  climate_risk_roi_correlation?: number
  impact_roi_correlation?: number
  esg_climate_correlation?: number
  p_values?: Record<string, number>
  sample_size?: number
  key_insights?: string[]
  recommendations?: string
  created_at: string
}

export interface MonteCarloSimulation {
  id: number
  simulation_name: string
  simulation_date: string
  num_iterations: number
  time_horizon_years: number
  confidence_levels?: number[]
  scenario_type?: string
  climate_scenario?: string
  market_volatility?: number
  expected_roi?: number
  roi_std_dev?: number
  roi_percentiles?: Record<string, number>
  expected_impact_score?: number
  impact_score_std_dev?: number
  impact_score_percentiles?: Record<string, number>
  expected_esg_score?: number
  esg_score_std_dev?: number
  value_at_risk_95?: number
  value_at_risk_99?: number
  conditional_var_95?: number
  probability_positive_roi?: number
  probability_target_impact?: number
  probability_risk_threshold?: number
  iteration_results?: Record<string, any>
  scenario_analysis?: Record<string, any>
  notes?: string
  created_at: string
  created_by?: string
}

// ==================== Notification Types ====================

export interface Notification {
  type: 'metric_change' | 'risk_threshold' | 'assessment_due' | 'data_quality' | 'portfolio_alert'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  message: string
  investment_id?: number
  investment_name?: string
  metric?: string
  change?: number
  threshold?: number
  current_value?: number
  assessment_type?: string
  days_overdue?: number
  issue?: string
  timestamp: string
  row?: number
}

export interface NotificationSummary {
  notifications: Notification[]
  total: number
  critical: number
  high: number
  medium: number
}

// ==================== Validation Types ====================

export interface ValidationIssue {
  field: string
  rule: string
  severity: 'error' | 'warning' | 'info'
  message: string
  row?: number
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  info: ValidationIssue[]
}

export interface BatchValidationResult {
  valid_count: number
  invalid_count: number
  total: number
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  info: ValidationIssue[]
}

// ==================== API Integration Types ====================

export interface APIProvider {
  name: string
  display_name: string
  configured: boolean
  base_url?: string
  supports_esg: boolean
  supports_climate_risk: boolean
  supports_emissions: boolean
}

export interface APIProviderList {
  providers: APIProvider[]
  total: number
}

export interface APIFetchResponse {
  provider: string
  company_name: string
  isin?: string
  data?: any
  error?: string
  status: string
  message?: string
  data_date?: string
}

// ==================== Report Generation Types ====================

export interface Report {
  report_type: string
  generated_at: string
  period?: {
    start_date: string
    end_date: string
  }
  summary?: any
  [key: string]: any
}
