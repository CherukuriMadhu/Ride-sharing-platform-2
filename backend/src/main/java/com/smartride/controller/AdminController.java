package com.smartride.controller;

import com.smartride.model.User;
import com.smartride.model.Ride;
import com.smartride.model.Payment;
import com.smartride.model.Review;
import com.smartride.repository.UserRepository;
import com.smartride.repository.RideRepository;
import com.smartride.repository.PaymentRepository;
import com.smartride.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private com.smartride.service.NotificationService notificationService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/rides")
    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    @GetMapping("/payments")
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @GetMapping("/reviews")
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().body("User ID is required");
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();

        user.setStatus(User.AccountStatus.ACTIVE);
        userRepository.save(user);
        
        if (user.getRole() == User.Role.DRIVER) {
            try {
                notificationService.notifyDriverApproved(user);
            } catch (Exception e) {}
        }
        
        return ResponseEntity.ok("User approved");
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();

        if (user.getStatus() == User.AccountStatus.ACTIVE) {
            user.setStatus(User.AccountStatus.BANNED);
        } else {
            user.setStatus(User.AccountStatus.ACTIVE);
        }

        userRepository.save(user);
        return ResponseEntity.ok("Status updated");
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }

        Long driverId = review.getDriver().getId();
        reviewRepository.deleteById(id);

        // Refresh driver's cached ratings
        User driver = userRepository.findById(driverId).orElse(null);
        if (driver != null) {
            Double avgRating = reviewRepository.getAverageRatingForDriver(driverId);
            Long count = reviewRepository.countByDriverId(driverId);
            driver.setAverageRating(avgRating != null ? avgRating : 0.0);
            driver.setTotalReviews(count != null ? count.intValue() : 0);
            userRepository.save(driver);
        }

        return ResponseEntity.ok("Review deleted");
    }
}
