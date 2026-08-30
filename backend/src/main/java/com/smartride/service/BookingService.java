package com.smartride.service;

import com.smartride.model.Booking;
import com.smartride.model.Ride;
import com.smartride.model.User;
import com.smartride.repository.BookingRepository;
import com.smartride.repository.RideRepository;
import com.smartride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class BookingService {

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

    @Autowired
    private EmailService emailService;

    @Transactional
    public Booking createBooking(Booking booking) {
        if (booking.getRide() == null || booking.getRide().getId() == null) throw new IllegalArgumentException("Ride ID is required");
        if (booking.getPassenger() == null || booking.getPassenger().getId() == null) throw new IllegalArgumentException("Passenger ID is required");
        
        Ride ride = rideRepository.findById(booking.getRide().getId()).orElseThrow();
        User passenger = userRepository.findById(booking.getPassenger().getId()).orElseThrow();

        booking.setRide(ride);
        booking.setPassenger(passenger);
        booking.setBaseFare(ride.getPricePerSeat());
        booking.setTotalPrice(ride.getPricePerSeat() * booking.getSeatsBooked());
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.REQUESTED);

        Booking saved = bookingRepository.save(booking);
        
        notificationService.notifyBookingRequested(saved);
        websocketService.notifyNewBooking(saved);
        
        return saved;
    }

    @Transactional
    public void acceptBooking(Long id) {
        if (id == null) return;
        Booking booking = bookingRepository.findById(id).orElseThrow();
        booking.setStatus(Booking.BookingStatus.ACCEPTED);
        bookingRepository.save(booking);

        notificationService.notifyBookingAccepted(booking);
        websocketService.notifyBookingApproval(booking);
        emailService.sendBookingApprovalEmail(booking);
    }

    @Transactional
    public void rejectBooking(Long id) {
        if (id == null) return;
        Booking booking = bookingRepository.findById(id).orElseThrow();
        booking.setStatus(Booking.BookingStatus.REJECTED);
        bookingRepository.save(booking);

        notificationService.notifyBookingRejected(booking);
    }
}
