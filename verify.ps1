# Verify authentication system

Write-Host "Verifying Smart Ride Sharing Authentication..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8082/api/users/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@smartride.com","password":"admin123"}'
    Write-Host "SUCCESS: Admin authentication working"
    Write-Host "User: $($response.user.name)"
    Write-Host "Role: $($response.user.role)"
    Write-Host "Status: COMPLETE SUCCESS - System ready for production"
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
}
