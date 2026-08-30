package com.smartride.controller;

import com.smartride.model.Booking;
import com.smartride.model.User;
import com.smartride.repository.BookingRepository;
import com.smartride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*") // Allow frontend to call
public class BookingController {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.smartride.service.BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> bookRide(@RequestBody Booking booking) {
        try {
            if (booking.getRide() == null || booking.getRide().getId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Ride information is required"));
            }
            if (booking.getPassenger() == null || booking.getPassenger().getId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Passenger information is required"));
            }

            Booking savedBooking = bookingService.createBooking(booking);
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            logger.error("Unexpected error during booking", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Booking failed: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Long id) {
        if (id == null) return ResponseEntity.badRequest().body("Booking ID is required");
        try {
            bookingService.acceptBooking(id);
            return ResponseEntity.ok("Booking accepted and ready for payment");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id) {
        if (id == null) return ResponseEntity.badRequest().body("Booking ID is required");
        try {
            bookingService.rejectBooking(id);
            return ResponseEntity.ok("Booking rejected");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/passenger/{passengerId}")
    public List<Booking> getBookingsByPassenger(@PathVariable Long passengerId) {
        if (passengerId == null)
            return List.of();
        User passenger = userRepository.findById(passengerId).orElse(null);
        if (passenger == null)
            return List.of();
        return bookingRepository.findByPassenger(passenger);
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getBookingsForDriver(@PathVariable Long driverId) {
        if (driverId == null)
            return ResponseEntity.badRequest().body("Driver ID is required");
        User driver = userRepository.findById(driverId).orElse(null);
        if (driver == null)
            return ResponseEntity.badRequest().body("Driver not found");
        return ResponseEntity.ok(bookingRepository.findByRide_Driver_Id(driverId));
    }
}
