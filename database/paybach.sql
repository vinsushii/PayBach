-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 07, 2025 at 05:28 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;



DROP TABLE IF EXISTS `barters`;
CREATE TABLE IF NOT EXISTS `barters` (
  `barter_id` int NOT NULL AUTO_INCREMENT,
  `user_idnum` varchar(20) DEFAULT NULL,
  `requested_items` text,
  `date_of_exchange` datetime DEFAULT NULL,
  PRIMARY KEY (`barter_id`),
  KEY `user_idnum` (`user_idnum`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO `barters` (`barter_id`, `user_idnum`, `requested_items`, `date_of_exchange`) VALUES
(1, '224123', 'Laptop', '2025-10-18 12:00:00');


DROP TABLE IF EXISTS `barter_offers`;
CREATE TABLE IF NOT EXISTS `barter_offers` (
  `offer_id` int NOT NULL AUTO_INCREMENT,
  `barter_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `item_condition` varchar(50) DEFAULT NULL,
  `nagoffer` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`offer_id`),
  KEY `barter_id` (`barter_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO `barter_offers` (`offer_id`, `barter_id`, `name`, `item_condition`, `nagoffer`) VALUES
(1, 1, 'Tablet', 'Good', '2230136'),
(2, 1, 'Monitor', 'Excellent', '2236875');



DROP TABLE IF EXISTS `bids`;
CREATE TABLE IF NOT EXISTS `bids` (
  `bid_id` int NOT NULL AUTO_INCREMENT,
  `user_idnum` varchar(20) DEFAULT NULL,
  `transaction_id` int DEFAULT NULL,
  `autobuy_amount` decimal(10,2) DEFAULT NULL,
  `start_bid` decimal(10,2) DEFAULT NULL,
  `bid_increment` decimal(10,2) DEFAULT NULL,
  `current_amount` decimal(10,2) DEFAULT NULL,
  `bid_datetime` datetime DEFAULT NULL,
  `current_user_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`bid_id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `user_idnum` (`user_idnum`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `bids` (`bid_id`, `user_idnum`, `transaction_id`, `autobuy_amount`, `start_bid`, `bid_increment`, `current_amount`, `bid_datetime`, `current_user_id`) VALUES
(1, '2241389', 0, 5000.00, 1000.00, 100.00, 2500.00, '2025-10-18 10:30:00', '224123');



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
  PRIMARY KEY (`listing_id`),
  KEY `user_idnum` (`user_idnum`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO `listings` (`listing_id`, `user_idnum`, `quantity`, `start_date`, `end_date`, `description`, `exchange_method`, `payment_method`, `is_valid`, `created_at`) VALUES
(1, '2241389', 3, '2025-10-18 00:00:00', '2025-10-25 00:00:00', '3 sets of textbooks for exchange', 'In person', 'Gcash', 1, '2025-11-08 00:33:20'),
(2, '2241389', 123, '2025-11-07 16:38:47', '2025-11-07 16:38:47', '123', '123', 'onsite', 1, '2025-11-08 00:38:48'),
(3, '2241389', 19000, '2025-11-07 17:18:11', '2025-11-07 17:18:11', 'i dont know', 'January', 'onsite', 1, '2025-11-08 01:18:11');


DROP TABLE IF EXISTS `listing_categories`;
CREATE TABLE IF NOT EXISTS `listing_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `listing_categories` (`id`, `listing_id`, `category`, `created_at`) VALUES
(1, 1, 'Books', '2025-11-08 00:33:20'),
(2, 1, 'SAMCIS', '2025-11-08 00:33:20'),
(3, 1, 'Learning Material', '2025-11-08 00:33:20'),
(4, 2, 'Technology', '2025-11-08 00:38:48'),
(5, 3, 'Fashion', '2025-11-08 01:18:11');



DROP TABLE IF EXISTS `listing_images`;
CREATE TABLE IF NOT EXISTS `listing_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `listing_id` (`listing_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO `listing_images` (`image_id`, `listing_id`, `image_path`, `uploaded_at`) VALUES
(1, 2, '../uploads/1762533528_bird.png', '2025-11-08 00:38:48'),
(2, 3, '../uploads/1762535891_lux.jpg', '2025-11-08 01:18:11');



DROP TABLE IF EXISTS `listing_items`;
CREATE TABLE IF NOT EXISTS `listing_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `item_condition` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `listing_id` (`listing_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `listing_items` (`item_id`, `listing_id`, `name`, `item_condition`, `created_at`) VALUES
(1, 1, 'Math Book', 'Good', '2025-11-08 00:33:20'),
(2, 1, 'English Book', 'Fair', '2025-11-08 00:33:20'),
(3, 1, 'History Book', 'Excellent', '2025-11-08 00:33:20'),
(4, 2, '123', '123', '2025-11-08 00:38:48'),
(5, 3, 'Labubu', 'so good', '2025-11-08 01:18:11');



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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO `users` (`user_idnum`, `first_name`, `middle_initial`, `last_name`, `password_hash`, `email`, `school`, `program`, `role`) VALUES
('2241389', 'Juan', 'A', 'Dela Cruz', 'hashed_password_here', 'delaCruz@slu.edu.ph', 'SAMCIS', 'BSCS', 'student'),
('999999', 'Admin', NULL, 'User', 'admin_hashed_password_here', 'admin@paybach.com', 'SAMCIS', 'BSCS', 'admin'),
('2241901', '', NULL, '', '$2y$10$DHjHhaCi7W23I6pl1B/ORuWxQ/IZ259HHuKui/NMmkzKUQwLZxa6W', '2241901@slu.edu.ph', NULL, NULL, 'student');


DROP TABLE IF EXISTS `user_courses`;
CREATE TABLE IF NOT EXISTS `user_courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_idnum` varchar(20) DEFAULT NULL,
  `course_code` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_idnum` (`user_idnum`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO `user_courses` (`id`, `user_idnum`, `course_code`) VALUES
(1, '2241389', 'CS213'),
(2, '2241389', 'CS211');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
