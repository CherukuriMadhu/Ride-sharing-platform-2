package com.smartride.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;

    @ManyToOne
    @JoinColumn(name = "passenger_id", nullable = false)
    private User passenger;

    private int seatsBooked;
    private double distanceFare;
    private double baseFare;
    private double platformFee;
    private double totalPrice;
    private LocalDateTime bookingTime = LocalDateTime.now();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BookingStatus status = BookingStatus.REQUESTED;

    // Stripe Payment Details
    private String transactionId;
    private String paymentStatus;
    private LocalDateTime paymentDate;
    private Double amount;
    private String currency = "INR";
    private boolean reviewed = false;

    public enum BookingStatus {
        REQUESTED, ACCEPTED, REJECTED, CONFIRMED, PAID, CANCELLED, COMPLETED
    }
}
