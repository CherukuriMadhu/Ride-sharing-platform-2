-- Update rides table to include total_seats
ALTER TABLE rides ADD COLUMN total_seats INT NOT NULL DEFAULT 0;
ALTER TABLE rides DROP COLUMN price_per_km;
UPDATE rides SET total_seats = available_seats WHERE total_seats = 0;

-- Update bookings table for Stripe integration
-- Standardizing ALTER commands (MySQL versions < 8.0.19 don't support IF NOT EXISTS in ALTER)
-- Errors about duplicate columns can be ignored if they already exist
ALTER TABLE bookings ADD COLUMN transaction_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE bookings ADD COLUMN payment_date DATETIME;
ALTER TABLE bookings ADD COLUMN amount DOUBLE DEFAULT 0.0;
ALTER TABLE bookings ADD COLUMN currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE bookings ADD COLUMN base_fare DOUBLE DEFAULT 0.0;
ALTER TABLE bookings ADD COLUMN distance_fare DOUBLE DEFAULT 0.0;
ALTER TABLE bookings ADD COLUMN platform_fee DOUBLE DEFAULT 0.0;

-- Create payments table if not exists
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(255),
    order_id VARCHAR(255),
    passenger_id BIGINT,
    ride_id BIGINT,
    driver_id BIGINT,
    booking_id BIGINT,
    seats INT,
    price_per_seat DOUBLE,
    total_amount DOUBLE,
    platform_commission DOUBLE,
    driver_earnings DOUBLE,
    payment_method VARCHAR(255),
    status VARCHAR(50),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ensure status column in bookings can handle 'PAID'
-- (Assuming it's a VARCHAR or ENUM that needs updating)
-- If it's an enum, we might need a more complex alter, but usually VARCHAR is safe.

-- Add index for transaction_id for faster lookups during webhooks
CREATE INDEX IF NOT EXISTS idx_transaction_id ON bookings(transaction_id);
