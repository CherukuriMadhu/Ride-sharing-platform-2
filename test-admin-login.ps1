try {
    $loginData = @{
        email = 'admin@smartride.com'
        password = 'admin123'
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri 'http://localhost:8082/api/users/login' -Method POST -ContentType 'application/json' -Body $loginData
    Write-Host 'Login successful!'
    Write-Host 'Response: ' ($loginResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3)
} catch {
    Write-Host 'Login failed:' $_.Exception.Message
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
