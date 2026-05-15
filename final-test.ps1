# Final test of the application

try {
    $body = '{"email":"admin@smartride.com","password":"admin123"}'
    $response = Invoke-RestMethod -Uri "http://localhost:8083/api/users/login" -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "SUCCESS: Login working"
    Write-Host "User: $($response.user.name)"
    Write-Host "Role: $($response.user.role)"
    Write-Host "Application is running on port 8083"
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
