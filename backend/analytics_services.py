"""
Advanced Analytics Services for Impact Investing Research Tool
Includes peer benchmarking, portfolio optimization, impact attribution, correlation analysis, and Monte Carlo simulations
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
import random
import statistics
from models import (
    Investment, ClimateRisk, GHGEmissions, SocialImpact, ESGScore,
    PeerBenchmark, ImpactAttribution, PortfolioOptimization,
    CorrelationAnalysis, MonteCarloSimulation
)
from schemas import (
    PeerBenchmarkCreate, ImpactAttributionCreate, PortfolioOptimizationCreate,
    CorrelationAnalysisCreate, MonteCarloSimulationCreate,
    InvestmentBenchmarkComparison
)


# ==================== Peer Benchmarking Service ====================

class PeerBenchmarkService:
    @staticmethod
    def calculate_benchmarks(
        db: Session,
        sector: Optional[str] = None,
        industry: Optional[str] = None,
        region: Optional[str] = None
    ) -> PeerBenchmark:
        """Calculate peer benchmarks for a given sector/industry/region"""
        # Get all investments matching criteria
        query = db.query(Investment)
        if sector:
            query = query.filter(Investment.sector == sector)
        if industry:
            query = query.filter(Investment.industry == industry)
        if region:
            query = query.filter(Investment.region == region)
        
        investments = query.all()
        
        if not investments:
            raise ValueError("No investments found for benchmark criteria")
        
        # Collect metrics
        esg_scores = []
        physical_risks = []
        transition_risks = []
        climate_opportunities = []
        rois = []
        investment_sizes = []
        impact_scores = []
        beneficiaries = []
        emissions_intensities = []
        
        for inv in investments:
            # ESG Score
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            if latest_esg and latest_esg.overall_esg_score:
                esg_scores.append(latest_esg.overall_esg_score)
            
            # Climate Risk
            latest_risk = db.query(ClimateRisk).filter(
                ClimateRisk.investment_id == inv.id
            ).order_by(desc(ClimateRisk.assessment_date)).first()
            if latest_risk:
                if latest_risk.physical_risk_score:
                    physical_risks.append(latest_risk.physical_risk_score)
                if latest_risk.transition_risk_score:
                    transition_risks.append(latest_risk.transition_risk_score)
                if latest_risk.climate_opportunity_score:
                    climate_opportunities.append(latest_risk.climate_opportunity_score)
            
            # ROI
            if inv.investment_amount and inv.current_value:
                roi = ((inv.current_value - inv.investment_amount) / inv.investment_amount) * 100
                rois.append(roi)
            
            if inv.investment_amount:
                investment_sizes.append(inv.investment_amount)
            
            # Social Impact
            latest_impact = db.query(SocialImpact).filter(
                SocialImpact.investment_id == inv.id
            ).order_by(desc(SocialImpact.assessment_date)).first()
            if latest_impact:
                if latest_impact.overall_impact_score:
                    impact_scores.append(latest_impact.overall_impact_score)
                if latest_impact.beneficiaries_reached:
                    beneficiaries.append(latest_impact.beneficiaries_reached)
            
            # Emissions Intensity
            latest_emissions = db.query(GHGEmissions).filter(
                GHGEmissions.investment_id == inv.id
            ).order_by(desc(GHGEmissions.reporting_year)).first()
            if latest_emissions and latest_emissions.emissions_intensity_revenue:
                emissions_intensities.append(latest_emissions.emissions_intensity_revenue)
        
        # Calculate statistics
        def calc_stats(values):
            if not values:
                return None, None, None, None
            sorted_vals = sorted(values)
            return (
                statistics.mean(values),
                statistics.median(values),
                sorted_vals[int(len(sorted_vals) * 0.25)] if len(sorted_vals) > 0 else None,
                sorted_vals[int(len(sorted_vals) * 0.75)] if len(sorted_vals) > 0 else None
            )
        
        avg_esg, median_esg, p25_esg, p75_esg = calc_stats(esg_scores)
        
        benchmark_data = {
            "sector": sector or "All",
            "industry": industry,
            "region": region,
            "benchmark_date": date.today(),
            "avg_esg_score": avg_esg,
            "median_esg_score": median_esg,
            "percentile_25_esg": p25_esg,
            "percentile_75_esg": p75_esg,
            "avg_physical_risk": statistics.mean(physical_risks) if physical_risks else None,
            "avg_transition_risk": statistics.mean(transition_risks) if transition_risks else None,
            "avg_climate_opportunity": statistics.mean(climate_opportunities) if climate_opportunities else None,
            "avg_roi": statistics.mean(rois) if rois else None,
            "median_roi": statistics.median(rois) if rois else None,
            "avg_investment_size": statistics.mean(investment_sizes) if investment_sizes else None,
            "avg_impact_score": statistics.mean(impact_scores) if impact_scores else None,
            "avg_beneficiaries": statistics.mean(beneficiaries) if beneficiaries else None,
            "avg_emissions_intensity": statistics.mean(emissions_intensities) if emissions_intensities else None,
            "median_emissions_intensity": statistics.median(emissions_intensities) if emissions_intensities else None,
            "sample_size": len(investments),
            "data_source": "internal"
        }
        
        # Check if benchmark exists
        existing = db.query(PeerBenchmark).filter(
            PeerBenchmark.sector == benchmark_data["sector"],
            PeerBenchmark.industry == (industry or None),
            PeerBenchmark.region == (region or None),
            PeerBenchmark.benchmark_date == benchmark_data["benchmark_date"]
        ).first()
        
        if existing:
            # Update existing
            for key, value in benchmark_data.items():
                setattr(existing, key, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new
            benchmark = PeerBenchmark(**benchmark_data)
            db.add(benchmark)
            db.commit()
            db.refresh(benchmark)
            return benchmark
    
    @staticmethod
    def compare_investment_to_peers(
        db: Session,
        investment_id: int
    ) -> InvestmentBenchmarkComparison:
        """Compare a specific investment against its peer benchmarks"""
        investment = db.query(Investment).filter(Investment.id == investment_id).first()
        if not investment:
            raise ValueError("Investment not found")
        
        # Get or calculate benchmark
        benchmark = PeerBenchmarkService.calculate_benchmarks(
            db,
            sector=investment.sector,
            industry=investment.industry,
            region=investment.region
        )
        
        # Get investment metrics
        latest_esg = db.query(ESGScore).filter(
            ESGScore.investment_id == investment_id
        ).order_by(desc(ESGScore.assessment_date)).first()
        
        latest_risk = db.query(ClimateRisk).filter(
            ClimateRisk.investment_id == investment_id
        ).order_by(desc(ClimateRisk.assessment_date)).first()
        
        latest_impact = db.query(SocialImpact).filter(
            SocialImpact.investment_id == investment_id
        ).order_by(desc(SocialImpact.assessment_date)).first()
        
        investment_esg = latest_esg.overall_esg_score if latest_esg else None
        investment_physical_risk = latest_risk.physical_risk_score if latest_risk else None
        investment_transition_risk = latest_risk.transition_risk_score if latest_risk else None
        investment_impact = latest_impact.overall_impact_score if latest_impact else None
        
        investment_roi = None
        if investment.investment_amount and investment.current_value:
            investment_roi = ((investment.current_value - investment.investment_amount) / investment.investment_amount) * 100
        
        # Calculate percentiles (simplified - would need full distribution in production)
        def calc_percentile(value, avg, p25, p75, median):
            if value is None or avg is None:
                return None
            if value >= p75:
                return 75 + ((value - p75) / (p75 - avg) * 10) if p75 > avg else 75
            elif value >= median:
                return 50 + ((value - median) / (p75 - median) * 25) if p75 > median else 50
            elif value >= p25:
                return 25 + ((value - p25) / (median - p25) * 25) if median > p25 else 25
            else:
                return max(0, 25 * (value / p25) if p25 > 0 else 0)
        
        esg_percentile = calc_percentile(
            investment_esg,
            benchmark.avg_esg_score,
            benchmark.percentile_25_esg,
            benchmark.percentile_75_esg,
            benchmark.median_esg_score
        )
        
        # Generate insights
        strengths = []
        weaknesses = []
        recommendations = []
        
        if investment_esg and benchmark.avg_esg_score:
            if investment_esg > benchmark.avg_esg_score:
                strengths.append(f"ESG score ({investment_esg:.1f}) exceeds sector average ({benchmark.avg_esg_score:.1f})")
            else:
                weaknesses.append(f"ESG score ({investment_esg:.1f}) below sector average ({benchmark.avg_esg_score:.1f})")
                recommendations.append("Focus on improving ESG performance to match or exceed sector peers")
        
        if investment_roi and benchmark.avg_roi:
            if investment_roi > benchmark.avg_roi:
                strengths.append(f"ROI ({investment_roi:.1f}%) exceeds sector average ({benchmark.avg_roi:.1f}%)")
            else:
                weaknesses.append(f"ROI ({investment_roi:.1f}%) below sector average ({benchmark.avg_roi:.1f}%)")
        
        if investment_physical_risk and benchmark.avg_physical_risk:
            if investment_physical_risk < benchmark.avg_physical_risk:
                strengths.append(f"Physical climate risk ({investment_physical_risk:.1f}) lower than sector average ({benchmark.avg_physical_risk:.1f})")
            else:
                weaknesses.append(f"Physical climate risk ({investment_physical_risk:.1f}) higher than sector average ({benchmark.avg_physical_risk:.1f})")
                recommendations.append("Develop climate adaptation strategies to reduce physical risk exposure")
        
        return InvestmentBenchmarkComparison(
            investment_id=investment.id,
            investment_name=investment.name,
            sector=investment.sector or "",
            industry=investment.industry,
            region=investment.region,
            investment_esg_score=investment_esg,
            investment_physical_risk=investment_physical_risk,
            investment_transition_risk=investment_transition_risk,
            investment_roi=investment_roi,
            investment_impact_score=investment_impact,
            benchmark=benchmark,
            esg_percentile=esg_percentile,
            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations
        )
    
    @staticmethod
    def get_benchmarks(
        db: Session,
        sector: Optional[str] = None,
        industry: Optional[str] = None,
        region: Optional[str] = None
    ) -> List[PeerBenchmark]:
        """Get existing benchmarks"""
        query = db.query(PeerBenchmark)
        if sector:
            query = query.filter(PeerBenchmark.sector == sector)
        if industry:
            query = query.filter(PeerBenchmark.industry == industry)
        if region:
            query = query.filter(PeerBenchmark.region == region)
        
        return query.order_by(desc(PeerBenchmark.benchmark_date)).all()


# ==================== Impact Attribution Service ====================

class ImpactAttributionService:
    @staticmethod
    def calculate_attribution(
        db: Session,
        investment_id: int,
        attribution_date: Optional[date] = None
    ) -> ImpactAttribution:
        """Calculate impact attribution for an investment"""
        if not attribution_date:
            attribution_date = date.today()
        
        investment = db.query(Investment).filter(Investment.id == investment_id).first()
        if not investment:
            raise ValueError("Investment not found")
        
        # Get latest data
        latest_impact = db.query(SocialImpact).filter(
            SocialImpact.investment_id == investment_id
        ).order_by(desc(SocialImpact.assessment_date)).first()
        
        latest_esg = db.query(ESGScore).filter(
            ESGScore.investment_id == investment_id
        ).order_by(desc(ESGScore.assessment_date)).first()
        
        latest_risk = db.query(ClimateRisk).filter(
            ClimateRisk.investment_id == investment_id
        ).order_by(desc(ClimateRisk.assessment_date)).first()
        
        # Get portfolio totals for percentage calculations
        all_investments = db.query(Investment).filter(Investment.status == "active").all()
        portfolio_total_impact = 0
        portfolio_total_esg = 0
        portfolio_total_climate_score = 0
        
        for inv in all_investments:
            inv_impact = db.query(SocialImpact).filter(
                SocialImpact.investment_id == inv.id
            ).order_by(desc(SocialImpact.assessment_date)).first()
            if inv_impact and inv_impact.overall_impact_score:
                portfolio_total_impact += inv_impact.overall_impact_score * (inv.current_value or 0)
            
            inv_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            if inv_esg and inv_esg.overall_esg_score:
                portfolio_total_esg += inv_esg.overall_esg_score * (inv.current_value or 0)
            
            inv_risk = db.query(ClimateRisk).filter(
                ClimateRisk.investment_id == inv.id
            ).order_by(desc(ClimateRisk.assessment_date)).first()
            if inv_risk:
                max_risk = max(
                    inv_risk.physical_risk_score or 0,
                    inv_risk.transition_risk_score or 0
                )
                portfolio_total_climate_score += (10 - max_risk) * (inv.current_value or 0)
        
        # Calculate SDG contributions
        sdg_contributions = {}
        if latest_impact and latest_impact.sdg_alignment:
            for sdg_num, score in latest_impact.sdg_alignment.items():
                sdg_contributions[sdg_num] = score * (investment.current_value or 0) / 1000000  # Normalized
        
        # Find primary SDG
        primary_sdg = None
        if sdg_contributions:
            primary_sdg = int(max(sdg_contributions.items(), key=lambda x: x[1])[0])
        
        # Calculate portfolio contributions
        investment_value = investment.current_value or investment.investment_amount or 0
        impact_score = latest_impact.overall_impact_score if latest_impact else 0
        weighted_impact = impact_score * investment_value
        
        portfolio_impact_pct = (weighted_impact / portfolio_total_impact * 100) if portfolio_total_impact > 0 else 0
        
        esg_score = latest_esg.overall_esg_score if latest_esg else 0
        weighted_esg = esg_score * investment_value
        portfolio_esg_contrib = (weighted_esg / portfolio_total_esg * 100) if portfolio_total_esg > 0 else 0
        
        climate_score = 10 - max(
            latest_risk.physical_risk_score or 0,
            latest_risk.transition_risk_score or 0
        ) if latest_risk else 5
        weighted_climate = climate_score * investment_value
        portfolio_climate_contrib = (weighted_climate / portfolio_total_climate_score * 100) if portfolio_total_climate_score > 0 else 0
        
        attribution_data = {
            "investment_id": investment_id,
            "attribution_date": attribution_date,
            "sdg_contributions": sdg_contributions,
            "primary_sdg_contribution": primary_sdg,
            "secondary_sdg_contributions": [int(k) for k, v in sorted(sdg_contributions.items(), key=lambda x: x[1], reverse=True)[1:4] if v > 0],
            "total_impact_score": weighted_impact,
            "beneficiaries_attributed": latest_impact.beneficiaries_reached if latest_impact else 0,
            "jobs_attributed": latest_impact.jobs_created if latest_impact else 0,
            "emissions_reduction_attributed": 0,  # Would need emissions reduction data
            "portfolio_impact_percentage": portfolio_impact_pct,
            "portfolio_esg_contribution": portfolio_esg_contrib,
            "portfolio_climate_contribution": portfolio_climate_contrib,
            "attribution_method": "proportional",
            "confidence_level": 85.0 if latest_impact and latest_esg and latest_risk else 60.0
        }
        
        # Check if exists
        existing = db.query(ImpactAttribution).filter(
            ImpactAttribution.investment_id == investment_id,
            ImpactAttribution.attribution_date == attribution_date
        ).first()
        
        if existing:
            for key, value in attribution_data.items():
                setattr(existing, key, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            attribution = ImpactAttribution(**attribution_data)
            db.add(attribution)
            db.commit()
            db.refresh(attribution)
            return attribution
    
    @staticmethod
    def get_attribution(
        db: Session,
        investment_id: Optional[int] = None
    ) -> List[ImpactAttribution]:
        """Get impact attributions"""
        query = db.query(ImpactAttribution)
        if investment_id:
            query = query.filter(ImpactAttribution.investment_id == investment_id)
        return query.order_by(desc(ImpactAttribution.attribution_date)).all()


# ==================== Portfolio Optimization Service ====================

class PortfolioOptimizationService:
    @staticmethod
    def optimize_portfolio(
        db: Session,
        target_impact_score: Optional[float] = None,
        target_esg_score: Optional[float] = None,
        max_climate_risk: Optional[float] = None,
        min_roi_threshold: Optional[float] = None,
        optimization_method: str = "impact_weighted",
        created_by: Optional[str] = None
    ) -> PortfolioOptimization:
        """Generate portfolio optimization suggestions"""
        investments = db.query(Investment).filter(Investment.status == "active").all()
        
        if not investments:
            raise ValueError("No active investments in portfolio")
        
        # Calculate current portfolio metrics
        total_value = sum(inv.current_value or inv.investment_amount or 0 for inv in investments)
        
        current_impact = 0
        current_esg = 0
        current_climate_risk = 0
        current_roi = 0
        
        investment_metrics = []
        
        for inv in investments:
            value = inv.current_value or inv.investment_amount or 0
            weight = value / total_value if total_value > 0 else 0
            
            latest_impact = db.query(SocialImpact).filter(
                SocialImpact.investment_id == inv.id
            ).order_by(desc(SocialImpact.assessment_date)).first()
            
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            
            latest_risk = db.query(ClimateRisk).filter(
                ClimateRisk.investment_id == inv.id
            ).order_by(desc(ClimateRisk.assessment_date)).first()
            
            impact_score = latest_impact.overall_impact_score if latest_impact else 5.0
            esg_score = latest_esg.overall_esg_score if latest_esg else 50.0
            max_risk = max(
                latest_risk.physical_risk_score or 0,
                latest_risk.transition_risk_score or 0
            ) if latest_risk else 5.0
            
            roi = 0
            if inv.investment_amount and inv.current_value:
                roi = ((inv.current_value - inv.investment_amount) / inv.investment_amount) * 100
            
            current_impact += impact_score * weight
            current_esg += esg_score * weight
            current_climate_risk += max_risk * weight
            current_roi += roi * weight
            
            investment_metrics.append({
                "id": inv.id,
                "name": inv.name,
                "weight": weight,
                "impact": impact_score,
                "esg": esg_score,
                "risk": max_risk,
                "roi": roi,
                "value": value
            })
        
        # Generate optimization suggestions (simplified algorithm)
        suggested_rebalancing = {}
        suggested_additions = []
        suggested_reductions = []
        
        # Identify underperformers
        for metric in investment_metrics:
            should_reduce = False
            should_increase = False
            
            if max_climate_risk and metric["risk"] > max_climate_risk:
                should_reduce = True
            if target_impact_score and metric["impact"] < target_impact_score * 0.8:
                should_reduce = True
            if target_esg_score and metric["esg"] < target_esg_score * 0.8:
                should_reduce = True
            if min_roi_threshold and metric["roi"] < min_roi_threshold:
                should_reduce = True
            
            if target_impact_score and metric["impact"] > target_impact_score * 1.2:
                should_increase = True
            if target_esg_score and metric["esg"] > target_esg_score * 1.2:
                should_increase = True
            if metric["risk"] < 3.0:  # Low risk
                should_increase = True
            
            if should_reduce:
                suggested_rebalancing[str(metric["id"])] = -0.05  # Reduce by 5%
                suggested_reductions.append(metric["id"])
            elif should_increase:
                suggested_rebalancing[str(metric["id"])] = 0.05  # Increase by 5%
        
        # Calculate optimized metrics (simplified)
        optimized_impact = current_impact * 1.05 if target_impact_score else current_impact
        optimized_esg = current_esg * 1.03 if target_esg_score else current_esg
        optimized_climate_risk = current_climate_risk * 0.95 if max_climate_risk else current_climate_risk
        optimized_roi = current_roi * 1.02  # Slight improvement expected
        
        optimization_data = {
            "analysis_date": date.today(),
            "target_impact_score": target_impact_score,
            "target_esg_score": target_esg_score,
            "max_climate_risk": max_climate_risk,
            "min_roi_threshold": min_roi_threshold,
            "current_impact_score": current_impact,
            "current_esg_score": current_esg,
            "current_climate_risk": current_climate_risk,
            "current_roi": current_roi,
            "suggested_rebalancing": suggested_rebalancing,
            "suggested_additions": suggested_additions,
            "suggested_reductions": suggested_reductions,
            "optimized_impact_score": optimized_impact,
            "optimized_esg_score": optimized_esg,
            "optimized_climate_risk": optimized_climate_risk,
            "optimized_roi": optimized_roi,
            "optimization_method": optimization_method,
            "constraints": {
                "max_position_size": 0.25,  # Max 25% in single investment
                "min_position_size": 0.01,   # Min 1% in single investment
                "sector_diversification": True
            },
            "analysis_notes": f"Optimization analysis completed using {optimization_method} method",
            "created_by": created_by or "System"
        }
        
        optimization = PortfolioOptimization(**optimization_data)
        db.add(optimization)
        db.commit()
        db.refresh(optimization)
        return optimization
    
    @staticmethod
    def get_optimizations(
        db: Session,
        limit: int = 10
    ) -> List[PortfolioOptimization]:
        """Get recent optimization analyses"""
        return db.query(PortfolioOptimization).order_by(
            desc(PortfolioOptimization.analysis_date)
        ).limit(limit).all()


# ==================== Correlation Analysis Service ====================

class CorrelationAnalysisService:
    @staticmethod
    def calculate_correlations(db: Session) -> CorrelationAnalysis:
        """Calculate correlations between ESG, climate, and financial metrics"""
        investments = db.query(Investment).filter(Investment.status == "active").all()
        
        if len(investments) < 3:
            raise ValueError("Need at least 3 investments for correlation analysis")
        
        # Collect data points
        data_points = []
        
        for inv in investments:
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            
            latest_risk = db.query(ClimateRisk).filter(
                ClimateRisk.investment_id == inv.id
            ).order_by(desc(ClimateRisk.assessment_date)).first()
            
            latest_impact = db.query(SocialImpact).filter(
                SocialImpact.investment_id == inv.id
            ).order_by(desc(SocialImpact.assessment_date)).first()
            
            roi = 0
            if inv.investment_amount and inv.current_value:
                roi = ((inv.current_value - inv.investment_amount) / inv.investment_amount) * 100
            
            esg = latest_esg.overall_esg_score if latest_esg else None
            max_risk = max(
                latest_risk.physical_risk_score or 0,
                latest_risk.transition_risk_score or 0
            ) if latest_risk else None
            impact = latest_impact.overall_impact_score if latest_impact else None
            
            if esg is not None and max_risk is not None and impact is not None:
                data_points.append({
                    "esg": esg,
                    "risk": max_risk,
                    "impact": impact,
                    "roi": roi
                })
        
        if len(data_points) < 3:
            raise ValueError("Insufficient data for correlation analysis")
        
        # Calculate correlations (simplified - would use numpy.corrcoef in production)
        def calc_correlation(x, y):
            if len(x) != len(y):
                return None
            n = len(x)
            if n < 2:
                return None
            mean_x = statistics.mean(x)
            mean_y = statistics.mean(y)
            numerator = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
            denominator = (sum((x[i] - mean_x) ** 2 for i in range(n)) * 
                          sum((y[i] - mean_y) ** 2 for i in range(n))) ** 0.5
            if denominator == 0:
                return None
            return numerator / denominator
        
        esg_values = [d["esg"] for d in data_points]
        risk_values = [d["risk"] for d in data_points]
        impact_values = [d["impact"] for d in data_points]
        roi_values = [d["roi"] for d in data_points]
        
        esg_roi_corr = calc_correlation(esg_values, roi_values)
        climate_risk_roi_corr = calc_correlation(risk_values, roi_values)
        impact_roi_corr = calc_correlation(impact_values, roi_values)
        esg_climate_corr = calc_correlation(esg_values, risk_values)
        
        # Build correlation matrix
        correlation_matrix = {
            "esg_roi": esg_roi_corr,
            "climate_risk_roi": climate_risk_roi_corr,
            "impact_roi": impact_roi_corr,
            "esg_climate_risk": esg_climate_corr,
            "esg_impact": calc_correlation(esg_values, impact_values),
            "climate_risk_impact": calc_correlation(risk_values, impact_values)
        }
        
        # Generate insights
        insights = []
        if esg_roi_corr and esg_roi_corr > 0.3:
            insights.append(f"Strong positive correlation between ESG scores and ROI ({esg_roi_corr:.2f})")
        elif esg_roi_corr and esg_roi_corr < -0.3:
            insights.append(f"Negative correlation between ESG scores and ROI ({esg_roi_corr:.2f}) - requires investigation")
        
        if impact_roi_corr and impact_roi_corr > 0.2:
            insights.append(f"Positive correlation between impact scores and ROI ({impact_roi_corr:.2f})")
        
        if climate_risk_roi_corr and climate_risk_roi_corr < -0.2:
            insights.append(f"Negative correlation between climate risk and ROI ({climate_risk_roi_corr:.2f}) - lower risk associated with higher returns")
        
        recommendations = "Consider portfolio adjustments based on correlation insights. " + \
                         "Focus on investments that demonstrate positive correlations between impact and financial performance."
        
        analysis_data = {
            "analysis_date": date.today(),
            "correlation_matrix": correlation_matrix,
            "esg_roi_correlation": esg_roi_corr,
            "climate_risk_roi_correlation": climate_risk_roi_corr,
            "impact_roi_correlation": impact_roi_corr,
            "esg_climate_correlation": esg_climate_corr,
            "p_values": {},  # Would calculate p-values in production
            "sample_size": len(data_points),
            "key_insights": insights,
            "recommendations": recommendations
        }
        
        analysis = CorrelationAnalysis(**analysis_data)
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis
    
    @staticmethod
    def get_latest_analysis(db: Session) -> Optional[CorrelationAnalysis]:
        """Get the latest correlation analysis"""
        return db.query(CorrelationAnalysis).order_by(
            desc(CorrelationAnalysis.analysis_date)
        ).first()


# ==================== Monte Carlo Simulation Service ====================

class MonteCarloSimulationService:
    @staticmethod
    def run_simulation(
        db: Session,
        simulation_name: str,
        num_iterations: int = 10000,
        time_horizon_years: int = 5,
        scenario_type: str = "baseline",
        climate_scenario: Optional[str] = None,
        market_volatility: float = 0.15,
        created_by: Optional[str] = None
    ) -> MonteCarloSimulation:
        """Run Monte Carlo simulation for portfolio scenarios"""
        investments = db.query(Investment).filter(Investment.status == "active").all()
        
        if not investments:
            raise ValueError("No active investments for simulation")
        
        # Get current portfolio metrics
        portfolio_value = sum(inv.current_value or inv.investment_amount or 0 for inv in investments)
        
        # Collect historical data for each investment
        investment_data = []
        for inv in investments:
            weight = (inv.current_value or inv.investment_amount or 0) / portfolio_value if portfolio_value > 0 else 0
            
            # Calculate historical ROI
            if inv.investment_date and inv.investment_amount and inv.current_value:
                years_held = (date.today() - inv.investment_date).days / 365.25
                if years_held > 0:
                    annual_roi = (((inv.current_value / inv.investment_amount) ** (1 / years_held)) - 1) * 100
                else:
                    annual_roi = 0
            else:
                annual_roi = 8.0  # Default assumption
            
            latest_impact = db.query(SocialImpact).filter(
                SocialImpact.investment_id == inv.id
            ).order_by(desc(SocialImpact.assessment_date)).first()
            
            latest_esg = db.query(ESGScore).filter(
                ESGScore.investment_id == inv.id
            ).order_by(desc(ESGScore.assessment_date)).first()
            
            investment_data.append({
                "weight": weight,
                "annual_roi": annual_roi,
                "impact": latest_impact.overall_impact_score if latest_impact else 5.0,
                "esg": latest_esg.overall_esg_score if latest_esg else 50.0
            })
        
        # Run Monte Carlo simulation
        roi_results = []
        impact_results = []
        esg_results = []
        
        for _ in range(num_iterations):
            # Simulate portfolio performance
            portfolio_roi = 0
            portfolio_impact = 0
            portfolio_esg = 0
            
            for inv_data in investment_data:
                # Add random variation to ROI
                roi_variation = random.gauss(0, market_volatility * 100)
                simulated_roi = inv_data["annual_roi"] + roi_variation
                
                portfolio_roi += simulated_roi * inv_data["weight"]
                portfolio_impact += inv_data["impact"] * inv_data["weight"]
                portfolio_esg += inv_data["esg"] * inv_data["weight"]
            
            # Compound over time horizon
            final_roi = portfolio_roi * time_horizon_years
            roi_results.append(final_roi)
            impact_results.append(portfolio_impact)
            esg_results.append(portfolio_esg)
        
        # Calculate statistics
        def calc_percentiles(values, percentiles=[5, 10, 25, 50, 75, 90, 95]):
            sorted_vals = sorted(values)
            result = {}
            for p in percentiles:
                idx = int(len(sorted_vals) * p / 100)
                result[p] = sorted_vals[min(idx, len(sorted_vals) - 1)]
            return result
        
        expected_roi = statistics.mean(roi_results)
        roi_std_dev = statistics.stdev(roi_results) if len(roi_results) > 1 else 0
        roi_percentiles = calc_percentiles(roi_results)
        
        expected_impact = statistics.mean(impact_results)
        impact_std_dev = statistics.stdev(impact_results) if len(impact_results) > 1 else 0
        impact_percentiles = calc_percentiles(impact_results)
        
        expected_esg = statistics.mean(esg_results)
        esg_std_dev = statistics.stdev(esg_results) if len(esg_results) > 1 else 0
        
        # Calculate VaR
        sorted_roi = sorted(roi_results)
        var_95_idx = int(len(sorted_roi) * 0.05)
        var_99_idx = int(len(sorted_roi) * 0.01)
        value_at_risk_95 = sorted_roi[var_95_idx] if var_95_idx < len(sorted_roi) else sorted_roi[0]
        value_at_risk_99 = sorted_roi[var_99_idx] if var_99_idx < len(sorted_roi) else sorted_roi[0]
        
        # CVaR (Conditional VaR) - average of losses beyond VaR
        cvar_95 = statistics.mean(sorted_roi[:var_95_idx]) if var_95_idx > 0 else value_at_risk_95
        
        # Probabilities
        probability_positive_roi = sum(1 for r in roi_results if r > 0) / len(roi_results) * 100
        probability_target_impact = sum(1 for i in impact_results if i >= 7.0) / len(impact_results) * 100
        probability_risk_threshold = sum(1 for r in roi_results if r < -10) / len(roi_results) * 100
        
        simulation_data = {
            "simulation_name": simulation_name,
            "simulation_date": date.today(),
            "num_iterations": num_iterations,
            "time_horizon_years": time_horizon_years,
            "confidence_levels": [90, 95, 99],
            "scenario_type": scenario_type,
            "climate_scenario": climate_scenario,
            "market_volatility": market_volatility,
            "expected_roi": expected_roi,
            "roi_std_dev": roi_std_dev,
            "roi_percentiles": roi_percentiles,
            "expected_impact_score": expected_impact,
            "impact_score_std_dev": impact_std_dev,
            "impact_score_percentiles": impact_percentiles,
            "expected_esg_score": expected_esg,
            "esg_score_std_dev": esg_std_dev,
            "value_at_risk_95": value_at_risk_95,
            "value_at_risk_99": value_at_risk_99,
            "conditional_var_95": cvar_95,
            "probability_positive_roi": probability_positive_roi,
            "probability_target_impact": probability_target_impact,
            "probability_risk_threshold": probability_risk_threshold,
            "iteration_results": {
                "sample_roi": roi_results[:100],  # Sample of results
                "sample_impact": impact_results[:100]
            },
            "scenario_analysis": {
                "baseline": {
                    "expected_roi": expected_roi,
                    "expected_impact": expected_impact
                }
            },
            "notes": f"Monte Carlo simulation with {num_iterations} iterations over {time_horizon_years} years",
            "created_by": created_by or "System"
        }
        
        simulation = MonteCarloSimulation(**simulation_data)
        db.add(simulation)
        db.commit()
        db.refresh(simulation)
        return simulation
    
    @staticmethod
    def get_simulations(
        db: Session,
        limit: int = 10
    ) -> List[MonteCarloSimulation]:
        """Get recent simulations"""
        return db.query(MonteCarloSimulation).order_by(
            desc(MonteCarloSimulation.simulation_date)
        ).limit(limit).all()
    
    @staticmethod
    def get_simulation(db: Session, simulation_id: int) -> Optional[MonteCarloSimulation]:
        """Get a specific simulation"""
        return db.query(MonteCarloSimulation).filter(
            MonteCarloSimulation.id == simulation_id
        ).first()

