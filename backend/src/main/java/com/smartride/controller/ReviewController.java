package com.smartride.controller;

import com.smartride.model.Booking;
import com.smartride.model.Review;
import com.smartride.model.User;
import com.smartride.repository.BookingRepository;
import com.smartride.repository.ReviewRepository;
import com.smartride.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final com.smartride.service.WebsocketService websocketService;

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> payload) {
        System.out.println("Received review submission request: " + payload);

        try {
            if (!payload.containsKey("rideId") || !payload.containsKey("passengerId")
                    || !payload.containsKey("driverId")) {
                return ResponseEntity.badRequest().body("Passenger ID, Driver ID, and Ride ID are required");
            }

            Long rideId;
            Long passengerId;
            Long driverId;
            int rating = 0;
            String comment = (String) payload.get("comment");

            try {
                rideId = Long.valueOf(payload.get("rideId").toString());
                passengerId = Long.valueOf(payload.get("passengerId").toString());
                driverId = Long.valueOf(payload.get("driverId").toString());
                if (payload.containsKey("rating")) {
                    rating = Integer.parseInt(payload.get("rating").toString());
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Invalid ID format");
            }

            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body("Rating is required and must be between 1 and 5");
            }

            // 1. Only passengers can submit reviews
            User passenger = userRepository.findById(passengerId).orElse(null);
            if (passenger == null || !passenger.getRole().equals(User.Role.PASSENGER)) {
                System.out.println("Validation failed: Not a passenger");
                return ResponseEntity.badRequest().body("Only passengers can provide reviews");
            }

            // 2. Passenger must have completed the ride (Check booking status)
            List<Booking> bookings = bookingRepository.findByRideIdAndPassengerId(rideId, passengerId);
            if (bookings.isEmpty()) {
                System.out.println("Validation failed: No booking found");
                return ResponseEntity.badRequest().body("No booking found for this ride and passenger");
            }

            Booking validBooking = null;
            for (Booking b : bookings) {
                boolean isCompleted = b.getStatus() == Booking.BookingStatus.COMPLETED;
                boolean isFinishedPaid = (b.getStatus() == Booking.BookingStatus.PAID
                        || b.getStatus() == Booking.BookingStatus.CONFIRMED) &&
                        b.getRide().getDepartureTime().isBefore(java.time.LocalDateTime.now());
                if (isCompleted || isFinishedPaid) {
                    validBooking = b;
                    break;
                }
            }

            if (validBooking == null) {
                System.out.println("Validation failed: Ride not completed or finished.");
                return ResponseEntity.badRequest().body("You can only review after the ride is COMPLETED or finished");
            }

            // 3. Passenger can review a ride only once
            if (reviewRepository.existsByRideIdAndPassengerId(rideId, passengerId)) {
                System.out.println("Validation failed: Already reviewed");
                return ResponseEntity.badRequest().body("You have already reviewed this ride");
            }

            // 4. Drivers cannot rate passengers (implied by API design)
            User driver = userRepository.findById(driverId).orElse(null);
            if (driver == null || !driver.getRole().equals(User.Role.DRIVER)) {
                System.out.println("Validation failed: Driver not found");
                return ResponseEntity.badRequest().body("Driver not found");
            }

            Review review = new Review();
            review.setRideId(rideId);
            review.setPassenger(passenger);
            review.setDriver(driver);
            review.setReviewerId(passengerId);
            review.setReviewedUserId(driverId);
            review.setRating(rating);
            review.setComment(comment);

            Review savedReview = reviewRepository.save(review);
            System.out.println("Review saved successfully with ID: " + savedReview.getId());

            // 5. Mark booking as reviewed
            validBooking.setReviewed(true);
            bookingRepository.save(validBooking);
            System.out.println("Booking updated as reviewed");

            // 6. Notify the driver
            try {
                websocketService.notifyNewReview(savedReview);

                // 7. Update driver's cached ratings
                Double avgRating = reviewRepository.getAverageRatingForDriver(driver.getId());
                Long count = reviewRepository.countByDriverId(driver.getId());
                driver.setAverageRating(avgRating != null ? avgRating : 0.0);
                driver.setTotalReviews(count != null ? count.intValue() : 0);
                userRepository.save(driver);
            } catch (Exception e) {
                // Log error but don't fail the review submission
                System.err.println("Failed to send review notification: " + e.getMessage());
            }

            return ResponseEntity.ok(savedReview);
        } catch (Exception ex) {
            ex.printStackTrace();
            System.err.println("Exception in ReviewController: " + ex.getMessage());
            return ResponseEntity.internalServerError().body("Failed to submit review: " + ex.getMessage());
        }
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Review>> getDriverReviews(@PathVariable Long driverId) {
        return ResponseEntity.ok(reviewRepository.findByReviewedUserIdOrderByCreatedAtDesc(driverId));
    }

    @GetMapping("/driver/{driverId}/average")
    public ResponseEntity<?> getAverageRating(@PathVariable Long driverId) {
        Double avgRating = reviewRepository.getAverageRatingForDriver(driverId);
        Long count = reviewRepository.countByDriverId(driverId);
        return ResponseEntity.ok(Map.of(
                "averageRating", avgRating != null ? avgRating : 0.0,
                "totalReviews", count != null ? count : 0));
    }
}
