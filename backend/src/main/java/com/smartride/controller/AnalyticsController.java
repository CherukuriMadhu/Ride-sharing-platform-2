package com.smartride.controller;

import com.smartride.model.Booking;
import com.smartride.model.Ride;
import com.smartride.model.User;
import com.smartride.repository.BookingRepository;
import com.smartride.repository.RideRepository;
import com.smartride.repository.UserRepository;
import com.smartride.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private RideRepository rideRepository;

        @Autowired
        private BookingRepository bookingRepository;

        @Autowired
        private ReviewRepository reviewRepository;

        @GetMapping("/admin")
        public ResponseEntity<Map<String, Object>> getAdminAnalytics() {
                Map<String, Object> stats = new HashMap<>();

                List<User> allUsers = userRepository.findAll();
                long totalUsers = allUsers.size();
                long totalDrivers = allUsers.stream().filter(u -> u.getRole() == User.Role.DRIVER).count();
                long totalPassengers = allUsers.stream().filter(u -> u.getRole() == User.Role.PASSENGER).count();

                List<Booking> allBookings = bookingRepository.findAll();
                double totalRevenue = allBookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED
                                                || b.getStatus() == Booking.BookingStatus.PAID
                                                || b.getStatus() == Booking.BookingStatus.COMPLETED)
                                .mapToDouble(Booking::getTotalPrice)
                                .sum();

                long totalRides = rideRepository.count();
                long activeBookingsCount = allBookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.REQUESTED
                                                || b.getStatus() == Booking.BookingStatus.ACCEPTED
                                                || b.getStatus() == Booking.BookingStatus.PAID)
                                .count();
                long totalReviews = reviewRepository.count();

                stats.put("totalUsers", totalUsers);
                stats.put("totalDrivers", totalDrivers);
                stats.put("totalPassengers", totalPassengers);
                stats.put("totalRevenue", totalRevenue);
                stats.put("totalRides", totalRides);
                stats.put("totalBookings", activeBookingsCount);
                stats.put("totalReviews", totalReviews);

                // Monthly Registrations (Real DB data)
                Map<String, Long> monthlyMap = allUsers.stream()
                                .filter(u -> u.getCreatedAt() != null)
                                .collect(Collectors.groupingBy(
                                                u -> u.getCreatedAt() != null
                                                                ? u.getCreatedAt().getMonth().name().substring(0, 3)
                                                                : "Unknown",
                                                () -> new TreeMap<>(Comparator.comparingInt(this::monthToOrder)),
                                                Collectors.counting()));

                List<Object[]> registrations = monthlyMap.entrySet().stream()
                                .map(e -> new Object[] { e.getKey(), e.getValue() })
                                .collect(Collectors.toList());

                stats.put("monthlyRegistrations", registrations);

                return ResponseEntity.ok(stats);
        }

        private int monthToOrder(String month) {
                List<String> months = Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                "Oct",
                                "Nov", "Dec");
                return months.indexOf(month);
        }

        @GetMapping("/driver/{id}")
        public ResponseEntity<Map<String, Object>> getDriverAnalytics(@PathVariable Long id) {
                if (id == null)
                        return ResponseEntity.badRequest().build();
                Map<String, Object> stats = new HashMap<>();
                User driver = userRepository.findById(id).orElse(null);
                if (driver == null)
                        return ResponseEntity.notFound().build();

                List<Ride> driverRides = rideRepository.findByDriver(driver);
                long completedRides = driverRides.stream().filter(r -> r.getStatus() == Ride.RideStatus.COMPLETED)
                                .count();
                long pendingRides = driverRides.stream().filter(r -> r.getStatus() == Ride.RideStatus.PENDING).count();

                List<Booking> driverBookings = bookingRepository.findByRide_Driver(driver);
                long activeBookings = driverBookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count();

                double totalEarnings = driverBookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED
                                                || b.getStatus() == Booking.BookingStatus.PAID
                                                || b.getStatus() == Booking.BookingStatus.COMPLETED)
                                .mapToDouble(Booking::getTotalPrice)
                                .sum();

                stats.put("totalRidesPosted", driverRides.size());
                stats.put("completedRides", completedRides);
                stats.put("pendingRides", pendingRides);
                stats.put("activeBookings", activeBookings);
                stats.put("totalEarnings", totalEarnings);

                // Monthly Earnings from real bookings
                Map<String, Double> monthlyMap = driverBookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED
                                                || b.getStatus() == Booking.BookingStatus.PAID
                                                || b.getStatus() == Booking.BookingStatus.COMPLETED)
                                .filter(b -> b.getBookingTime() != null)
                                .collect(Collectors.groupingBy(
                                                b -> b.getBookingTime() != null
                                                                ? b.getBookingTime().getMonth().name().substring(0, 3)
                                                                : "Unknown",
                                                TreeMap::new,
                                                Collectors.summingDouble(Booking::getTotalPrice)));

                List<Object[]> earnings = monthlyMap.entrySet().stream()
                                .map(e -> new Object[] { e.getKey(), e.getValue() })
                                .collect(Collectors.toList());

                stats.put("monthlyEarnings", earnings);

                // Status breakdown for Pie Chart
                Map<String, Long> rideStatusCounts = driverRides.stream()
                                .collect(Collectors.groupingBy(r -> r.getStatus().name(), Collectors.counting()));
                stats.put("rideStatusCounts", rideStatusCounts);

                return ResponseEntity.ok(stats);
        }

        @GetMapping("/passenger/{id}")
        public ResponseEntity<Map<String, Object>> getPassengerAnalytics(@PathVariable Long id) {
                if (id == null)
                        return ResponseEntity.badRequest().build();
                Map<String, Object> stats = new HashMap<>();
                User passenger = userRepository.findById(id).orElse(null);
                if (passenger == null)
                        return ResponseEntity.notFound().build();

                List<Booking> bookings = bookingRepository.findByPassenger(passenger);

                double totalSpending = bookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED
                                                || b.getStatus() == Booking.BookingStatus.PAID
                                                || b.getStatus() == Booking.BookingStatus.COMPLETED)
                                .mapToDouble(Booking::getTotalPrice)
                                .sum();

                long activeBookings = bookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count();

                long upcomingBookings = bookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED
                                                && b.getRide().getDepartureTime()
                                                                .isAfter(java.time.LocalDateTime.now()))
                                .count();

                long cancelledBookings = bookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED).count();

                stats.put("totalSpending", totalSpending);
                stats.put("activeBookings", activeBookings);
                stats.put("upcomingBookings", upcomingBookings);
                stats.put("cancelledBookings", cancelledBookings);

                Map<String, Double> monthlySpendingMap = bookings.stream()
                                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED
                                                || b.getStatus() == Booking.BookingStatus.PAID
                                                || b.getStatus() == Booking.BookingStatus.COMPLETED)
                                .filter(b -> b.getBookingTime() != null)
                                .collect(Collectors.groupingBy(
                                                b -> b.getBookingTime() != null
                                                                ? b.getBookingTime().getMonth().name().substring(0, 3)
                                                                : "Unknown",
                                                TreeMap::new,
                                                Collectors.summingDouble(Booking::getTotalPrice)));

                List<Object[]> spending = monthlySpendingMap.entrySet().stream()
                                .map(e -> new Object[] { e.getKey(), e.getValue() })
                                .collect(Collectors.toList());
                stats.put("monthlySpending", spending);

                // Status breakdown for Pie Chart
                Map<String, Long> bookingStatusCounts = bookings.stream()
                                .collect(Collectors.groupingBy(b -> b.getStatus().name(), Collectors.counting()));
                stats.put("bookingStatusCounts", bookingStatusCounts);

                return ResponseEntity.ok(stats);
        }
}
