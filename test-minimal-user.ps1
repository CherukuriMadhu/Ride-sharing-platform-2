# Test minimal user creation

try {
    Write-Host "Testing minimal user creation..."
    
    # Create minimal passenger user
    $passengerData = @{
        email = "passenger@test.com"
        password = "test123"
        name = "Test Passenger"
        role = "PASSENGER"
    } | ConvertTo-Json
    
    Write-Host "Creating passenger with minimal data..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8082/api/users/register-simple" -Method POST -ContentType "application/json" -Body $passengerData -UseBasicParsing
        Write-Host "Passenger created: $($response.Content)"
    } catch {
        Write-Host "Passenger creation failed: $($_.Exception.Message)"
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
    }
    
    # Create minimal driver user
    $driverData = @{
        email = "driver@test.com"
        password = "test123"
        name = "Test Driver"
        role = "DRIVER"
    } | ConvertTo-Json
    
    Write-Host "Creating driver with minimal data..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8082/api/users/register-simple" -Method POST -ContentType "application/json" -Body $driverData -UseBasicParsing
        Write-Host "Driver created: $($response.Content)"
    } catch {
        Write-Host "Driver creation failed: $($_.Exception.Message)"
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
    }
    
} catch {
    Write-Host "Test failed: $($_.Exception.Message)"
}
