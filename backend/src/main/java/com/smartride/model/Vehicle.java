package com.smartride.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vehicleType; // Car, SUV, etc.
    private String vehicleModel;
    private String vehicleNumber; // Plate number
    private String vehicleColor;
    private int seats;
    private String rcNumber;
    private String insuranceNumber;

    @Column(nullable = false)
    private boolean isVerified = false;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    @JsonProperty("user")
    @com.fasterxml.jackson.annotation.JsonAlias("driver")
    private User driver;
}
