package com.smartride.service;

import com.smartride.model.Booking;
import com.smartride.model.Notification;
import com.smartride.model.Ride;
import com.smartride.model.User;
import com.smartride.repository.BookingRepository;
import com.smartride.repository.NotificationRepository;
import com.smartride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.smartride.controller.NotificationSSEController;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public void createNotification(Long userId, User.Role role, String title, String message, String type) {
        if (userId == null) return;
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setRole(role);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        
        // Push in real-time via SSE
        NotificationSSEController.sendNotification(userId, saved);
    }

    public List<Notification> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notificationId) {
        if (notificationId == null) return;
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        if (!unread.isEmpty()) {
            notificationRepository.saveAll(unread);
        }
    }

    public void deleteNotification(Long id) {
        if (id != null) {
            notificationRepository.deleteById(id);
        }
    }

    // Trigger methods
    public void notifyBookingRequested(Booking booking) {
        String title = "New Ride Request 📨";
        String msg = "You have a new ride request from " + booking.getPassenger().getName() + " for " + booking.getSeatsBooked() + " seats.";
        createNotification(booking.getRide().getDriver().getId(), User.Role.DRIVER, title, msg, "NEW_REQUEST");
    }

    public void notifyBookingAccepted(Booking booking) {
        String title = "Ride Request Accepted ✅";
        String msg = "Your booking request for ride to " + booking.getRide().getDestination().getAddress() + " has been accepted!";
        createNotification(booking.getPassenger().getId(), User.Role.PASSENGER, title, msg, "RIDE_ACCEPTED");
    }

    public void notifyBookingRejected(Booking booking) {
        String title = "Booking Declined ❌";
        String msg = "Your booking for ride to " + booking.getRide().getDestination().getAddress() + " was declined.";
        createNotification(booking.getPassenger().getId(), User.Role.PASSENGER, title, msg, "BOOKING_REJECTED");
    }

    public void notifyBookingConfirmed(Booking booking) {
        String title = "Booking Confirmed 📋";
        String msg = "Your booking for ride from " + booking.getRide().getSource().getAddress() + " is confirmed.";
        createNotification(booking.getPassenger().getId(), User.Role.PASSENGER, title, msg, "BOOKING_CONFIRMED");
        createNotification(booking.getRide().getDriver().getId(), User.Role.DRIVER, title, msg, "BOOKING_CONFIRMED");
    }

    public void notifyRideStarted(Long rideId) {
        List<Booking> bookings = bookingRepository.findByRideIdAndStatus(rideId, Booking.BookingStatus.CONFIRMED);
        for (Booking b : bookings) {
            createNotification(b.getPassenger().getId(), User.Role.PASSENGER, "Ride Started 🚗", "Your ride has started!", "RIDE_STARTED");
        }
    }

    public void notifyRideCompleted(Long rideId) {
        List<Booking> bookings = bookingRepository.findByRideIdAndStatus(rideId, Booking.BookingStatus.CONFIRMED);
        for (Booking b : bookings) {
            createNotification(b.getPassenger().getId(), User.Role.PASSENGER, "Ride Completed 🏁", "Your ride has been completed.", "RIDE_COMPLETED");
            createNotification(b.getRide().getDriver().getId(), User.Role.DRIVER, "Ride Completed 🏁", "Ride has been completed successfully.", "RIDE_COMPLETED");
        }
    }

    public void notifyPaymentSuccess(Booking booking) {
        createNotification(booking.getPassenger().getId(), User.Role.PASSENGER, "Payment Successful 💳", "Payment of ₹" + booking.getTotalPrice() + " was successful.", "PAYMENT_SUCCESS");
    }

    public void notifyPaymentReceived(Booking booking) {
        createNotification(booking.getRide().getDriver().getId(), User.Role.DRIVER, "Payment Received 💰", "You received ₹" + booking.getTotalPrice() + " for ride from " + booking.getPassenger().getName(), "PAYMENT_RECEIVED");
    }

    public void notifyPaymentCompleted(Booking booking) {
        notifyPaymentSuccess(booking);
        notifyPaymentReceived(booking);
    }

    public void notifyAdmins(String title, String message, String type) {
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .toList();
        for (User admin : admins) {
            createNotification(admin.getId(), User.Role.ADMIN, title, message, type);
        }
    }

    public void notifyNewRideToAdmin(Ride ride) {
        String msg = "New ride posted by driver " + ride.getDriver().getName() + " from " + 
                     ride.getSource().getAddress() + " to " + ride.getDestination().getAddress();
        notifyAdmins("New Ride Posted", msg, "NEW_RIDE");
    }

    public void notifyDriverApproved(User driver) {
        createNotification(driver.getId(), User.Role.DRIVER, "Account Approved 🎉", "Your driver account has been approved by the admin.", "ACCOUNT_APPROVED");
    }

    public void notifyNewDriverRegistration(User driver) {
        notifyAdmins("New Driver Registration 🪪", "Driver " + driver.getName() + " has registered and is pending approval.", "NEW_DRIVER");
    }
}
