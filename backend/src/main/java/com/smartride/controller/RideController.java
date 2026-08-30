package com.smartride.controller;

import com.smartride.model.Ride;
import com.smartride.model.User;
import com.smartride.repository.RideRepository;
import com.smartride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    @Autowired
    private com.smartride.service.RideService rideService;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> postRide(@RequestBody Ride ride) {
        try {
            if (ride.getDriver() == null || ride.getDriver().getId() == null) {
                return ResponseEntity.badRequest().body("Driver information is required");
            }
            Ride savedRide = rideService.postRide(ride);
            return ResponseEntity.ok(savedRide);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to post ride: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startRide(@PathVariable Long id) {
        try {
            rideService.startRide(id);
            return ResponseEntity.ok("Ride started");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeRide(@PathVariable Long id) {
        try {
            rideService.completeRide(id);
            return ResponseEntity.ok("Ride completed");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/driver/{driverId}")
    public List<Ride> getRidesByDriver(@PathVariable Long driverId) {
        if (driverId == null)
            return List.of();
        User driver = userRepository.findById(driverId).orElse(null);
        if (driver == null)
            return List.of();
        return rideRepository.findByDriver(driver);
    }

    @GetMapping("/all")
    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    @GetMapping("/search")
    public List<Ride> searchRides(@RequestParam String source, @RequestParam String destination) {
        String sQuery = source.toLowerCase();
        String dQuery = destination.toLowerCase();

        return rideRepository.findAll().stream()
                .filter(r -> {
                    if (r.getSource() == null || r.getSource().getAddress() == null)
                        return false;
                    String rSource = r.getSource().getAddress().toLowerCase();
                    // Flexible matching: check if source contains query or query contains source
                    // parts
                    return rSource.contains(sQuery) || sQuery.contains(rSource) ||
                            isFuzzyMatch(rSource, sQuery);
                })
                .filter(r -> {
                    if (r.getDestination() == null || r.getDestination().getAddress() == null)
                        return false;
                    String rDest = r.getDestination().getAddress().toLowerCase();
                    return rDest.contains(dQuery) || dQuery.contains(rDest) ||
                            isFuzzyMatch(rDest, dQuery);
                })
                .filter(r -> r.getStatus() == Ride.RideStatus.APPROVED || r.getStatus() == Ride.RideStatus.ACCEPTED
                        || r.getStatus() == Ride.RideStatus.PENDING)
                .toList();
    }

    private boolean isFuzzyMatch(String address, String query) {
        String[] queryParts = query.split("[,\\s]+");
        int matches = 0;
        for (String part : queryParts) {
            if (part.length() > 2 && address.contains(part)) {
                matches++;
            }
        }
        // If at least 2 significant parts match, consider it a match
        return matches >= 2;
    }
}
