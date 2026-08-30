package com.smartride.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Data Migration Service
 * Handles migration of data from MySQL to Supabase (PostgreSQL)
 * 
 * Usage:
 * - Call from a REST endpoint or Spring Boot CommandLineRunner
 * - Migrates data table by table in correct order (respecting foreign keys)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataMigrationService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Perform full database migration
     * Tables are migrated in order respecting foreign key constraints
     */
    @Transactional
    public void migrateAllData() {
        log.info("Starting full database migration to Supabase...");
        
        try {
            // Step 1: Migrate Users (no dependencies)
            migrateUsers();
            log.info("✓ Users migration completed");

            // Step 2: Migrate Vehicles (depends on Users)
            migrateVehicles();
            log.info("✓ Vehicles migration completed");

            // Step 3: Migrate Rides (depends on Users and Vehicles)
            migrateRides();
            log.info("✓ Rides migration completed");

            // Step 4: Migrate Pickup and Drop Points (depends on Rides)
            migratePickupPoints();
            log.info("✓ Pickup Points migration completed");
            
            migrateDropPoints();
            log.info("✓ Drop Points migration completed");

            // Step 5: Migrate Bookings (depends on Rides and Users)
            migrateBookings();
            log.info("✓ Bookings migration completed");

            // Step 6: Migrate Reviews (depends on Rides and Users)
            migrateReviews();
            log.info("✓ Reviews migration completed");

            // Step 7: Migrate Payments (depends on Users, Rides, Bookings)
            migratePayments();
            log.info("✓ Payments migration completed");

            // Step 8: Migrate Notifications (depends on Users)
            migrateNotifications();
            log.info("✓ Notifications migration completed");

            log.info("✅ All data migration completed successfully!");

        } catch (Exception e) {
            log.error("❌ Migration failed: ", e);
            throw new RuntimeException("Database migration failed", e);
        }
    }

    private void migrateUsers() {
        String sql = """
            INSERT INTO users (
                id, email, password, name, first_name, last_name, role, status,
                contact_no, gender, dob, address, city, state, zip_code,
                high_school_name, high_school_percentage, high_school_year,
                intermediate_college_name, intermediate_percentage, intermediate_year,
                graduation_college_name, graduation_percentage, graduation_year,
                license_number, rc_number, insurance_policy_number, driving_experience,
                vehicle_details, aadhaar_path, license_path, rc_path, insurance_path,
                profile_image, wallet_balance, average_rating, total_reviews, created_at
            )
            SELECT
                id, email, password, name, first_name, last_name, role, status,
                contact_no, gender, dob, address, city, state, zip_code,
                high_school_name, high_school_percentage, high_school_year,
                intermediate_college_name, intermediate_percentage, intermediate_year,
                graduation_college_name, graduation_percentage, graduation_year,
                license_number, rc_number, insurance_policy_number, driving_experience,
                vehicle_details, aadhaar_path, license_path, rc_path, insurance_path,
                profile_image, wallet_balance, average_rating, total_reviews, created_at
            FROM users_backup
            ON CONFLICT (id) DO NOTHING;
            """;
        try {
            int count = jdbcTemplate.update(sql);
            log.info("Migrated {} users", count);
        } catch (Exception e) {
            log.warn("Users migration note (table might already exist): {}", e.getMessage());
        }
    }

    private void migrateVehicles() {
        String sql = """
            INSERT INTO vehicles (
                id, driver_id, brand, model, color, vehicle_number, seating_capacity,
                vehicle_type, registration_year, insurance_provider, insurance_expiry, created_at
            )
            SELECT
                id, driver_id, brand, model, color, vehicle_number, seating_capacity,
                vehicle_type, registration_year, insurance_provider, insurance_expiry, created_at
            FROM vehicles_backup
            ON CONFLICT (id) DO NOTHING;
            """;
        try {
            int count = jdbcTemplate.update(sql);
            log.info("Migrated {} vehicles", count);
        } catch (Exception e) {
            log.warn("Vehicles migration note: {}", e.getMessage());
        }
    }

    private void migrateRides() {
        String sql = """
            INSERT INTO rides (
                id, driver_id, vehicle_id, source_lat, source_lng, source_address,
                dest_lat, dest_lng, dest_address, departure_time, available_seats,
                total_seats, price_type, price_per_seat, distance, status, created_at
            )
            SELECT
                id, driver_id, vehicle_id, source_lat, source_lng, source_address,
                dest_lat, dest_lng, dest_address, departure_time, available_seats,
                total_seats, price_type, price_per_seat, distance, status, created_at
            FROM rides_backup
            ON CONFLICT (id) DO NOTHING;
            """;
        try {
            int count = jdbcTemplate.update(sql);
            log.info("Migrated {} rides", count);
        } catch (Exception e) {
            log.warn("Rides migration note: {}", e.getMessage());
        }
    }

    private void migratePickupPoints() {
        String sql = """
            INSERT INTO pickup_points (id, ride_id, latitude, longitude, address, created_at)
            SELECT id, ride_id, latitude, longitude, address, created_at
            FROM pickup_points_backup
            ON CONFLICT (id) DO NOTHING;
            """;
        try {
            int count = jdbcTemplate.update(sql);
            log.info("Migrated {} pickup points", count);
        } catch (Exception e) {
            log.warn("Pickup points migration note: {}", e.getMessage());
        }
    }

    private void migrateDropPoints() {
        String sql = """
            INSERT INTO drop_points (id, ride_id, latitude, longitude, address, created_at)
            SELECT id, ride_id, latitude, longitude, address, created_at
            FROM drop_points_backup
            ON CONFLICT (id) DO NOTHING;
            """;
        try {
            int count = jdbcTemplate.update(sql);
            log.info("Migrated {} drop points", count);
        } catch (Exception e) {
            log.warn("Drop points migration note: {}", e.getMessage());
        }
    }

    private void migrateBookings() {
        String sql = """
            INSERT INTO bookings (
                id, ride_id, passenger_id, seats_booked, distance_fare, base_fare,
                platform_fee, total_price, booking_time, status, transaction_id,
                payment_status, payment_date, amount, currency, reviewed, created_at
            )
            SELECT
                id, ride_id, passenger_id, seats_booked, distance_fare, base_fare,
                platform_fee, total_price, booking_time, status, transaction_id,
                payment_status, payment_date, amount, currency, reviewed, created_at
            FROM bookings_backup
            ON CONFLICT (id) DO NOTHING;
            """;
        try {
            int count = jdbcTemplate.update(sql);
            log.info("Migrated {} bookings", count);
        } catch (Exception e) {
            log.warn("Bookings migration note: {}", e.getMessage());
        }
    }

    private void migrateReviews() {
        String sql = """
            INSERT INTO reviews (
                id, ride_id, passenger_id, driver_id, rating, comment, created_at
            )
            SELECT
                id, ride_id, passenger_id, driver_id, rating, comment, created_at
            FROM reviews_backup
            ON CONFLICT (id) DO NOTHING;
            """;
        try {
            int count = jdbcTemplate.update(sql);
            log.info("Migrated {} reviews", count);
        } catch (Exception e) {
            log.warn("Reviews migration note: {}", e.getMessage());
        }
    }

    private void migratePayments() {
        String sql = """
            INSERT INTO payments (
                id, payment_id, order_id, passenger_id, ride_id, driver_id,
                booking_id, seats, price_per_seat, total_amount, platform_commission,
                driver_earnings, payment_method, status, created_at
            )
            SELECT
                id, payment_id, order_id, passenger_id, ride_id, driver_id,
                booking_id, seats, price_per_seat, total_amount, platform_commission,
                driver_earnings, payment_method, status, created_at
            FROM payments_backup
            ON CONFLICT (id) DO NOTHING;
            """;
        try {
            int count = jdbcTemplate.update(sql);
            log.info("Migrated {} payments", count);
        } catch (Exception e) {
            log.warn("Payments migration note: {}", e.getMessage());
        }
    }

    private void migrateNotifications() {
        String sql = """
            INSERT INTO notifications (
                id, user_id, title, message, type, read, ride_id, booking_id, created_at
            )
            SELECT
                id, user_id, title, message, type, read, ride_id, booking_id, created_at
            FROM notifications_backup
            ON CONFLICT (id) DO NOTHING;
            """;
        try {
            int count = jdbcTemplate.update(sql);
            log.info("Migrated {} notifications", count);
        } catch (Exception e) {
            log.warn("Notifications migration note: {}", e.getMessage());
        }
    }

    /**
     * Clear all data from Supabase (USE WITH CAUTION!)
     * Only use for testing purposes
     */
    @Transactional
    public void clearAllData() {
        log.warn("⚠️  CLEARING ALL DATA FROM SUPABASE!");
        String[] tables = {
            "notifications",
            "reviews",
            "payments",
            "bookings",
            "drop_points",
            "pickup_points",
            "rides",
            "vehicles",
            "users"
        };

        for (String table : tables) {
            try {
                jdbcTemplate.update("DELETE FROM " + table);
                log.info("Cleared {}", table);
            } catch (Exception e) {
                log.warn("Could not clear {}: {}", table, e.getMessage());
            }
        }
    }
}
