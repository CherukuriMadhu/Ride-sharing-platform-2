package com.smartride.repository;

import com.smartride.model.Booking;
import com.smartride.model.Ride;
import com.smartride.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassenger(User passenger);

    List<Booking> findByRide(Ride ride);

    List<Booking> findByRide_Driver(User driver);

    List<Booking> findByRide_Driver_Id(Long driverId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    Optional<Booking> findByIdForUpdate(@Param("id") Long id);

    List<Booking> findByRideIdAndPassengerId(Long rideId, Long passengerId);

    List<Booking> findByRideId(Long rideId);

    List<Booking> findByRideIdAndStatus(Long rideId, Booking.BookingStatus status);
}
