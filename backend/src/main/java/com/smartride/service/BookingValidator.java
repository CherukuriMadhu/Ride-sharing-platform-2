package com.smartride.service;

import com.smartride.model.Booking.BookingStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class BookingValidator {

    private static final Map<BookingStatus, List<BookingStatus>> ALLOWED_TRANSITIONS = Map.of(
            BookingStatus.REQUESTED, List.of(BookingStatus.ACCEPTED, BookingStatus.REJECTED, BookingStatus.CANCELLED),
            BookingStatus.ACCEPTED, List.of(BookingStatus.CONFIRMED, BookingStatus.CANCELLED),
            BookingStatus.CONFIRMED, List.of(BookingStatus.COMPLETED, BookingStatus.CANCELLED));

    public void validateTransition(BookingStatus current, BookingStatus target) {
        if (!ALLOWED_TRANSITIONS.getOrDefault(current, List.of()).contains(target)) {
            throw new IllegalStateException("Invalid state transition from " + current + " to " + target);
        }
    }
}
