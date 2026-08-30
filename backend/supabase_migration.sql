-- ====================================
-- SUPABASE MIGRATION SCRIPT
-- Smart Ride Sharing Platform
-- ====================================

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('ADMIN', 'PASSENGER', 'DRIVER');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'PENDING');
CREATE TYPE ride_status AS ENUM ('PENDING', 'APPROVED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE booking_status AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED');

-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role user_role NOT NULL,
    status account_status DEFAULT 'ACTIVE',
    contact_no VARCHAR(20),
    gender VARCHAR(10),
    dob DATE,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(10),
    
    -- Education Details
    high_school_name VARCHAR(255),
    high_school_percentage VARCHAR(10),
    high_school_year VARCHAR(4),
    intermediate_college_name VARCHAR(255),
    intermediate_percentage VARCHAR(10),
    intermediate_year VARCHAR(4),
    graduation_college_name VARCHAR(255),
    graduation_percentage VARCHAR(10),
    graduation_year VARCHAR(4),
    
    -- Driver & Vehicle Details
    license_number VARCHAR(100),
    rc_number VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    driving_experience VARCHAR(100),
    vehicle_details VARCHAR(500),
    
    -- File paths (store relative paths, files in storage)
    aadhaar_path VARCHAR(255),
    license_path VARCHAR(255),
    rc_path VARCHAR(255),
    insurance_path VARCHAR(255),
    
    profile_image VARCHAR(255),
    wallet_balance DECIMAL(10, 2) DEFAULT 0.0,
    average_rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Vehicles Table
CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    seating_capacity INTEGER NOT NULL,
    vehicle_type VARCHAR(50),
    registration_year INTEGER,
    insurance_provider VARCHAR(100),
    insurance_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);

-- Rides Table
CREATE TABLE rides (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id BIGINT REFERENCES vehicles(id),
    
    -- Source Location
    source_lat DECIMAL(10, 8) NOT NULL,
    source_lng DECIMAL(11, 8) NOT NULL,
    source_address VARCHAR(500) NOT NULL,
    
    -- Destination Location
    dest_lat DECIMAL(10, 8) NOT NULL,
    dest_lng DECIMAL(11, 8) NOT NULL,
    dest_address VARCHAR(500) NOT NULL,
    
    departure_time TIMESTAMP NOT NULL,
    available_seats INTEGER NOT NULL,
    total_seats INTEGER NOT NULL,
    price_type VARCHAR(20) DEFAULT 'AUTO',
    price_per_seat DECIMAL(10, 2),
    distance DECIMAL(10, 2),
    status ride_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_departure_time ON rides(departure_time);

-- Pickup Points Table
CREATE TABLE pickup_points (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pickup_points_ride_id ON pickup_points(ride_id);

-- Drop Points Table
CREATE TABLE drop_points (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drop_points_ride_id ON drop_points(ride_id);

-- Bookings Table
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    passenger_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seats_booked INTEGER NOT NULL,
    distance_fare DECIMAL(10, 2),
    base_fare DECIMAL(10, 2),
    platform_fee DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status booking_status DEFAULT 'REQUESTED',
    
    -- Payment Details
    transaction_id VARCHAR(255),
    payment_status VARCHAR(50),
    payment_date TIMESTAMP,
    amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    reviewed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_ride_id ON bookings(ride_id);
CREATE INDEX idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_transaction_id ON bookings(transaction_id);

-- Reviews Table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    passenger_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    driver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_driver_id ON reviews(driver_id);
CREATE INDEX idx_reviews_passenger_id ON reviews(passenger_id);
CREATE INDEX idx_reviews_ride_id ON reviews(ride_id);

-- Payments Table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    payment_id VARCHAR(255),
    order_id VARCHAR(255),
    passenger_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ride_id BIGINT REFERENCES rides(id),
    driver_id BIGINT REFERENCES users(id),
    booking_id BIGINT REFERENCES bookings(id),
    seats INTEGER,
    price_per_seat DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    platform_commission DECIMAL(10, 2),
    driver_earnings DECIMAL(10, 2),
    payment_method VARCHAR(255),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_passenger_id ON payments(passenger_id);
CREATE INDEX idx_payments_driver_id ON payments(driver_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Notifications Table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    read BOOLEAN DEFAULT false,
    ride_id BIGINT,
    booking_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Enable Row Level Security (RLS) for Supabase Auth
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
