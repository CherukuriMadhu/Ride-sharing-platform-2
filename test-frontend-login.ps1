# Test frontend login simulation

try {
    Write-Host "Testing frontend login simulation..."
    
    # Simulate the frontend axios call to /api/users/login
    $loginData = @{
        email = 'admin@smartride.com'
        password = 'admin123'
    } | ConvertTo-Json
    
    try {
        # This simulates the frontend call through the Vite proxy
        $loginResponse = Invoke-WebRequest -Uri 'http://localhost:5173/api/users/login' -Method POST -ContentType 'application/json' -Body $loginData
        Write-Host 'Frontend login successful!'
        $responseData = $loginResponse.Content | ConvertFrom-Json
        Write-Host 'Token:' $responseData.token
        Write-Host 'User Role:' $responseData.user.role
        Write-Host 'User Status:' $responseData.user.status
    } catch {
        Write-Host 'Frontend login failed:' $_.Exception.Message
        if ($_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $errorBody = $reader.ReadToEnd()
                Write-Host 'Error response:' $errorBody
            } catch {
                Write-Host 'Could not read error response body'
            }
        }
    }
    
} catch {
    Write-Host 'Test failed:' $_.Exception.Message
}
