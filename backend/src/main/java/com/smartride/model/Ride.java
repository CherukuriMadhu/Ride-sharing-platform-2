package com.smartride.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "rides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "latitude", column = @Column(name = "source_lat", nullable = false)),
            @AttributeOverride(name = "longitude", column = @Column(name = "source_lng", nullable = false)),
            @AttributeOverride(name = "address", column = @Column(name = "source_address", nullable = false))
    })
    private Location source;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "latitude", column = @Column(name = "dest_lat", nullable = false)),
            @AttributeOverride(name = "longitude", column = @Column(name = "dest_lng", nullable = false)),
            @AttributeOverride(name = "address", column = @Column(name = "dest_address", nullable = false))
    })
    private Location destination;

    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PickupPoint> pickupPoints = new ArrayList<>();

    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DropPoint> dropPoints = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private int availableSeats;

    @Column(nullable = false)
    private int totalSeats;

    @Column(nullable = false)
    private String priceType = "AUTO"; // FIXED or AUTO

    private double pricePerSeat;
    private double distance;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.totalSeats == 0) {
            this.totalSeats = this.availableSeats;
        }
    }

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RideStatus status = RideStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    public enum RideStatus {
        PENDING, APPROVED, ACCEPTED, REJECTED, COMPLETED, CANCELLED
    }
}
