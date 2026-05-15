# Test with curl-like approach

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Accept" = "application/json"
    }
    
    $body = '{"email":"admin@smartride.com","password":"admin123"}'
    
    $response = Invoke-WebRequest -Uri "http://localhost:8082/api/users/login" -Method POST -Headers $headers -Body $body -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Login working"
    Write-Host "User: $($content.user.name)"
    Write-Host "Role: $($content.user.role)"
    Write-Host "Token: $($content.token.Substring(0, 20))..."
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
    }
}
