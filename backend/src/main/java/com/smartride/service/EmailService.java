package com.smartride.service;

import com.smartride.model.Booking;
import com.smartride.model.Ride;
import com.smartride.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendBookingApprovalEmail(Booking booking) {
        String passengerEmail = booking.getPassenger().getEmail();
        String source = booking.getRide().getSource().getAddress();
        String destination = booking.getRide().getDestination().getAddress();

        String subject = "Ride Booking Approved";
        String body = String.format(
                "Hello %s,\n\n" +
                        "Your ride from %s to %s has been approved by the driver.\n" +
                        "Please complete the payment to confirm your booking.\n\n" +
                        "View Ride & Pay: http://localhost:5173/dashboard\n\n" +
                        "Thank you for riding with SmartRide!",
                booking.getPassenger().getFirstName(), source, destination);

        logger.info("Sending approval email to: {}", passengerEmail);
        sendEmail(passengerEmail, subject, body);
    }

    public void sendRideConfirmation(Booking booking) {
        User passenger = booking.getPassenger();
        Ride ride = booking.getRide();

        String subject = "Ride Booking Confirmed";
        String body = String.format(
                "Hello %s,\n\nYour ride has been successfully booked.\n\n" +
                        "Route: %s → %s\n" +
                        "Date: %s\n" +
                        "Driver: %s\n" +
                        "Vehicle: %s\n\n" +
                        "Thank you for using our Ride Sharing Platform.",
                passenger.getName(),
                ride.getSource().getAddress(),
                ride.getDestination().getAddress(),
                ride.getDepartureTime().toLocalDate(),
                ride.getDriver().getName(),
                ride.getVehicle() != null ? ride.getVehicle().getVehicleModel() : "N/A");
        sendEmail(passenger.getEmail(), subject, body);
    }

    public void sendDriverNotification(Booking booking) {
        User driver = booking.getRide().getDriver();
        User passenger = booking.getPassenger();
        Ride ride = booking.getRide();

        String subject = "New Passenger Joined Your Ride";
        String body = String.format(
                "Hello %s,\n\nA passenger has booked your ride.\n\n" +
                        "Passenger: %s\n" +
                        "Seats Booked: %d\n" +
                        "Route: %s → %s\n\n" +
                        "Check your dashboard for more details.",
                driver.getName(),
                passenger.getName(),
                booking.getSeatsBooked(),
                ride.getSource().getAddress(),
                ride.getDestination().getAddress());
        sendEmail(driver.getEmail(), subject, body);
    }

    public void sendRideReminder(User user, Ride ride) {
        String subject = "Ride Reminder";
        String body = String.format(
                "Hello %s,\n\nThis is a reminder that your ride will start in 1 hour.\n\n" +
                        "Route: %s → %s\n" +
                        "Time: %s\n\n" +
                        "Please be ready at the pickup location.",
                user.getName(),
                ride.getSource().getAddress(),
                ride.getDestination().getAddress(),
                ride.getDepartureTime().toLocalTime());
        sendEmail(user.getEmail(), subject, body);
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Email not sent to {}, but logging content:\n{}", to, body);
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom("SmartRide <your-email@gmail.com>");
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);
            mailSender.send(mailMessage);
            logger.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
