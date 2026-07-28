-- ============================================================
-- HomeEase Booking Service Database Schema
-- ============================================================
--
-- Project       : HomeEase
-- Service       : Booking Service
-- Backend       : Node.js + Express.js
-- Database      : MySQL
-- Version       : 1.0
--
-- NOTE:
-- customer_id and provider_id belong to the
-- Authentication Service (homeease_auth).
-- They are stored as BIGINT values only.
-- No foreign key is created because users
-- are managed by another microservice.
--
-- ============================================================

DROP DATABASE IF EXISTS homeease_booking;

CREATE DATABASE homeease_booking;

USE homeease_booking;

-- ============================================================
-- TABLE : service_categories
-- ============================================================

CREATE TABLE service_categories (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    price DECIMAL(8,2) NOT NULL
        CHECK (price >= 0),

    image_url VARCHAR(500),

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    is_active TINYINT(1) DEFAULT 1

);

-- ============================================================
-- TABLE : bookings
-- ============================================================

CREATE TABLE bookings (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    provider_id BIGINT DEFAULT NULL,

    service_id BIGINT NOT NULL,

    booking_date DATETIME NOT NULL,

    status ENUM(
        'PENDING',
        'ACCEPTED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',

    address TEXT NOT NULL,

    total_price DECIMAL(8,2) NOT NULL
        CHECK (total_price >= 0),

    accepted_at TIMESTAMP NULL,

    completed_at TIMESTAMP NULL,

    cancelled_at TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_service
        FOREIGN KEY (service_id)
        REFERENCES service_categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

);

-- ============================================================
-- TABLE : reviews
-- ============================================================

CREATE TABLE reviews (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    booking_id BIGINT NOT NULL UNIQUE,

    customer_id BIGINT NOT NULL,

    provider_id BIGINT NOT NULL,

    rating INT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE

);

-- ============================================================
-- TABLE : notifications
-- ============================================================

CREATE TABLE notifications (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    type ENUM(
        'BOOKING_CREATED',
        'BOOKING_ACCEPTED',
        'BOOKING_IN_PROGRESS',
        'BOOKING_COMPLETED',
        'BOOKING_CANCELLED',
        'REVIEW_RECEIVED'
    ) NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT,

    booking_id BIGINT DEFAULT NULL,

    is_read TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE SET NULL

);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_booking_customer
ON bookings(customer_id);

CREATE INDEX idx_booking_provider
ON bookings(provider_id);

CREATE INDEX idx_booking_service
ON bookings(service_id);

CREATE INDEX idx_booking_status
ON bookings(status);

CREATE INDEX idx_booking_date
ON bookings(booking_date);

CREATE INDEX idx_review_customer
ON reviews(customer_id);

CREATE INDEX idx_review_provider
ON reviews(provider_id);

CREATE INDEX idx_notification_user
ON notifications(user_id);

CREATE INDEX idx_notification_booking
ON notifications(booking_id);

CREATE INDEX idx_notification_read
ON notifications(is_read);

-- ============================================================
-- SAMPLE SERVICE CATEGORIES
-- ============================================================

INSERT INTO service_categories
(category_name, description, price, image_url)
VALUES

('Cleaning',
'Complete Home Cleaning',
500.00,
NULL),

('Plumbing',
'Pipe Leakage & Plumbing Repair',
700.00,
NULL),

('Electrician',
'Electrical Repair Service',
650.00,
NULL),

('Painting',
'Home Painting Service',
1200.00,
NULL),

('AC Repair',
'Air Conditioner Repair',
900.00,
NULL),

('Pest Control',
'Complete Pest Control',
850.00,
NULL),

('Carpenter',
'Furniture & Wood Repair',
750.00,
NULL),

('Home Shifting',
'Packing and Moving Service',
2500.00,
NULL);

-- ============================================================
-- VERIFICATION
-- ============================================================

SHOW TABLES;

DESCRIBE service_categories;

DESCRIBE bookings;

DESCRIBE reviews;

DESCRIBE notifications;

SELECT COUNT(*) AS total_services
FROM service_categories;

SELECT COUNT(*) AS total_bookings
FROM bookings;

SELECT COUNT(*) AS total_reviews
FROM reviews;

SELECT COUNT(*) AS total_notifications
FROM notifications;

SELECT *
FROM service_categories;