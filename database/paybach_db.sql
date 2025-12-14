-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 14, 2025 at 09:52 PM
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
  `listing_id` int NOT NULL,
  `user_idnum` varchar(20) NOT NULL,
  `offered_item_name` varchar(100) DEFAULT NULL,
  `offered_item_condition` varchar(50) DEFAULT NULL,
  `offered_item_description` text,
  `exchange_method` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `requested_items_text` text,
  `max_additional_cash` decimal(10,2) DEFAULT '0.00',
  `trade_tags` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`barter_id`),
  UNIQUE KEY `listing_id` (`listing_id`),
  KEY `user_idnum` (`user_idnum`),
  KEY `offered_item_name` (`offered_item_name`),
  KEY `exchange_method` (`exchange_method`),
  KEY `payment_method` (`payment_method`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `barters`
--

INSERT INTO `barters` (`barter_id`, `listing_id`, `user_idnum`, `offered_item_name`, `offered_item_condition`, `offered_item_description`, `exchange_method`, `payment_method`, `requested_items_text`, `max_additional_cash`, `trade_tags`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 23, '2241389', 'iphone 1121', 'New', 'Lenovo Legion', 'in person', 'none', 'MAC', 0.00, NULL, '2025-12-15 00:44:13', '2025-12-15 00:44:13', 1),
(2, 25, '2241389', 'iphone 112312', 'New', 'Lenovo Legion', 'in person', 'none', 'MAC', 0.00, '[\"laptop\"]', '2025-12-15 00:57:30', '2025-12-15 00:57:30', 1),
(3, 26, '2241389', 'iphone 112312123123', 'Well loved', 'Lenovo Legion', 'in person', 'none', 'MAC', 0.00, NULL, '2025-12-15 00:58:03', '2025-12-15 00:58:03', 1),
(4, 27, '2241389', 'iphone 112312123123', 'New', 'asadsa', 'in person', 'none', 'lapyop 12', 0.00, '[\"laptop\"]', '2025-12-15 03:56:42', '2025-12-15 03:56:42', 1),
(5, 28, '2241389', 'rat', 'Like New', 'asas', 'in person', 'onsite', 'sdsddddd', 0.00, '[\"laptop\"]', '2025-12-15 04:52:47', '2025-12-15 04:52:47', 1),
(6, 29, '2241389', 'hutao', 'Good', 'sssss', 'in person', 'online', 'trade', 0.00, '[\"anime\"]', '2025-12-15 04:58:07', '2025-12-15 04:58:07', 1);

-- --------------------------------------------------------

--
-- Table structure for table `barter_offers`
--

DROP TABLE IF EXISTS `barter_offers`;
CREATE TABLE IF NOT EXISTS `barter_offers` (
  `offer_id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int NOT NULL,
  `barter_id` int NOT NULL,
  `offerer_idnum` varchar(20) NOT NULL,
  `offered_item_name` varchar(100) DEFAULT NULL,
  `item_condition` varchar(50) DEFAULT NULL,
  `offered_item_description` text,
  `additional_cash` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','accepted','rejected','cancelled') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`offer_id`),
  KEY `barter_id` (`barter_id`),
  KEY `offerer_idnum` (`offerer_idnum`),
  KEY `listing_id` (`listing_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
CREATE TABLE IF NOT EXISTS `bids` (
  `listing_id` int NOT NULL AUTO_INCREMENT,
  `user_idnum` varchar(20) DEFAULT NULL,
  `autobuy_amount` decimal(10,2) DEFAULT NULL,
  `start_bid` decimal(10,2) DEFAULT NULL,
  `bid_increment` decimal(10,2) DEFAULT NULL,
  `current_amount` decimal(10,2) DEFAULT NULL,
  `bid_datetime` datetime DEFAULT NULL,
  `current_highest_bidder` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`listing_id`),
  KEY `user_idnum` (`user_idnum`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bids`
--

INSERT INTO `bids` (`listing_id`, `user_idnum`, `autobuy_amount`, `start_bid`, `bid_increment`, `current_amount`, `bid_datetime`, `current_highest_bidder`) VALUES
(21, '2230136', 150.00, 1000.00, 50.00, 1000.00, '2025-12-14 18:46:09', '2230136'),
(22, '2230136', 20.00, 50.00, 50.00, 100.00, '2025-12-15 00:58:14', '2241389'),
(24, '2241389', 5000.00, 10000.00, 500.00, 10000.00, '2025-12-15 00:49:30', '2241389');

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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listings`
--

INSERT INTO `listings` (`listing_id`, `user_idnum`, `quantity`, `start_date`, `end_date`, `description`, `exchange_method`, `payment_method`, `is_valid`, `created_at`, `listing_type`) VALUES
(21, '2230136', 1, '2025-12-14 18:46:09', '2025-12-21 18:46:09', 'Gaming laptop with great flexibility. Used once or twice. Comes with box', 'in person', 'onsite', 1, '2025-12-14 18:46:09', 'bid'),
(22, '2230136', 1, '2025-12-14 18:57:00', '2025-12-21 18:57:00', 'Pentel graphgear 1000 .5 in satin gold. Has retractable tip', 'drop off', 'online', 1, '2025-12-14 18:57:00', 'bid'),
(23, '2241389', 1, '2025-12-15 00:44:13', '2026-01-14 00:44:13', 'Lenovo Legion', 'in person', 'Trade only', 1, '2025-12-15 00:44:13', 'trade'),
(24, '2241389', 1, '2025-12-15 00:49:30', '2025-12-22 00:49:30', 'kkkk', 'face to face', 'onsite', 1, '2025-12-15 00:49:30', 'bid'),
(25, '2241389', 1, '2025-12-15 00:57:30', '2026-01-14 00:57:30', 'Lenovo Legion', 'in person', 'Trade only', 1, '2025-12-15 00:57:30', 'trade'),
(26, '2241389', 1, '2025-12-15 00:58:03', '2026-01-14 00:58:03', 'Lenovo Legion', 'in person', 'Trade only', 1, '2025-12-15 00:58:03', 'trade'),
(27, '2241389', 1, '2025-12-15 03:56:42', '2026-01-14 03:56:42', 'asadsa', 'in person', 'Trade only', 1, '2025-12-15 03:56:42', 'trade'),
(28, '2241389', 1, '2025-12-15 04:52:47', '2026-01-14 04:52:47', 'asas', 'in person', 'onsite', 1, '2025-12-15 04:52:47', 'trade'),
(29, '2241389', 1, '2025-12-15 04:58:07', '2026-01-14 04:58:07', 'sssss', 'in person', 'online', 1, '2025-12-15 04:58:07', 'trade');

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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listing_categories`
--

INSERT INTO `listing_categories` (`id`, `listing_id`, `category`) VALUES
(23, 21, 'Technology'),
(24, 21, 'Hobbies & Toys'),
(25, 22, 'School Supplies'),
(26, 23, ''),
(27, 23, 'Technology'),
(28, 24, 'Technology'),
(29, 25, ''),
(30, 25, 'Technology'),
(31, 26, ''),
(32, 26, 'Technology'),
(33, 27, ''),
(34, 27, 'Technology'),
(35, 28, ''),
(36, 28, 'Technology'),
(37, 29, ''),
(38, 29, 'Technology');

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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listing_images`
--

INSERT INTO `listing_images` (`image_id`, `listing_id`, `image_path`, `uploaded_at`) VALUES
(13, 21, '../../../uploads/1765709169_693e9571673c0_GPD-Win-Max-2-review-a-surprisingly-competent-tiny-laptop-1014x1024-703694246.jpeg', '2025-12-14 18:46:09'),
(14, 21, '../../../uploads/1765709169_693e95716778f_winmax.jpg', '2025-12-14 18:46:09'),
(15, 22, '../../../uploads/1765709820_693e97fc737ce_61G56dooF5L._AC_SL1500_-1668775032.jpg', '2025-12-14 18:57:00'),
(16, 22, '../../../uploads/1765709820_693e97fc73a5d_547b90f571476b17e7c5576d4df30a52-4153913507.jpg', '2025-12-14 18:57:00'),
(17, 22, '../../../uploads/1765709820_693e97fc73d1b_Pentel-Graphgear-1000-Mechanical-Pencil-Pentel-1683965778-4237365079.jpg', '2025-12-14 18:57:00'),
(18, 23, '../../../uploads/1765730653_693ee95d896a3_OIP.jpg', '2025-12-15 00:44:13'),
(19, 24, '../../../uploads/1765730970_693eea9a79347_OIP.jpg', '2025-12-15 00:49:30'),
(20, 25, '../../../uploads/1765731450_693eec7ab1059_transparent-dragon-cartoon-dragon-head-with-fiery-expression6586e3b5b18e04.1457572317033389337273.jpg', '2025-12-15 00:57:30'),
(21, 27, '../../../uploads/1765742202_693f167aa80ba_transparent-dragon-cartoon-dragon-head-with-fiery-expression6586e3b5b18e04.1457572317033389337273.jpg', '2025-12-15 03:56:42'),
(22, 28, '../../../uploads/1765745567_693f239f72938_transparent-dragon-cartoon-dragon-head-with-fiery-expression6586e3b5b18e04.1457572317033389337273.jpg', '2025-12-15 04:52:47');

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
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `listing_id` (`listing_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listing_items`
--

INSERT INTO `listing_items` (`item_id`, `listing_id`, `name`, `item_condition`, `created_at`) VALUES
(20, 21, 'GPD win max 2', 'lightly used', '2025-12-14 18:46:09'),
(21, 22, 'Mechanical pencil', 'Well loved', '2025-12-14 18:57:00'),
(22, 23, 'iphone 1121', 'New', '2025-12-15 00:44:13'),
(23, 24, 'laptop', 'good', '2025-12-15 00:49:30'),
(24, 25, 'iphone 112312', 'New', '2025-12-15 00:57:30'),
(25, 26, 'iphone 112312123123', 'Well loved', '2025-12-15 00:58:03'),
(26, 27, 'iphone 112312123123', 'New', '2025-12-15 03:56:42'),
(27, 28, 'rat', 'Like New', '2025-12-15 04:52:47'),
(28, 29, 'hutao', 'Good', '2025-12-15 04:58:07');

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
('111', '', NULL, '', '$2y$10$qw51KY/CnqOhOhPvK2C.m.UbQuVOv26fdwgFfPmkpydFpqvPnjL2K', '111@sample.com', NULL, NULL, 'student'),
('222', '', NULL, '', '$2y$10$1FUIf3wWhuOHYT3QUN5yq.HpN0H0Y8Rjrw3ZwwmGbAXCmO5qZ/LbW', '222@sample.com', NULL, NULL, 'student'),
('2230136', '', NULL, '', '$2y$10$1NqlGqzv0DAktNvsDhLZF.2bxznFr7sMu2DObUA0cp.LwTEJ37NCq', '2230136@slu.edu.ph', NULL, NULL, 'student'),
('2241389', '', NULL, '', '$2y$10$HbMJVZ3w7PQd03foT5OIi.TCG0kQInwAgwE.kxsJRc42Zrsc6wot6', '2241389@slu.edu.ph', NULL, NULL, 'student'),
('2241901', '', NULL, '', '$2y$10$DHjHhaCi7W23I6pl1B/ORuWxQ/IZ259HHuKui/NMmkzKUQwLZxa6W', '2241901@slu.edu.ph', NULL, NULL, 'student'),
('ADMIN001', 'Admin', NULL, 'Account', '$2y$10$GwRDdoMlYKAJ6f1KLN4jKuaRcWyK6Mcu1zU5vg1yyTEUsuGskDlzy', 'admin@paybach.com', 'SAMCIS', 'BSCS', 'admin');

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

--
-- Constraints for dumped tables
--

--
-- Constraints for table `barters`
--
ALTER TABLE `barters`
  ADD CONSTRAINT `fk_barters_listings` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`listing_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_barters_users` FOREIGN KEY (`user_idnum`) REFERENCES `users` (`user_idnum`) ON DELETE CASCADE;

--
-- Constraints for table `barter_offers`
--
ALTER TABLE `barter_offers`
  ADD CONSTRAINT `fk_barter_offers_barters` FOREIGN KEY (`barter_id`) REFERENCES `barters` (`barter_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_barter_offers_listings` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`listing_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_barter_offers_users` FOREIGN KEY (`offerer_idnum`) REFERENCES `users` (`user_idnum`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
