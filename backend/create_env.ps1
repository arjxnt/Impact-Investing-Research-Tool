# PowerShell script to create .env file from template

Write-Host "Creating .env file from template..." -ForegroundColor Cyan

$templatePath = Join-Path $PSScriptRoot "env.template"
$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    $overwrite = Read-Host ".env file already exists. Overwrite? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Cancelled. .env file not modified." -ForegroundColor Yellow
        exit 0
    }
}

if (Test-Path $templatePath) {
    Copy-Item $templatePath $envPath
    Write-Host "Success! .env file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Edit .env file and configure your database settings"
    Write-Host "2. For PostgreSQL: Update DATABASE_URL with your credentials"
    Write-Host "3. For SQLite: Leave DATABASE_URL as is (default)"
    Write-Host ""
    Write-Host "File location: $envPath" -ForegroundColor Gray
} else {
    Write-Host "Error: Template file not found: $templatePath" -ForegroundColor Red
    exit 1
}

