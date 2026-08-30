package com.smartride.config;

import com.smartride.model.*;
import com.smartride.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            // 1. ADMIN USER
            User admin = userRepository.findByEmail("admin@smartride.com").orElse(new User());
            admin.setEmail("admin@smartride.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Admin");
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setRole(User.Role.ADMIN);
            admin.setStatus(User.AccountStatus.ACTIVE);
            admin.setGender("Other");
            admin.setContactNo("0000000000");
            if (admin.getDob() == null)
                admin.setDob(java.time.LocalDate.now().minusYears(30));
            userRepository.save(admin);

            // 2. DUMMY DRIVER
            if (!userRepository.existsByEmail("driver@test.com")) {
                User driver = new User();
                driver.setEmail("driver@test.com");
                driver.setPassword(passwordEncoder.encode("123456"));
                driver.setName("Test Driver");
                driver.setFirstName("Test");
                driver.setLastName("Driver");
                driver.setRole(User.Role.DRIVER);
                driver.setStatus(User.AccountStatus.ACTIVE);
                driver.setContactNo("9876543210");
                driver.setGender("Male");
                driver.setDob(java.time.LocalDate.now().minusYears(25));
                userRepository.save(driver);

                // Add a sample ride
                Ride ride = new Ride();
                ride.setSource(new Location(17.2403, 78.4294, "Airport"));
                ride.setDestination(new Location(17.3850, 78.4867, "City Center"));
                ride.setDepartureTime(LocalDateTime.now().plusHours(2));
                ride.setAvailableSeats(4);
                ride.setTotalSeats(4);
                ride.setPricePerSeat(500.0);
                ride.setStatus(Ride.RideStatus.APPROVED);
                ride.setDriver(driver);
                rideRepository.save(ride);
            }

            // 3. DUMMY PASSENGER
            if (!userRepository.existsByEmail("passenger@test.com")) {
                User passenger = new User();
                passenger.setEmail("passenger@test.com");
                passenger.setPassword(passwordEncoder.encode("123456"));
                passenger.setName("Test Passenger");
                passenger.setFirstName("Test");
                passenger.setLastName("Passenger");
                passenger.setRole(User.Role.PASSENGER);
                passenger.setStatus(User.AccountStatus.ACTIVE);
                passenger.setContactNo("9876543211");
                passenger.setGender("Female");
                passenger.setDob(java.time.LocalDate.now().minusYears(22));
                userRepository.save(passenger);
            }

            System.out.println("SYSTEM SEEDED SUCCESSFULLY");
            System.out.println("ADMIN: admin@smartride.com / admin123");

        } catch (Exception e) {
            System.err.println("ERROR SEEDING DATA: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
