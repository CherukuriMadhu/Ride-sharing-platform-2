# Create final test passenger and driver users

function CreateTestUser($email, $password, $name, $role) {
    try {
        Write-Host "Creating $role user: $email"
        
        $userData = @{
            email = $email
            password = $password
            name = $name
            role = $role
        } | ConvertTo-Json -Depth 10
        
        $response = Invoke-WebRequest -Uri "http://localhost:8082/api/users/register-simple" -Method POST -ContentType "application/json" -Body $userData -UseBasicParsing
        Write-Host "SUCCESS: $($response.Content)"
        return $true
        
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "Error response: $errorBody"
            } catch {
                Write-Host "Could not read error response"
            }
        }
        return $false
    }
}

Write-Host "Creating test users..."
Write-Host "===================="

# Create passenger
$passengerSuccess = CreateTestUser "passenger@test.com" "test123" "Test Passenger" "PASSENGER"

# Create driver  
$driverSuccess = CreateTestUser "driver@test.com" "test123" "Test Driver" "DRIVER"

Write-Host "`nUser Creation Summary:"
Write-Host "======================="
Write-Host "Passenger user created: $passengerSuccess"
Write-Host "Driver user created: $driverSuccess"

Write-Host "`nAvailable Test Credentials:"
Write-Host "============================"
Write-Host "Admin: admin@smartride.com / admin123"
Write-Host "Passenger: passenger@test.com / test123"
Write-Host "Driver: driver@test.com / test123"
Write-Host "Basic Test: test@basic.com / test123"
