-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 14, 2025 at 07:42 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `paybach_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `barters`
--

DROP TABLE IF EXISTS `barters`;
CREATE TABLE IF NOT EXISTS `barters` (
  `barter_id` int NOT NULL AUTO_INCREMENT,
  `user_idnum` varchar(20) DEFAULT NULL,
  `requested_items` text,
  `date_of_exchange` datetime DEFAULT NULL,
  PRIMARY KEY (`barter_id`),
  KEY `user_idnum` (`user_idnum`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `barters`
--

INSERT INTO `barters` (`barter_id`, `user_idnum`, `requested_items`, `date_of_exchange`) VALUES
(1, '224123', 'Laptop', '2025-10-18 12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `barter_offers`
--

DROP TABLE IF EXISTS `barter_offers`;
CREATE TABLE IF NOT EXISTS `barter_offers` (
  `offer_id` int NOT NULL AUTO_INCREMENT,
  `barter_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `item_condition` varchar(50) DEFAULT NULL,
  `nagoffer` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`offer_id`),
  KEY `barter_id` (`barter_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `barter_offers`
--

INSERT INTO `barter_offers` (`offer_id`, `barter_id`, `name`, `item_condition`, `nagoffer`) VALUES
(1, 1, 'Tablet', 'Good', '2230136'),
(2, 1, 'Monitor', 'Excellent', '2236875');

-- --------------------------------------------------------

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
CREATE TABLE IF NOT EXISTS `bids` (
  `bid_id` int NOT NULL AUTO_INCREMENT,
  `user_idnum` varchar(20) DEFAULT NULL,
  `autobuy_amount` decimal(10,2) DEFAULT NULL,
  `start_bid` decimal(10,2) DEFAULT NULL,
  `bid_increment` decimal(10,2) DEFAULT NULL,
  `current_amount` decimal(10,2) DEFAULT NULL,
  `bid_datetime` datetime DEFAULT NULL,
  `current_highest_bidder` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`bid_id`),
  KEY `user_idnum` (`user_idnum`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bids`
--

INSERT INTO `bids` (`bid_id`, `user_idnum`, `autobuy_amount`, `start_bid`, `bid_increment`, `current_amount`, `bid_datetime`, `current_highest_bidder`) VALUES
(3, '2241389', 5000.00, 10000.00, 500.00, 10000.00, '2025-12-14 15:41:27', '2241389'),
(4, '2241389', 5000.00, 10000.00, 500.00, 10000.00, '2025-12-14 15:41:54', '2241389');

-- --------------------------------------------------------

--
-- Table structure for table `bid_offers`
--

DROP TABLE IF EXISTS `bid_offers`;
CREATE TABLE IF NOT EXISTS `bid_offers` (
  `offer_id` int NOT NULL AUTO_INCREMENT,
  `bid_id` int NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `price_offered` decimal(10,2) NOT NULL,
  PRIMARY KEY (`offer_id`),
  KEY `bid_id` (`bid_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image`) VALUES
(1, 'Fashion', 'fashion-main.jpg'),
(2, 'School Supplies', 'school supplies-main.jpg'),
(3, 'Technology', 'technology-main.jpg'),
(4, 'Tools & Home Materials', 'tools-main.jpg'),
(5, 'Automotive', 'auto-image.jpg'),
(6, 'Hobbies & Toys', 'toys-image.jpg'),
(7, 'Decoration', 'decoration-main.jpg'),
(8, 'Sports & Recreation', 'sports-main.jpg'),
(9, 'Pet Supplies', 'pet-main.jpg'),
(10, 'Beauty', 'beauty-main.jpg'),
(11, 'Others', 'others-main.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `listings`
--

DROP TABLE IF EXISTS `listings`;
CREATE TABLE IF NOT EXISTS `listings` (
  `listing_id` int NOT NULL AUTO_INCREMENT,
  `user_idnum` varchar(20) DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `start_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `end_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` text,
  `exchange_method` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `is_valid` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `listing_type` enum('bid','trade') NOT NULL DEFAULT 'bid',
  PRIMARY KEY (`listing_id`),
  KEY `user_idnum` (`user_idnum`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listings`
--

INSERT INTO `listings` (`listing_id`, `user_idnum`, `quantity`, `start_date`, `end_date`, `description`, `exchange_method`, `payment_method`, `is_valid`, `created_at`, `listing_type`) VALUES
(1, '2241389', 3, '2025-10-18 00:00:00', '2025-10-25 00:00:00', '3 sets of textbooks for exchange', 'In person', 'Gcash', 1, '2025-11-08 00:33:20', 'bid'),
(2, '2241389', 123, '2025-11-07 16:38:47', '2025-11-07 16:38:47', '123', '123', 'onsite', 1, '2025-11-08 00:38:48', 'bid'),
(3, '2241389', 19000, '2025-11-07 17:18:11', '2025-11-07 17:18:11', 'i dont know', 'January', 'onsite', 1, '2025-11-08 01:18:11', 'bid'),
(5, '2241389', 1, '2025-12-14 13:13:18', '2025-12-21 13:13:18', 'yes', 'face to face', 'onsite', 1, '2025-12-14 13:13:18', 'bid'),
(6, '2241389', 1, '2025-12-14 13:22:05', '2025-12-21 13:22:05', 'yes', 'face to face', 'onsite', 1, '2025-12-14 13:22:05', 'bid'),
(7, '2241389', 1, '2025-12-14 13:24:20', '2025-12-21 13:24:20', 'ssss', 'face to face', 'onsite', 1, '2025-12-14 13:24:20', 'bid'),
(8, '2241389', 1, '2025-12-14 13:24:44', '2025-12-21 13:24:44', 'aaaa', 'face to face', 'onsite', 1, '2025-12-14 13:24:44', 'bid'),
(9, '2241389', 1, '2025-12-14 13:27:25', '2025-12-21 13:27:25', 'ok', 'face to face', 'onsite', 1, '2025-12-14 13:27:25', 'bid'),
(10, '2241389', 1, '2025-12-14 15:16:41', '2025-12-21 15:16:41', 'hahahha', 'face to face', 'onsite', 1, '2025-12-14 15:16:41', 'bid'),
(11, '2241389', 1, '2025-12-14 15:35:30', '2025-12-14 15:35:30', 'yes', 'face to face', 'onsite', 1, '2025-12-14 15:35:30', 'bid'),
(12, '2241389', 1, '2025-12-14 15:35:45', '2025-12-14 15:35:45', 'yes', 'face to face', 'onsite', 1, '2025-12-14 15:35:45', 'bid'),
(13, '2241389', 1, '2025-12-14 15:36:22', '2025-12-14 15:36:22', 'yes', 'face to face', 'onsite', 1, '2025-12-14 15:36:22', 'bid'),
(14, '2241389', 1, '2025-12-14 15:36:46', '2025-12-21 15:36:46', 'yes', 'face to face', 'onsite', 1, '2025-12-14 15:36:46', 'bid'),
(15, '2241389', 1, '2025-12-14 15:37:22', '2025-12-14 15:37:22', 'yeeee', 'face to face', 'onsite', 1, '2025-12-14 15:37:22', 'bid'),
(16, '2241389', 1, '2025-12-14 15:41:27', '2025-12-21 15:41:27', 'ssss', 'face to face', 'onsite', 1, '2025-12-14 15:41:27', 'bid'),
(17, '2241389', 1, '2025-12-14 15:41:54', '2025-12-21 15:41:54', 'asdas', 'face to face', 'onsite', 1, '2025-12-14 15:41:54', 'bid');

-- --------------------------------------------------------

--
-- Table structure for table `listing_categories`
--

DROP TABLE IF EXISTS `listing_categories`;
CREATE TABLE IF NOT EXISTS `listing_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int DEFAULT NULL,
  `category` enum('Fashion','School Supplies','Technology','Tools & Home Materials','Automotive','Hobbies & Toys','Decoration','Sports & Recreation','Pet Supplies','Beauty','Others') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listing_categories`
--

INSERT INTO `listing_categories` (`id`, `listing_id`, `category`) VALUES
(1, 5, 'Fashion'),
(2, 5, 'Hobbies & Toys'),
(3, 6, 'Sports & Recreation'),
(4, 6, 'Pet Supplies'),
(5, 7, 'Decoration'),
(6, 8, 'School Supplies'),
(7, 9, 'Pet Supplies'),
(8, 10, 'Tools & Home Materials'),
(9, 11, 'School Supplies'),
(10, 11, 'Decoration'),
(11, 12, 'School Supplies'),
(12, 12, 'Decoration'),
(13, 13, 'School Supplies'),
(14, 13, 'Decoration'),
(15, 14, 'School Supplies'),
(16, 14, 'Decoration'),
(17, 15, 'School Supplies'),
(18, 15, 'Technology'),
(19, 16, 'School Supplies'),
(20, 17, 'School Supplies');

-- --------------------------------------------------------

--
-- Table structure for table `listing_images`
--

DROP TABLE IF EXISTS `listing_images`;
CREATE TABLE IF NOT EXISTS `listing_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `listing_id` (`listing_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listing_images`
--

INSERT INTO `listing_images` (`image_id`, `listing_id`, `image_path`, `uploaded_at`) VALUES
(1, 2, '../../../uploads/1762533528_bird.jpg', '2025-11-08 00:38:48'),
(2, 3, '../../../uploads/1762535891_lux.jpg', '2025-11-08 01:18:11'),
(3, 5, '../../../uploads/1765689198_693e476e076ee_OIP.jpg', '2025-12-14 13:13:18'),
(4, 6, '../../../uploads/1765689725_693e497d965a3_OIP.jpg', '2025-12-14 13:22:05'),
(5, 7, '../../../uploads/1765689860_693e4a04b9dd6_OIP.jpg', '2025-12-14 13:24:20'),
(6, 9, '../../../uploads/1765690045_693e4abdd10d0_OIP.jpg', '2025-12-14 13:27:25'),
(7, 10, '../../../uploads/1765696601_693e645946c43_OIP.jpg', '2025-12-14 15:16:41'),
(8, 14, '../../../uploads/1765697806_693e690e512da_OIP.jpg', '2025-12-14 15:36:46'),
(9, 16, '../../../uploads/1765698087_693e6a27b952e_OIP.jpg', '2025-12-14 15:41:27'),
(10, 17, '../../../uploads/1765698114_693e6a42044cc_OIP.jpg', '2025-12-14 15:41:54');

-- --------------------------------------------------------

--
-- Table structure for table `listing_items`
--

DROP TABLE IF EXISTS `listing_items`;
CREATE TABLE IF NOT EXISTS `listing_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `item_condition` varchar(50) DEFAULT NULL,
  `categories` enum('Fashion','School Supplies','Technology','Tools & Home Materials','Automotive','Hobbies & Toys','Decoration','Sports & Recreation','Pet Supplies','Beauty','Others') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `listing_id` (`listing_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listing_items`
--

INSERT INTO `listing_items` (`item_id`, `listing_id`, `name`, `item_condition`, `categories`, `created_at`) VALUES
(1, 1, 'Math Book', 'Good', 'School Supplies', '2025-11-08 00:33:20'),
(2, 1, 'English Book', 'Fair', 'School Supplies', '2025-11-08 00:33:20'),
(3, 1, 'History Book', 'Excellent', 'School Supplies', '2025-11-08 00:33:20'),
(4, 2, '123', '123', 'Technology', '2025-11-08 00:38:48'),
(5, 3, 'Labubu', 'so good', 'Hobbies & Toys', '2025-11-08 01:18:11'),
(6, 5, 'iphone 1121', 'good', 'Fashion', '2025-12-14 13:13:18'),
(7, 6, 'iphone 1121', 'good', 'Sports & Recreation', '2025-12-14 13:22:05'),
(8, 7, 'iphone 1123123', 'good', 'Decoration', '2025-12-14 13:24:20'),
(9, 8, 'iphone 1123123', 'good', 'School Supplies', '2025-12-14 13:24:44'),
(10, 9, 'cola', 'good', 'Pet Supplies', '2025-12-14 13:27:25'),
(11, 10, 'cola', 'good', 'Tools & Home Materials', '2025-12-14 15:16:41'),
(12, 11, 'coca cola', 'good', 'School Supplies', '2025-12-14 15:35:30'),
(13, 12, 'coca cola', 'good', 'School Supplies', '2025-12-14 15:35:45'),
(14, 13, 'coca cola', 'good', 'School Supplies', '2025-12-14 15:36:22'),
(15, 14, 'coca cola', 'good', 'School Supplies', '2025-12-14 15:36:46'),
(16, 15, 'cocacola', 'good', 'School Supplies', '2025-12-14 15:37:22'),
(17, 16, 'cocacola', 'good', 'School Supplies', '2025-12-14 15:41:27'),
(18, 17, 'iphone 1121', 'good', 'School Supplies', '2025-12-14 15:41:54');

-- --------------------------------------------------------

--
-- Table structure for table `platform_metrics`
--

DROP TABLE IF EXISTS `platform_metrics`;
CREATE TABLE IF NOT EXISTS `platform_metrics` (
  `metric_id` int NOT NULL AUTO_INCREMENT,
  `metric_date` date NOT NULL,
  `total_users` int DEFAULT '0',
  `active_users` int DEFAULT '0',
  `new_users` int DEFAULT '0',
  `total_listings` int DEFAULT '0',
  `active_listings` int DEFAULT '0',
  `completed_transactions` int DEFAULT '0',
  `total_sales` decimal(12,2) DEFAULT '0.00',
  `avg_transaction_value` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`metric_id`),
  UNIQUE KEY `metric_date` (`metric_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `transaction_id` varchar(20) NOT NULL,
  `listing_id` int DEFAULT NULL,
  `seller_id` varchar(20) DEFAULT NULL,
  `buyer_id` varchar(20) DEFAULT NULL,
  `transaction_type` enum('auction','barter','sale') NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `starting_bid` decimal(10,2) DEFAULT NULL,
  `final_price` decimal(10,2) DEFAULT NULL,
  `transaction_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','completed','cancelled','active') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `seller_id` (`seller_id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `transaction_date` (`transaction_date`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_idnum` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_initial` char(1) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(150) NOT NULL,
  `school` varchar(100) DEFAULT NULL,
  `program` varchar(100) DEFAULT NULL,
  `role` enum('admin','student') NOT NULL DEFAULT 'student',
  PRIMARY KEY (`user_idnum`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_idnum`, `first_name`, `middle_initial`, `last_name`, `password_hash`, `email`, `school`, `program`, `role`) VALUES
('2241389', '', NULL, '', '$2y$10$HbMJVZ3w7PQd03foT5OIi.TCG0kQInwAgwE.kxsJRc42Zrsc6wot6', '2241389@slu.edu.ph', NULL, NULL, 'student'),
('ADMIN001', 'Admin', NULL, 'Account', '$2y$10$GwRDdoMlYKAJ6f1KLN4jKuaRcWyK6Mcu1zU5vg1yyTEUsuGskDlzy', 'admin@paybach.com', 'SAMCIS', 'BSCS', 'admin'),
('2241901', '', NULL, '', '$2y$10$DHjHhaCi7W23I6pl1B/ORuWxQ/IZ259HHuKui/NMmkzKUQwLZxa6W', '2241901@slu.edu.ph', NULL, NULL, 'student'),
('2230136', '', NULL, '', '$2y$10$1NqlGqzv0DAktNvsDhLZF.2bxznFr7sMu2DObUA0cp.LwTEJ37NCq', '2230136@slu.edu.ph', NULL, NULL, 'student'),
('111', '', NULL, '', '$2y$10$qw51KY/CnqOhOhPvK2C.m.UbQuVOv26fdwgFfPmkpydFpqvPnjL2K', '111@sample.com', NULL, NULL, 'student'),
('222', '', NULL, '', '$2y$10$1FUIf3wWhuOHYT3QUN5yq.HpN0H0Y8Rjrw3ZwwmGbAXCmO5qZ/LbW', '222@sample.com', NULL, NULL, 'student');

-- --------------------------------------------------------

--
-- Table structure for table `user_courses`
--

DROP TABLE IF EXISTS `user_courses`;
CREATE TABLE IF NOT EXISTS `user_courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_idnum` varchar(20) DEFAULT NULL,
  `course_code` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_idnum` (`user_idnum`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_courses`
--

INSERT INTO `user_courses` (`id`, `user_idnum`, `course_code`) VALUES
(1, '2241389', 'CS213'),
(2, '2241389', 'CS211');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `user_idnum` varchar(20) NOT NULL,
  `login_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_activity` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `logout_time` datetime DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `user_idnum` (`user_idnum`),
  KEY `last_activity` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
