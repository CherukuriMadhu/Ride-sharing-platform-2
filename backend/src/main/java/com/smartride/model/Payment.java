package com.smartride.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String paymentId;
    private String orderId;
    private Long passengerId;
    private Long rideId;
    private Long driverId;
    private Long bookingId;
    private int seats;
    private double pricePerSeat;
    private double totalAmount;
    private double platformCommission;
    private double driverEarnings;
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private LocalDateTime timestamp = LocalDateTime.now();

    public enum PaymentStatus {
        SUCCESS, FAILED
    }
}
