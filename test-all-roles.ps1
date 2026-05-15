# Test all user roles

Write-Host "Testing all user roles..."

$users = @(
    @{email="admin@smartride.com"; password="admin123"; type="Admin"},
    @{email="test@basic.com"; password="test123"; type="Passenger"},
    @{email="john.passenger@test.com"; password="test123"; type="Passenger"},
    @{email="jane.driver@test.com"; password="test123"; type="Driver"}
)

foreach ($user in $users) {
    try {
        $loginData = @{
            email = $user.email
            password = $user.password
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:8082/api/users/login" -Method POST -ContentType "application/json" -Body $loginData -UseBasicParsing
        $responseData = $response.Content | ConvertFrom-Json
        
        Write-Host "SUCCESS: $($user.type) login - $($responseData.user.name) ($($responseData.user.role))"
        
    } catch {
        Write-Host "FAILED: $($user.type) login - $($user.email)"
    }
}
