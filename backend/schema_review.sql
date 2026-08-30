-- SQL Migration Script for Review System
-- Execute these in your MySQL terminal (e.g. Workbench or CLI)

USE smartride;

-- 1. Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ride_id BIGINT NOT NULL,
    passenger_id BIGINT NOT NULL,
    driver_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_passenger FOREIGN KEY (passenger_id) REFERENCES users(id),
    CONSTRAINT fk_review_driver FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- 2. Ensure reviewed column exists in bookings table
-- Use this if Hibernate didn't automatically add it
-- ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE;

-- 3. Verify driver aggregation columns in users table
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating DOUBLE DEFAULT 0.0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;
