package com.smartride.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long rideId;

    @ManyToOne
    @JoinColumn(name = "passenger_id", nullable = false)
    private User passenger;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(name = "reviewed_user_id", nullable = false)
    private Long reviewedUserId;

    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;

    @Column(nullable = false)
    private int rating; // 1-5

    @Column(length = 1000)
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}
