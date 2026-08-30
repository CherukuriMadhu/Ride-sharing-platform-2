package com.smartride.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pickup_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Embedded
    private Location location;

    @ManyToOne
    @JoinColumn(name = "ride_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Ride ride;
}
