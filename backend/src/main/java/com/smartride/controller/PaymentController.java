package com.smartride.controller;

import com.smartride.model.Booking;
import com.smartride.repository.BookingRepository;
import com.smartride.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.net.ApiResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private com.smartride.service.PaymentService paymentService;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> data) {
        Stripe.apiKey = stripeSecretKey;
        try {
            Long bookingId = Long.parseLong(data.get("bookingId").toString());
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            String baseUrl = "http://localhost:5173";

            long unitAmount = (long) (booking.getTotalPrice() * 100);
            if (unitAmount < 5000)
                unitAmount = 5000; // Enforce ₹50 minimum (5000 paise)

            SessionCreateParams params = SessionCreateParams.builder()
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(baseUrl + "/payment-success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(baseUrl + "/payment-cancel")
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("inr")
                                    .setUnitAmount(unitAmount)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Ride Booking #" + booking.getId())
                                            .setDescription(booking.getRide().getSource().getAddress() + " to "
                                                    + booking.getRide().getDestination().getAddress())
                                            .build())
                                    .build())
                            .build())
                    .putMetadata("bookingId", bookingId.toString())
                    .build();

            Session session = Session.create(params);
            return ResponseEntity.ok(Map.of(
                    "sessionId", session.getId(),
                    "url", session.getUrl()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/confirm-payment/{sessionId}")
    @Transactional
    public ResponseEntity<?> confirmPayment(@PathVariable String sessionId) {
        return verifyPayment(sessionId);
    }

    @GetMapping("/verify")
    @Transactional
    public ResponseEntity<?> verifyPayment(@RequestParam String sessionId) {
        Stripe.apiKey = stripeSecretKey;
        try {
            Session session = Session.retrieve(sessionId);
            if ("paid".equals(session.getPaymentStatus())) {
                String bookingIdStr = session.getMetadata().get("bookingId");
                if (bookingIdStr != null) {
                    Long bookingId = Long.parseLong(bookingIdStr);
                    Booking booking = bookingRepository.findByIdForUpdate(bookingId).orElseThrow();

                    if (booking.getStatus() != Booking.BookingStatus.PAID
                            && booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
                        
                        paymentService.processPaymentSuccess(booking, session.getPaymentIntent(), "STRIPE_CARD");

                        return ResponseEntity.ok(Map.of(
                                "status", "SUCCESS",
                                "message", "Payment verified and ride confirmed",
                                "booking", booking));
                    } else {
                        return ResponseEntity
                                .ok(Map.of("status", "SUCCESS", "message", "Already verified", "booking", booking));
                    }
                }
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "FAILED", "message", "Payment not completed on Stripe side"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<?> handleStripeWebhook(@RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        Stripe.apiKey = stripeSecretKey;
        // In real production, you'd verify the signature here with an endpoint secret
        // For development/test, we'll parse the event
        try {
            Event event = ApiResource.GSON.fromJson(payload, Event.class);
            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().get();
                String bookingIdStr = session.getMetadata().get("bookingId");
                if (bookingIdStr != null) {
                    Long bookingId = Long.parseLong(bookingIdStr);
                    Booking booking = bookingRepository.findByIdForUpdate(bookingId).orElseThrow();

                    if (booking.getStatus() != Booking.BookingStatus.PAID) {
                        paymentService.processPaymentSuccess(booking, session.getPaymentIntent(), "STRIPE_CARD");
                    }
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/passenger/{passengerId}")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getPassengerPayments(@PathVariable Long passengerId) {
        return ResponseEntity.ok(paymentRepository.findByPassengerId(passengerId));
    }

    @GetMapping("/driver/{driverId}")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getDriverPayments(@PathVariable Long driverId) {
        return ResponseEntity.ok(paymentRepository.findByDriverId(driverId));
    }
}
