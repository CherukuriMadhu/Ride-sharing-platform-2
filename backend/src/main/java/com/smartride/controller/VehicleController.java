package com.smartride.controller;

import com.smartride.model.User;
import com.smartride.model.Vehicle;
import com.smartride.repository.UserRepository;
import com.smartride.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> addVehicle(@RequestBody Vehicle vehicle) {
        Map<String, String> response = new HashMap<>();
        try {
            if (vehicle.getDriver() == null || vehicle.getDriver().getId() == null) {
                response.put("message", "Driver information is required");
                return ResponseEntity.badRequest().body(response);
            }

            User driver = userRepository.findById(vehicle.getDriver().getId()).orElse(null);
            if (driver == null) {
                response.put("message", "Driver not found");
                return ResponseEntity.badRequest().body(response);
            }

            vehicle.setDriver(driver);
            Vehicle savedVehicle = vehicleRepository.save(vehicle);
            return ResponseEntity.ok(savedVehicle);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("message", "Failed to add vehicle: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        List<Vehicle> vehicles = vehicleRepository.findByDriver(user);
        return ResponseEntity.ok(vehicles);
    }
}
