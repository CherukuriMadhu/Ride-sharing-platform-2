package com.smartride.service;

import com.smartride.model.Booking;
import com.smartride.model.Ride;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebsocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyNewBooking(Booking booking) {
        messagingTemplate.convertAndSend("/topic/driver/" + booking.getRide().getDriver().getId(),
                "New booking request from " + booking.getPassenger().getName());
    }

    public void notifyBookingApproval(Booking booking) {
        messagingTemplate.convertAndSend("/topic/passenger/" + booking.getPassenger().getId(),
                "Your booking for ride " + booking.getRide().getId() + " has been " + booking.getStatus());
    }

    public void notifyPaymentSuccess(Booking booking) {
        messagingTemplate.convertAndSend("/topic/ride/" + booking.getRide().getId(),
                "Payment successful for booking " + booking.getId());
    }

    public void notifySeatUpdate(Ride ride) {
        messagingTemplate.convertAndSend("/topic/rides",
                "Seats updated for ride " + ride.getId() + ". Available: " + ride.getAvailableSeats());
    }

    public void notifyNewReview(com.smartride.model.Review review) {
        messagingTemplate.convertAndSend("/topic/driver/" + review.getDriver().getId(),
                "New " + review.getRating() + "-star review from " + review.getPassenger().getName());
    }
}
