package com.smartride.service;

import com.smartride.model.Booking;
import com.smartride.model.Payment;
import com.smartride.model.Ride;
import com.smartride.model.User;
import com.smartride.repository.BookingRepository;
import com.smartride.repository.PaymentRepository;
import com.smartride.repository.RideRepository;
import com.smartride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private WebsocketService websocketService;

    @Transactional
    public void processPaymentSuccess(Booking booking, String transactionId, String paymentMethod) {
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setTransactionId(transactionId);
        booking.setPaymentStatus("SUCCESS");
        booking.setPaymentDate(LocalDateTime.now());
        bookingRepository.save(booking);

        Ride ride = rideRepository.findByIdForUpdate(booking.getRide().getId()).orElseThrow();
        ride.setAvailableSeats(Math.max(0, ride.getAvailableSeats() - booking.getSeatsBooked()));
        if (ride.getAvailableSeats() <= 0) {
            ride.setStatus(Ride.RideStatus.COMPLETED);
        }
        rideRepository.save(ride);

        User driver = ride.getDriver();
        driver.setWalletBalance((driver.getWalletBalance() != null ? driver.getWalletBalance() : 0.0) + booking.getTotalPrice());
        userRepository.save(driver);

        Payment payment = new Payment();
        payment.setPaymentId(transactionId);
        payment.setBookingId(booking.getId());
        payment.setPassengerId(booking.getPassenger().getId());
        payment.setDriverId(driver.getId());
        payment.setRideId(ride.getId());
        payment.setTotalAmount(booking.getTotalPrice());
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setTimestamp(LocalDateTime.now());
        paymentRepository.save(payment);

        websocketService.notifyPaymentSuccess(booking);
        notificationService.notifyBookingConfirmed(booking);
        notificationService.notifyPaymentSuccess(booking);
        notificationService.notifyPaymentReceived(booking);
    }
}
