package com.smartride.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SimpleRegistrationRequest {
    private String email;
    private String password;
    private String name;
    private String firstName;
    private String lastName;
    private String role;
    private String contactNo;
    private String gender;
    private String dob;
}
