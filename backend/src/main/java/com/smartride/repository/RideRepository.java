package com.smartride.repository;

import com.smartride.model.Ride;
import com.smartride.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByDriver(User driver);

    List<Ride> findByStatus(Ride.RideStatus status);

    List<Ride> findByDepartureTimeBetweenAndStatus(java.time.LocalDateTime start, java.time.LocalDateTime end,
            Ride.RideStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Ride r WHERE r.id = :id")
    Optional<Ride> findByIdForUpdate(@Param("id") Long id);
}
