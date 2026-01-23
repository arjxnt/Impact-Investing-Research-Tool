"""
Data Validation Rules Engine
Automated data quality checks and validation rules for impact investing data
"""

from typing import Dict, List, Any, Optional, Callable
from datetime import date, datetime
from enum import Enum
import re


class ValidationSeverity(str, Enum):
    """Severity levels for validation issues"""
    ERROR = "error"  # Blocks import/operation
    WARNING = "warning"  # Should be reviewed
    INFO = "info"  # Informational only


class ValidationRule:
    """Base class for validation rules"""
    
    def __init__(
        self,
        field_name: str,
        rule_name: str,
        severity: ValidationSeverity,
        validator: Callable,
        message: str
    ):
        self.field_name = field_name
        self.rule_name = rule_name
        self.severity = severity
        self.validator = validator
        self.message = message
    
    def validate(self, value: Any, context: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """Validate a value and return issue if found"""
        try:
            if not self.validator(value, context or {}):
                return {
                    "field": self.field_name,
                    "rule": self.rule_name,
                    "severity": self.severity.value,
                    "message": self.message.format(field=self.field_name, value=value)
                }
        except Exception as e:
            return {
                "field": self.field_name,
                "rule": self.rule_name,
                "severity": ValidationSeverity.ERROR.value,
                "message": f"Validation error: {str(e)}"
            }
        return None


class DataValidationEngine:
    """Rules engine for validating impact investing data"""
    
    def __init__(self):
        self.rules: Dict[str, List[ValidationRule]] = {}
        self._initialize_rules()
    
    def _initialize_rules(self):
        """Initialize validation rules for all data types"""
        
        # Investment validation rules
        self.rules['investment'] = [
            # Required fields
            ValidationRule(
                'name',
                'required',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is not None and str(v).strip() != '',
                "Field '{field}' is required"
            ),
            ValidationRule(
                'company_name',
                'required',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is not None and str(v).strip() != '',
                "Field '{field}' is required"
            ),
            
            # Value validations
            ValidationRule(
                'investment_amount',
                'positive_value',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (isinstance(v, (int, float)) and v >= 0),
                "Investment amount must be positive or zero"
            ),
            ValidationRule(
                'current_value',
                'positive_value',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (isinstance(v, (int, float)) and v >= 0),
                "Current value must be positive or zero"
            ),
            ValidationRule(
                'ownership_percentage',
                'percentage_range',
                ValidationSeverity.WARNING,
                lambda v, ctx: v is None or (0 <= float(v) <= 100),
                "Ownership percentage must be between 0 and 100"
            ),
            
            # Date validations
            ValidationRule(
                'investment_date',
                'date_not_future',
                ValidationSeverity.WARNING,
                lambda v, ctx: v is None or (isinstance(v, date) and v <= date.today()),
                "Investment date should not be in the future"
            ),
            
            # Website validation
            ValidationRule(
                'website',
                'url_format',
                ValidationSeverity.WARNING,
                lambda v, ctx: v is None or self._is_valid_url(str(v)),
                "Website URL format appears invalid"
            ),
            
            # Value consistency
            ValidationRule(
                'current_value',
                'value_vs_investment',
                ValidationSeverity.WARNING,
                lambda v, ctx: self._check_value_consistency(v, ctx),
                "Current value is significantly lower than investment amount - verify data"
            ),
        ]
        
        # ESG Score validation rules
        self.rules['esg_score'] = [
            ValidationRule(
                'overall_esg_score',
                'score_range',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (0 <= float(v) <= 100),
                "ESG score must be between 0 and 100"
            ),
            ValidationRule(
                'environmental_score',
                'score_range',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (0 <= float(v) <= 100),
                "Environmental score must be between 0 and 100"
            ),
            ValidationRule(
                'social_score',
                'score_range',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (0 <= float(v) <= 100),
                "Social score must be between 0 and 100"
            ),
            ValidationRule(
                'governance_score',
                'score_range',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (0 <= float(v) <= 100),
                "Governance score must be between 0 and 100"
            ),
            ValidationRule(
                'overall_esg_score',
                'score_consistency',
                ValidationSeverity.WARNING,
                lambda v, ctx: self._check_esg_consistency(v, ctx),
                "Overall ESG score should be approximately average of E, S, G scores"
            ),
        ]
        
        # Climate Risk validation rules
        self.rules['climate_risk'] = [
            ValidationRule(
                'physical_risk_score',
                'risk_score_range',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (0 <= float(v) <= 10),
                "Physical risk score must be between 0 and 10"
            ),
            ValidationRule(
                'transition_risk_score',
                'risk_score_range',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (0 <= float(v) <= 10),
                "Transition risk score must be between 0 and 10"
            ),
        ]
        
        # Emissions validation rules
        self.rules['emissions'] = [
            ValidationRule(
                'total_emissions',
                'positive_value',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (isinstance(v, (int, float)) and v >= 0),
                "Total emissions must be positive or zero"
            ),
            ValidationRule(
                'scope1_emissions',
                'positive_value',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (isinstance(v, (int, float)) and v >= 0),
                "Scope 1 emissions must be positive or zero"
            ),
            ValidationRule(
                'total_emissions',
                'emissions_consistency',
                ValidationSeverity.WARNING,
                lambda v, ctx: self._check_emissions_consistency(v, ctx),
                "Total emissions should equal sum of Scope 1, 2, and 3"
            ),
            ValidationRule(
                'reporting_year',
                'year_range',
                ValidationSeverity.WARNING,
                lambda v, ctx: v is None or (2000 <= int(v) <= date.today().year + 1),
                "Reporting year seems out of range"
            ),
        ]
        
        # Social Impact validation rules
        self.rules['social_impact'] = [
            ValidationRule(
                'overall_impact_score',
                'score_range',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (0 <= float(v) <= 10),
                "Impact score must be between 0 and 10"
            ),
            ValidationRule(
                'beneficiaries_reached',
                'positive_integer',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (isinstance(v, int) and v >= 0),
                "Beneficiaries reached must be a positive integer"
            ),
            ValidationRule(
                'jobs_created',
                'positive_integer',
                ValidationSeverity.ERROR,
                lambda v, ctx: v is None or (isinstance(v, int) and v >= 0),
                "Jobs created must be a positive integer"
            ),
        ]
    
    def validate_data(
        self,
        data_type: str,
        data: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validate data against rules for the given data type
        
        Returns:
            {
                'valid': bool,
                'errors': List[Dict],
                'warnings': List[Dict],
                'info': List[Dict]
            }
        """
        if data_type not in self.rules:
            return {
                'valid': True,
                'errors': [],
                'warnings': [],
                'info': []
            }
        
        errors = []
        warnings = []
        info = []
        
        for rule in self.rules[data_type]:
            value = data.get(rule.field_name)
            issue = rule.validate(value, context or {})
            
            if issue:
                if issue['severity'] == ValidationSeverity.ERROR.value:
                    errors.append(issue)
                elif issue['severity'] == ValidationSeverity.WARNING.value:
                    warnings.append(issue)
                else:
                    info.append(issue)
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'info': info
        }
    
    def validate_batch(
        self,
        data_type: str,
        data_list: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Validate a batch of records"""
        all_errors = []
        all_warnings = []
        all_info = []
        valid_count = 0
        
        for idx, data in enumerate(data_list):
            result = self.validate_data(data_type, data, context)
            if result['valid']:
                valid_count += 1
            else:
                # Add row number to errors
                for error in result['errors']:
                    error['row'] = idx + 1
                    all_errors.append(error)
            
            for warning in result['warnings']:
                warning['row'] = idx + 1
                all_warnings.append(warning)
            
            for info_item in result['info']:
                info_item['row'] = idx + 1
                all_info.append(info_item)
        
        return {
            'valid_count': valid_count,
            'invalid_count': len(data_list) - valid_count,
            'total': len(data_list),
            'errors': all_errors,
            'warnings': all_warnings,
            'info': all_info
        }
    
    @staticmethod
    def _is_valid_url(url: str) -> bool:
        """Check if URL format is valid"""
        if not url:
            return True
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        return bool(url_pattern.match(url))
    
    @staticmethod
    def _check_value_consistency(current_value: Any, context: Dict[str, Any]) -> bool:
        """Check if current value is reasonable compared to investment amount"""
        if current_value is None:
            return True
        
        investment_amount = context.get('investment_amount')
        if investment_amount is None or investment_amount == 0:
            return True
        
        # Allow for significant loss (down to 10% of original) but flag if too low
        ratio = float(current_value) / float(investment_amount)
        return ratio >= 0.1  # Allow up to 90% loss before warning
    
    @staticmethod
    def _check_esg_consistency(overall_score: Any, context: Dict[str, Any]) -> bool:
        """Check if overall ESG score is consistent with component scores"""
        if overall_score is None:
            return True
        
        env = context.get('environmental_score')
        social = context.get('social_score')
        gov = context.get('governance_score')
        
        if None in [env, social, gov]:
            return True
        
        # Calculate average
        avg = (float(env) + float(social) + float(gov)) / 3
        
        # Allow 5 point difference
        return abs(float(overall_score) - avg) <= 5
    
    @staticmethod
    def _check_emissions_consistency(total: Any, context: Dict[str, Any]) -> bool:
        """Check if total emissions equals sum of scopes"""
        if total is None:
            return True
        
        scope1 = context.get('scope1_emissions') or 0
        scope2 = context.get('scope2_emissions') or 0
        scope3 = context.get('scope3_emissions') or 0
        
        expected_total = float(scope1) + float(scope2) + float(scope3)
        
        # Allow 1% difference for rounding
        if expected_total == 0:
            return True
        
        diff = abs(float(total) - expected_total) / expected_total
        return diff <= 0.01


# Global validation engine instance
validation_engine = DataValidationEngine()

