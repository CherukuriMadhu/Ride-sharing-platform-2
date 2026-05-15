# Test login for all users

function TestLogin($email, $password, $userType) {
    try {
        Write-Host "Testing $userType login: $email"
        
        $loginData = @{
            email = $email
            password = $password
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:8082/api/users/login" -Method POST -ContentType "application/json" -Body $loginData -UseBasicParsing
        $responseData = $response.Content | ConvertFrom-Json
        
        Write-Host "✅ $userType login SUCCESS!"
        Write-Host "   Role: $($responseData.user.role)"
        Write-Host "   Status: $($responseData.user.status)"
        Write-Host "   Name: $($responseData.user.name)"
        Write-Host ""
        
        return $responseData
        
    } catch {
        Write-Host "❌ $userType login FAILED: $($_.Exception.Message)"
        Write-Host ""
        return $null
    }
}

Write-Host "Testing all user logins..."
Write-Host "========================"

# Test admin
$adminResult = TestLogin "admin@smartride.com" "admin123" "Admin"

# Test basic user that was created
$basicResult = TestLogin "test@basic.com" "test123" "Basic User"

# Test passenger
$passengerResult = TestLogin "passenger@test.com" "test123" "Passenger"

# Test driver
$driverResult = TestLogin "driver@test.com" "test123" "Driver"

Write-Host "Login Test Summary:"
Write-Host "=================="
Write-Host "Admin: $(if ($adminResult) { '✅ Working' } else { '❌ Failed' })"
Write-Host "Basic User: $(if ($basicResult) { '✅ Working' } else { '❌ Failed' })"
Write-Host "Passenger: $(if ($passengerResult) { '✅ Working' } else { '❌ Failed' })"
Write-Host "Driver: $(if ($driverResult) { '✅ Working' } else { '❌ Failed' })"
