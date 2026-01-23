"""
Data Import Services for Impact Investing Research Tool
Handles CSV/Excel imports with field mapping and validation
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import pandas as pd
import io
from models import Investment, ClimateRisk, GHGEmissions, SocialImpact, ESGScore
from services import (
    InvestmentService, ClimateRiskService, GHGEmissionsService,
    SocialImpactService, ESGScoreService
)
from schemas import (
    InvestmentCreate, ClimateRiskCreate, GHGEmissionsCreate,
    SocialImpactCreate, ESGScoreCreate
)
from validation_rules import validation_engine


class DataImportService:
    """Service for importing data from CSV/Excel files"""
    
    @staticmethod
    def parse_file(file_content: bytes, filename: str) -> pd.DataFrame:
        """Parse CSV or Excel file into pandas DataFrame"""
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content))
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(file_content))
            else:
                raise ValueError(f"Unsupported file type: {filename}")
            
            return df
        except Exception as e:
            raise ValueError(f"Error parsing file: {str(e)}")
    
    @staticmethod
    def get_field_mapping_suggestions(df: pd.DataFrame, data_type: str) -> Dict[str, List[str]]:
        """Suggest field mappings based on column names and data type"""
        suggestions = {}
        
        # Define expected fields for each data type
        field_mappings = {
            'investment': {
                'name': ['name', 'company', 'company_name', 'investment_name'],
                'company_name': ['company_name', 'company', 'name', 'organization'],
                'sector': ['sector', 'industry_sector', 'business_sector'],
                'industry': ['industry', 'business_industry', 'sector_detail'],
                'region': ['region', 'geographic_region', 'location'],
                'country': ['country', 'nation', 'location_country'],
                'investment_amount': ['investment_amount', 'amount', 'initial_investment', 'capital'],
                'current_value': ['current_value', 'value', 'valuation', 'market_value'],
                'investment_date': ['investment_date', 'date', 'invest_date', 'date_invested'],
                'website': ['website', 'url', 'web', 'company_website'],
            },
            'climate_risk': {
                'physical_risk_score': ['physical_risk', 'physical_risk_score', 'physical'],
                'transition_risk_score': ['transition_risk', 'transition_risk_score', 'transition'],
                'flood_risk': ['flood_risk', 'flood'],
                'drought_risk': ['drought_risk', 'drought'],
                'assessment_date': ['assessment_date', 'date', 'assessment_date'],
            },
            'esg_score': {
                'overall_esg_score': ['esg_score', 'overall_esg', 'esg', 'total_esg'],
                'environmental_score': ['environmental', 'env_score', 'e_score'],
                'social_score': ['social', 'social_score', 's_score'],
                'governance_score': ['governance', 'gov_score', 'g_score'],
                'assessment_date': ['assessment_date', 'date', 'assessment_date'],
            },
            'emissions': {
                'scope1_emissions': ['scope1', 'scope_1', 'direct_emissions'],
                'scope2_emissions': ['scope2', 'scope_2', 'indirect_energy'],
                'scope3_emissions': ['scope3', 'scope_3', 'indirect_other'],
                'total_emissions': ['total_emissions', 'total', 'emissions_total'],
                'reporting_year': ['year', 'reporting_year', 'emissions_year'],
            },
            'social_impact': {
                'overall_impact_score': ['impact_score', 'overall_impact', 'social_impact'],
                'beneficiaries_reached': ['beneficiaries', 'people_reached', 'beneficiaries_count'],
                'jobs_created': ['jobs', 'jobs_created', 'employment_created'],
                'assessment_date': ['assessment_date', 'date', 'assessment_date'],
            }
        }
        
        if data_type not in field_mappings:
            return {}
        
        expected_fields = field_mappings[data_type]
        df_columns_lower = [col.lower().strip() for col in df.columns]
        
        for field, possible_names in expected_fields.items():
            matches = [col for col in df_columns_lower if any(name in col for name in possible_names)]
            if matches:
                suggestions[field] = matches
        
        return suggestions
    
    @staticmethod
    def import_investments(
        db: Session,
        df: pd.DataFrame,
        field_mapping: Dict[str, str],
        skip_errors: bool = True
    ) -> Dict[str, Any]:
        """Import investments from DataFrame using field mapping"""
        results = {
            'success': 0,
            'errors': [],
            'skipped': 0
        }
        
        for idx, row in df.iterrows():
            try:
                # Map fields
                investment_data = {}
                for db_field, csv_column in field_mapping.items():
                    if csv_column in df.columns:
                        value = row[csv_column]
                        # Handle NaN values
                        if pd.isna(value):
                            continue
                        
                        # Type conversions
                        if db_field in ['investment_amount', 'current_value', 'ownership_percentage']:
                            value = float(value) if value else None
                        elif db_field == 'investment_date':
                            if isinstance(value, str):
                                value = pd.to_datetime(value).date()
                            elif isinstance(value, pd.Timestamp):
                                value = value.date()
                        else:
                            value = str(value) if value else None
                        
                        investment_data[db_field] = value
                
                # Ensure required fields
                if 'name' not in investment_data or not investment_data['name']:
                    if skip_errors:
                        results['skipped'] += 1
                        continue
                    else:
                        raise ValueError(f"Row {idx + 1}: Missing required field 'name'")
                
                if 'company_name' not in investment_data:
                    investment_data['company_name'] = investment_data.get('name', '')
                
                # Create investment
                investment_create = InvestmentCreate(**investment_data)
                InvestmentService.create_investment(db, investment_create)
                results['success'] += 1
                
            except Exception as e:
                error_msg = f"Row {idx + 1}: {str(e)}"
                results['errors'].append(error_msg)
                if not skip_errors:
                    raise ValueError(error_msg)
        
        return results
    
    @staticmethod
    def import_climate_risks(
        db: Session,
        df: pd.DataFrame,
        field_mapping: Dict[str, str],
        investment_id_column: Optional[str] = None,
        skip_errors: bool = True
    ) -> Dict[str, Any]:
        """Import climate risks from DataFrame"""
        results = {
            'success': 0,
            'errors': [],
            'skipped': 0
        }
        
        for idx, row in df.iterrows():
            try:
                # Get investment ID
                if investment_id_column and investment_id_column in df.columns:
                    investment_id = int(row[investment_id_column])
                else:
                    # Try to find investment by name
                    name_col = field_mapping.get('investment_name') or 'name'
                    if name_col in df.columns:
                        investment_name = str(row[name_col])
                        investment = db.query(Investment).filter(
                            Investment.name == investment_name
                        ).first()
                        if not investment:
                            if skip_errors:
                                results['skipped'] += 1
                                continue
                            else:
                                raise ValueError(f"Row {idx + 1}: Investment not found: {investment_name}")
                        investment_id = investment.id
                    else:
                        if skip_errors:
                            results['skipped'] += 1
                            continue
                        else:
                            raise ValueError(f"Row {idx + 1}: Cannot determine investment_id")
                
                # Map fields
                risk_data = {'investment_id': investment_id}
                for db_field, csv_column in field_mapping.items():
                    if csv_column in df.columns and db_field != 'investment_id':
                        value = row[csv_column]
                        if pd.isna(value):
                            continue
                        
                        if db_field in ['assessment_date']:
                            if isinstance(value, str):
                                value = pd.to_datetime(value).date()
                            elif isinstance(value, pd.Timestamp):
                                value = value.date()
                        elif db_field.endswith('_score') or db_field.endswith('_risk'):
                            value = float(value) if value else None
                        else:
                            value = str(value) if value else None
                        
                        risk_data[db_field] = value
                
                # Ensure assessment_date
                if 'assessment_date' not in risk_data:
                    risk_data['assessment_date'] = date.today()
                
                # Create climate risk
                risk_create = ClimateRiskCreate(**risk_data)
                ClimateRiskService.create_climate_risk(db, risk_create)
                results['success'] += 1
                
            except Exception as e:
                error_msg = f"Row {idx + 1}: {str(e)}"
                results['errors'].append(error_msg)
                if not skip_errors:
                    raise ValueError(error_msg)
        
        return results
    
    @staticmethod
    def validate_import_data(
        df: pd.DataFrame,
        field_mapping: Dict[str, str],
        data_type: str
    ) -> Dict[str, Any]:
        """Validate import data before processing using validation rules engine"""
        validation_results = {
            'valid': True,
            'warnings': [],
            'errors': [],
            'info': []
        }
        
        # Check required fields
        required_fields = {
            'investment': ['name'],
            'climate_risk': ['investment_id'],
            'esg_score': ['investment_id', 'assessment_date'],
            'emissions': ['investment_id', 'reporting_year'],
            'social_impact': ['investment_id', 'assessment_date']
        }
        
        if data_type in required_fields:
            for field in required_fields[data_type]:
                if field not in field_mapping:
                    validation_results['valid'] = False
                    validation_results['errors'].append(f"Missing required field mapping: {field}")
                elif field_mapping[field] not in df.columns:
                    validation_results['valid'] = False
                    validation_results['errors'].append(f"Column '{field_mapping[field]}' not found in file")
        
        # Check for empty DataFrame
        if df.empty:
            validation_results['valid'] = False
            validation_results['errors'].append("File is empty")
            return validation_results
        
        # Check for duplicate rows
        if df.duplicated().any():
            validation_results['warnings'].append("File contains duplicate rows")
        
        # Use validation rules engine for data quality checks
        # Convert first few rows to dict format for validation
        sample_size = min(10, len(df))
        data_list = []
        
        for idx in range(sample_size):
            row_data = {}
            for db_field, csv_column in field_mapping.items():
                if csv_column in df.columns:
                    value = df.iloc[idx][csv_column]
                    if pd.notna(value):
                        # Type conversions for validation
                        if db_field in ['investment_amount', 'current_value', 'ownership_percentage', 
                                       'scope1_emissions', 'scope2_emissions', 'scope3_emissions', 
                                       'total_emissions']:
                            try:
                                row_data[db_field] = float(value)
                            except:
                                pass
                        elif db_field in ['overall_esg_score', 'environmental_score', 'social_score', 
                                         'governance_score', 'physical_risk_score', 'transition_risk_score',
                                         'overall_impact_score']:
                            try:
                                row_data[db_field] = float(value)
                            except:
                                pass
                        elif db_field in ['beneficiaries_reached', 'jobs_created']:
                            try:
                                row_data[db_field] = int(value)
                            except:
                                pass
                        else:
                            row_data[db_field] = value
            
            # Add context for cross-field validation
            context = row_data.copy()
            data_list.append((row_data, context))
        
        # Run validation rules
        if data_list:
            validation_type = data_type.replace('_', '')  # 'climate_risk' -> 'climaterisk' -> 'climate_risk'
            if validation_type == 'climaterisk':
                validation_type = 'climate_risk'
            
            for row_data, context in data_list:
                result = validation_engine.validate_data(validation_type, row_data, context)
                validation_results['errors'].extend(result['errors'])
                validation_results['warnings'].extend(result['warnings'])
                validation_results['info'].extend(result['info'])
            
            if validation_results['errors']:
                validation_results['valid'] = False
        
        return validation_results

