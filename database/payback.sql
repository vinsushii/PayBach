-- Create Database
CREATE DATABASE IF NOT EXISTS paybach_db;
USE paybach_db;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    user_idnum VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_initial CHAR(1),
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    school VARCHAR(100),
    program VARCHAR(100),
    role ENUM('admin','student') NOT NULL DEFAULT 'student'  -- role column
);

CREATE TABLE user_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_idnum VARCHAR(20),
    course_code VARCHAR(20),
    FOREIGN KEY (user_idnum) REFERENCES users(user_idnum)
);

-- =========================
-- LISTINGS
-- =========================
CREATE TABLE listings (
    listing_id INT AUTO_INCREMENT PRIMARY KEY,
    user_idnum VARCHAR(20),
    quantity INT DEFAULT 1,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    exchange_method VARCHAR(50),
    payment_method VARCHAR(50),
    is_valid BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_idnum) REFERENCES users(user_idnum)
);

-- =========================
-- LISTING ITEMS
-- =========================
CREATE TABLE listing_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT,
    name VARCHAR(100),
    item_condition VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE CASCADE
);

-- =========================
-- LISTING CATEGORIES
-- =========================
CREATE TABLE listing_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT,
    category VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE CASCADE
);

-- =========================
-- LISTING IMAGES
-- =========================
CREATE TABLE listing_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT,
    image_path VARCHAR(255),
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE CASCADE
);

-- =========================
-- BIDS
-- =========================
CREATE TABLE bids (
    bid_id INT AUTO_INCREMENT PRIMARY KEY,
    user_idnum VARCHAR(20),
    transaction_id VARCHAR(50),
    autobuy_amount DECIMAL(10,2),
    start_bid DECIMAL(10,2),
    bid_increment DECIMAL(10,2),
    current_amount DECIMAL(10,2),
    bid_datetime DATETIME,          -- FIXED: renamed from current_date
    current_user_id VARCHAR(20),
    FOREIGN KEY (user_idnum) REFERENCES users(user_idnum)
);

-- =========================
-- BARTERS
-- =========================
CREATE TABLE barters (
    barter_id INT AUTO_INCREMENT PRIMARY KEY,
    user_idnum VARCHAR(20),
    requested_items TEXT,
    date_of_exchange DATETIME,
    FOREIGN KEY (user_idnum) REFERENCES users(user_idnum)
);

CREATE TABLE barter_offers (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,
    barter_id INT,
    name VARCHAR(100),
    item_condition VARCHAR(50),
    nagoffer VARCHAR(20),
    FOREIGN KEY (barter_id) REFERENCES barters(barter_id)
);

-- =========================
-- SAMPLE DATA
-- =========================
-- Student account
INSERT INTO users (user_idnum, first_name, middle_initial, last_name, password_hash, email, school, program, role)
VALUES ('2241389', 'Juan', 'A', 'Dela Cruz', 'hashed_password_here', 'delaCruz@slu.edu.ph', 'SAMCIS', 'BSCS', 'student');

-- Admin account
INSERT INTO users (user_idnum, first_name, middle_initial, last_name, password_hash, email, school, program, role)
VALUES ('999999', 'Admin', NULL, 'User', 'admin_hashed_password_here', 'admin@paybach.com', 'SAMCIS', 'BSCS', 'admin');

INSERT INTO user_courses (user_idnum, course_code) VALUES
('2241389', 'CS213'),
('2241389', 'CS211');

INSERT INTO listings (user_idnum, quantity, start_date, end_date, description, exchange_method, payment_method, is_valid)
VALUES ('2241389', 3, '2025-10-18 00:00:00', '2025-10-25 00:00:00', '3 sets of textbooks for exchange', 'In person', 'Gcash', TRUE);

INSERT INTO listing_items (listing_id, name, item_condition) VALUES
(1, 'Math Book', 'Good'),
(1, 'English Book', 'Fair'),
(1, 'History Book', 'Excellent');

INSERT INTO listing_categories (listing_id, category) VALUES
(1, 'Books'),
(1, 'SAMCIS'),
(1, 'Learning Material');

INSERT INTO bids (user_idnum, transaction_id, autobuy_amount, start_bid, bid_increment, current_amount, bid_datetime, current_user_id)
VALUES ('2241389', 't1000000', 5000, 1000, 100, 2500, '2025-10-18 10:30:00', '224123');

INSERT INTO barters (user_idnum, requested_items, date_of_exchange)
VALUES ('224123', 'Laptop', '2025-10-18 12:00:00');

INSERT INTO barter_offers (barter_id, name, item_condition, nagoffer) VALUES
(1, 'Tablet', 'Good', '2230136'),
(1, 'Monitor', 'Excellent', '2236875');
