package com.smartride.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(nullable = false)
    private String name;

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    private AccountStatus status = AccountStatus.ACTIVE;

    private String contactNo;
    private String gender;
    private LocalDate dob;

    // Address Details
    private String address;
    private String city;
    private String state;
    private String zipCode;

    // Education Details
    private String highSchoolName;
    private String highSchoolPercentage;
    private String highSchoolYear;
    private String intermediateCollegeName;
    private String intermediatePercentage;
    private String intermediateYear;
    private String graduationCollegeName;
    private String graduationPercentage;
    private String graduationYear;

    // Driver & Vehicle Details
    private String licenseNumber;
    private String rcNumber;
    private String insurancePolicyNumber;
    private String drivingExperience;
    private String vehicleDetails;

    @JsonIgnore
    private String aadhaarPath;
    @JsonIgnore
    private String licensePath;
    @JsonIgnore
    private String rcPath;
    @JsonIgnore
    private String insurancePath;

    private String profileImage;
    private Double walletBalance = 0.0;
    private Double averageRating = 0.0;
    private Integer totalReviews = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum Role {
        ADMIN, PASSENGER, DRIVER
    }

    public enum AccountStatus {
        ACTIVE, INACTIVE, BANNED, PENDING
    }
}
