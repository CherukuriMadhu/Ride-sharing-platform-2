# Simple authentication test

Write-Host "Testing authentication system..."

try {
    $loginData = @{
        email = "admin@smartride.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8082/api/users/login" -Method POST -ContentType "application/json" -Body $loginData -UseBasicParsing
    $responseData = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Admin login working"
    Write-Host "User: $($responseData.user.name)"
    Write-Host "Role: $($responseData.user.role)"
    Write-Host "Status: $($responseData.user.status)"
    
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
}
