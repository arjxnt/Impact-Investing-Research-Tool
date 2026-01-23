# Test API endpoints
Write-Host "Testing API endpoints..." -ForegroundColor Cyan

$baseUrl = "http://localhost:8000/api"

# Test investments endpoint
Write-Host ""
Write-Host "1. Testing /investments..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/investments" -Method Get -ErrorAction Stop
    Write-Host "   Success! Found $($response.Count) investments" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "   First investment: $($response[0].name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Failed: $_" -ForegroundColor Red
}

# Test dashboard endpoint
Write-Host ""
Write-Host "2. Testing /portfolio/dashboard..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/portfolio/dashboard" -Method Get -ErrorAction Stop
    Write-Host "   Success!" -ForegroundColor Green
    Write-Host "   Total investments: $($response.summary.total_investments)" -ForegroundColor Gray
    Write-Host "   Total value: $($response.summary.total_value)" -ForegroundColor Gray
} catch {
    Write-Host "   Failed: $_" -ForegroundColor Red
}

# Test recommendations endpoint
Write-Host ""
Write-Host "3. Testing /portfolio/recommendations..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/portfolio/recommendations" -Method Get -ErrorAction Stop
    Write-Host "   Success! Found $($response.recommendations.Count) recommendations" -ForegroundColor Green
} catch {
    Write-Host "   Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
