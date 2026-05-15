# Test the simple registration endpoint with very basic data

try {
    Write-Host "Testing simple endpoint with basic data..."
    
    $basicData = @{
        email = "test@basic.com"
        password = "test123"
        name = "Basic Test"
        role = "PASSENGER"
    } | ConvertTo-Json -Depth 10
    
    Write-Host "Sending data: $basicData"
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8082/api/users/register-simple" -Method POST -ContentType "application/json" -Body $basicData -UseBasicParsing
        Write-Host "SUCCESS: $($response.Content)"
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
    }
    
} catch {
    Write-Host "Test failed: $($_.Exception.Message)"
}
