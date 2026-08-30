package com.smartride.service;

import com.smartride.model.Booking;
import com.smartride.model.Ride;
import com.smartride.repository.BookingRepository;
import com.smartride.repository.RideRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideReminderService {
    private static final Logger logger = LoggerFactory.getLogger(RideReminderService.class);

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmailService emailService;

    // Runs every 10 minutes
    @Scheduled(fixedRate = 600000)
    public void sendRideReminders() {
        logger.info("Checking for upcoming rides to send reminders...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourLater = now.plusMinutes(60);
        LocalDateTime fiftyMinutesLater = now.plusMinutes(45); // Slightly wider window to avoid missing

        // Find rides starting in approximately 1 hour that are active (APPROVED or
        // ACCEPTED)
        List<Ride> upcomingRides = rideRepository.findByDepartureTimeBetweenAndStatus(
                fiftyMinutesLater, oneHourLater, Ride.RideStatus.APPROVED);

        List<Ride> acceptedUpcomingRides = rideRepository.findByDepartureTimeBetweenAndStatus(
                fiftyMinutesLater, oneHourLater, Ride.RideStatus.ACCEPTED);

        upcomingRides.addAll(acceptedUpcomingRides);

        for (Ride ride : upcomingRides) {
            logger.info("Sending reminders for Ride ID: {}", ride.getId());

            // 1. Remind Driver
            emailService.sendRideReminder(ride.getDriver(), ride);

            // 2. Remind Confirmed/Paid Passengers
            List<Booking> bookings = bookingRepository.findByRide(ride);
            for (Booking booking : bookings) {
                if (booking.getStatus() == Booking.BookingStatus.CONFIRMED ||
                        booking.getStatus() == Booking.BookingStatus.PAID) {
                    emailService.sendRideReminder(booking.getPassenger(), ride);
                }
            }
        }
    }
}
