package com.smartride.service;

import com.smartride.model.Ride;
import com.smartride.model.User;
import com.smartride.repository.RideRepository;
import com.smartride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Ride postRide(Ride ride) {
        if (ride.getDriver() == null || ride.getDriver().getId() == null) throw new IllegalArgumentException("Driver ID is required");
        User driver = userRepository.findById(ride.getDriver().getId()).orElseThrow();
        ride.setDriver(driver);
        
        if (ride.getStatus() == null) {
            ride.setStatus(Ride.RideStatus.PENDING);
        }

        // Set parent reference for waypoints to avoid null constraint violations
        if (ride.getPickupPoints() != null) {
            ride.getPickupPoints().forEach(p -> p.setRide(ride));
        }
        if (ride.getDropPoints() != null) {
            ride.getDropPoints().forEach(d -> d.setRide(ride));
        }
        
        Ride saved = rideRepository.save(ride);
        notificationService.notifyNewRideToAdmin(saved);
        
        return saved;
    }

    @Transactional
    public void startRide(Long rideId) {
        if (rideId == null) return;
        rideRepository.findById(rideId).orElseThrow();
        // Assuming there's a STARTING status or logic
        notificationService.notifyRideStarted(rideId);
    }

    @Transactional
    public void completeRide(Long rideId) {
        if (rideId == null) return;
        Ride ride = rideRepository.findById(rideId).orElseThrow();
        ride.setStatus(Ride.RideStatus.COMPLETED);
        rideRepository.save(ride);
        
        notificationService.notifyRideCompleted(rideId);
    }
}
