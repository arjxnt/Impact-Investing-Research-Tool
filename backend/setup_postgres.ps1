# PostgreSQL Setup Script for Impact Investing Research Tool (PowerShell)
# This script helps set up PostgreSQL database for production use

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "✓ PostgreSQL client is available" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL client (psql) is not in PATH" -ForegroundColor Red
    Write-Host "Please add PostgreSQL bin directory to your PATH or install PostgreSQL"
    Write-Host "Download from: https://www.postgresql.org/download/windows/"
    exit 1
}

# Get database configuration
$DB_USER = Read-Host "Enter PostgreSQL username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($DB_USER)) { $DB_USER = "postgres" }

$securePassword = Read-Host "Enter PostgreSQL password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$DB_HOST = Read-Host "Enter database host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($DB_HOST)) { $DB_HOST = "localhost" }

$DB_PORT = Read-Host "Enter database port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($DB_PORT)) { $DB_PORT = "5432" }

$DB_NAME = Read-Host "Enter database name (default: impact_investing)"
if ([string]::IsNullOrWhiteSpace($DB_NAME)) { $DB_NAME = "impact_investing" }

Write-Host ""
Write-Host "Creating database and user..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable for this session
$env:PGPASSWORD = $DB_PASSWORD

# Create database
$createDbQuery = @"
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')
"@

try {
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c $createDbQuery
    if ($result -match "CREATE DATABASE") {
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c $result | Out-Null
    }
    
    # Create user
    $userName = "${DB_NAME}_user"
    $createUserQuery = @"
DO `$`$`$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$userName') THEN
        CREATE USER $userName WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
`$`$`$;
"@
    
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c $createUserQuery | Out-Null
    
    # Grant privileges
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $userName" | Out-Null
    
    # Grant schema privileges
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $userName" | Out-Null
    
    Write-Host "✓ Database and user created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating database: $_" -ForegroundColor Red
    Write-Host "Please check your PostgreSQL credentials and try again"
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Database Setup Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add this to your .env file:" -ForegroundColor Yellow
Write-Host ""
Write-Host "DATABASE_URL=postgresql+psycopg2://${DB_NAME}_user:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -ForegroundColor White
Write-Host ""
Write-Host "Or use individual components:" -ForegroundColor Yellow
Write-Host "DB_USER=${DB_NAME}_user"
Write-Host "DB_PASSWORD=${DB_PASSWORD}"
Write-Host "DB_HOST=${DB_HOST}"
Write-Host "DB_PORT=${DB_PORT}"
Write-Host "DB_NAME=${DB_NAME}"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create a .env file in the backend directory with the above configuration"
Write-Host "2. Run: python init_db.py"
Write-Host "3. Start the application: python -m uvicorn main:app --reload"
Write-Host ""

