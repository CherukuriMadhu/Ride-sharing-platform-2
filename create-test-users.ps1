# Create test passenger and driver users

function CreateUser($email, $password, $name, $role, $firstName, $lastName) {
    try {
        Write-Host "Creating $role user: $email"
        
        # Create multipart form data for registration
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = @()
        $bodyLines += "--$boundary$LF"
        $bodyLines += "Content-Disposition: form-data; name=`"data`"$LF"
        $bodyLines += "Content-Type: application/json$LF$LF"
        
        $userData = @{
            email = $email
            password = $password
            name = $name
            firstName = $firstName
            lastName = $lastName
            role = $role
            contactNo = "1234567890"
            gender = "Other"
            dob = "1990-01-01"
        } | ConvertTo-Json -Depth 10
        
        $bodyLines += $userData + $LF
        $bodyLines += "--$boundary--$LF"
        
        $body = $bodyLines -join ""
        
        $response = Invoke-WebRequest -Uri "http://localhost:8082/api/users/register" -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $body
        Write-Host "$role user created successfully: $($response.Content)"
        
    } catch {
        Write-Host "Failed to create $role user: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "Error response: $errorBody"
            } catch {
                Write-Host "Could not read error response body"
            }
        }
    }
}

# Create test passenger
CreateUser "passenger@test.com" "test123" "Test Passenger" "PASSENGER" "Test" "Passenger"

# Create test driver  
CreateUser "driver@test.com" "test123" "Test Driver" "DRIVER" "Test" "Driver"

Write-Host "`nTest users created. You can now login with:"
Write-Host "Passenger: passenger@test.com / test123"
Write-Host "Driver: driver@test.com / test123"
