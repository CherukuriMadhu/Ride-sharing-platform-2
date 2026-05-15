# Test application on port 9090

try {
    $body = '{"email":"admin@smartride.com","password":"admin123"}'
    $response = Invoke-RestMethod -Uri "http://localhost:9090/api/users/login" -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "SUCCESS: Application working on port 9090"
    Write-Host "User: $($response.user.name)"
    Write-Host "Role: $($response.user.role)"
    Write-Host "Token: $($response.token.Substring(0, 20))..."
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
