-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 17, 2025 at 05:02 AM
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
  `accepted_offer_image` varchar(255) DEFAULT NULL,
  `max_additional_cash` decimal(10,2) DEFAULT '0.00',
  `trade_tags` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `status` enum('active','completed','canceled','accepted') DEFAULT 'active',
  PRIMARY KEY (`barter_id`),
  UNIQUE KEY `listing_id` (`listing_id`),
  KEY `user_idnum` (`user_idnum`),
  KEY `offered_item_name` (`offered_item_name`),
  KEY `exchange_method` (`exchange_method`),
  KEY `payment_method` (`payment_method`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `barters`
--

INSERT INTO `barters` (`barter_id`, `listing_id`, `user_idnum`, `offered_item_name`, `offered_item_condition`, `offered_item_description`, `exchange_method`, `payment_method`, `requested_items_text`, `accepted_offer_image`, `max_additional_cash`, `trade_tags`, `created_at`, `updated_at`, `is_active`, `status`) VALUES
(19, 45, '2241389', 'computer set', 'New', 'never used', 'in person', 'onsite', 'laptop', NULL, 0.00, '[\"laptop\"]', '2025-12-17 13:00:50', '2025-12-17 13:02:09', 0, 'completed');

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
  `offered_item_image` varchar(255) DEFAULT NULL,
  `status` enum('pending','accepted','rejected','cancelled') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`offer_id`),
  KEY `barter_id` (`barter_id`),
  KEY `offerer_idnum` (`offerer_idnum`),
  KEY `listing_id` (`listing_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `barter_offers`
--

INSERT INTO `barter_offers` (`offer_id`, `listing_id`, `barter_id`, `offerer_idnum`, `offered_item_name`, `item_condition`, `offered_item_description`, `additional_cash`, `offered_item_image`, `status`, `created_at`, `updated_at`) VALUES
(15, 45, 19, '22412345', 'laptop', 'good', '0', 0.00, 'uploads/offer_images/offer_6942393c2fe818.17763427.jpg', 'accepted', '2025-12-17 13:01:48', '2025-12-17 13:02:01');

-- --------------------------------------------------------

--
-- Table structure for table `barter_transactions`
--

DROP TABLE IF EXISTS `barter_transactions`;
CREATE TABLE IF NOT EXISTS `barter_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barter_id` int NOT NULL,
  `listing_id` int NOT NULL,
  `seller_id` varchar(20) NOT NULL,
  `buyer_id` varchar(20) NOT NULL,
  `seller_item_name` varchar(100) NOT NULL,
  `buyer_item_name` varchar(100) NOT NULL,
  `additional_cash` decimal(10,2) DEFAULT '0.00',
  `exchange_method` varchar(50) DEFAULT NULL,
  `completed_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barter_id` (`barter_id`),
  KEY `seller_id` (`seller_id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `completed_date` (`completed_date`),
  KEY `exchange_method` (`exchange_method`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `barter_transactions`
--

INSERT INTO `barter_transactions` (`id`, `barter_id`, `listing_id`, `seller_id`, `buyer_id`, `seller_item_name`, `buyer_item_name`, `additional_cash`, `exchange_method`, `completed_date`) VALUES
(1, 19, 45, '2241389', '22412345', 'computer set', 'laptop', 0.00, 'in person', '2025-12-17 13:02:09');

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
  `bid_status` enum('ACTIVE','CLOSED') NOT NULL DEFAULT 'ACTIVE',
  `is_auto_bid` tinyint(1) DEFAULT '0',
  `max_auto_bid` decimal(10,2) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`listing_id`),
  KEY `user_idnum` (`user_idnum`),
  KEY `idx_bids_listing_amount` (`listing_id`,`current_amount` DESC),
  KEY `idx_bids_user` (`user_idnum`),
  KEY `idx_bids_status` (`bid_status`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bids`
--

INSERT INTO `bids` (`listing_id`, `user_idnum`, `autobuy_amount`, `start_bid`, `bid_increment`, `current_amount`, `bid_datetime`, `current_highest_bidder`, `bid_status`, `is_auto_bid`, `max_auto_bid`, `updated_at`) VALUES
(21, '2230136', 150.00, 1000.00, 50.00, 1000.00, '2025-12-14 18:46:09', '2230136', 'ACTIVE', 0, NULL, '2025-12-15 07:51:06'),
(22, '2230136', 20.00, 50.00, 50.00, 100.00, '2025-12-15 00:58:14', '2241389', 'ACTIVE', 0, NULL, '2025-12-15 07:51:06'),
(24, '2241389', 5000.00, 10000.00, 500.00, 10000.00, '2025-12-15 00:49:30', '2241389', 'ACTIVE', 0, NULL, '2025-12-15 07:51:06'),
(31, '111', 200.00, 100.00, 50.00, 100.00, '2025-12-15 16:15:04', '111', 'ACTIVE', 0, NULL, '2025-12-15 08:15:04'),
(32, '222', 100.00, 10.00, 50.00, 10.00, '2025-12-15 16:47:18', '222', 'ACTIVE', 0, NULL, '2025-12-15 08:47:18'),
(33, '2242157', 300.00, 301.00, 50.00, 301.00, '2025-12-15 16:51:51', '2242157', 'ACTIVE', 0, NULL, '2025-12-15 08:51:51');

-- --------------------------------------------------------

--
-- Table structure for table `bid_history`
--

DROP TABLE IF EXISTS `bid_history`;
CREATE TABLE IF NOT EXISTS `bid_history` (
  `bid_id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int NOT NULL,
  `user_idnum` varchar(20) NOT NULL,
  `bid_amount` decimal(10,2) NOT NULL,
  `bid_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_auto_bid` tinyint(1) DEFAULT '0',
  `max_auto_bid` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`bid_id`),
  KEY `idx_bid_history_listing` (`listing_id`),
  KEY `idx_bid_history_user` (`user_idnum`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(29, '2241389', 1, '2025-12-15 04:58:07', '2026-01-14 04:58:07', 'sssss', 'in person', 'online', 1, '2025-12-15 04:58:07', 'trade'),
(30, '111', 1, '2025-12-15 16:05:04', '2026-01-14 16:05:04', 'White', 'in person', 'Trade only', 1, '2025-12-15 16:05:04', 'trade'),
(31, '111', 1, '2025-12-15 16:15:04', '2025-12-22 16:15:04', 'good mouse', 'in person', 'onsite', 1, '2025-12-15 16:15:04', 'bid'),
(32, '222', 1, '2025-12-15 16:47:18', '2025-12-22 16:47:18', 'sarap', 'in person', 'onsite', 1, '2025-12-15 16:47:18', 'bid'),
(33, '2242157', 1, '2025-12-15 16:51:51', '2025-12-22 16:51:51', 'headphones', 'in person', 'onsite', 1, '2025-12-15 16:51:51', 'bid'),
(34, '222', 1, '2025-12-15 20:49:29', '2026-01-14 20:49:29', 'logitech mouse', 'in person', 'Trade only', 1, '2025-12-15 20:49:29', 'trade'),
(35, '2241389', 1, '2025-12-16 03:48:14', '2026-01-15 03:48:14', 'asdasd', 'in person', 'Trade only', 1, '2025-12-16 03:48:14', 'trade'),
(36, '2241389', 1, '2025-12-16 08:00:17', '2026-01-15 08:00:17', 'asda', 'campus', 'Trade only', 1, '2025-12-16 08:00:17', 'trade'),
(37, '2241389', 1, '2025-12-16 08:11:36', '2026-01-15 08:11:36', 'ok', 'drop off', 'onsite', 1, '2025-12-16 08:11:36', 'trade'),
(38, '2241389', 1, '2025-12-16 10:02:52', '2026-01-15 10:02:52', 'ok', 'in person', 'Trade only', 1, '2025-12-16 10:02:52', 'trade'),
(39, '2241389', 1, '2025-12-17 08:36:43', '2026-01-16 08:36:43', 'bought never used', 'in person', 'Trade only', 1, '2025-12-17 08:36:43', 'trade'),
(40, '2241389', 1, '2025-12-17 08:57:37', '2026-01-16 08:57:37', '1 year', 'in person', 'Trade only', 1, '2025-12-17 08:57:37', 'trade'),
(41, '2241389', 1, '2025-12-17 09:39:26', '2026-01-16 09:39:26', 'asda', 'drop off', 'Trade only', 1, '2025-12-17 09:39:26', 'trade'),
(42, '2241389', 1, '2025-12-17 11:39:18', '2026-01-16 11:39:18', 'aasda', 'drop off', 'Trade only', 1, '2025-12-17 11:39:18', 'trade'),
(43, '22412345', 1, '2025-12-17 11:51:24', '2026-01-16 11:51:24', 'asda', 'shipping', 'Trade only', 1, '2025-12-17 11:51:24', 'trade'),
(44, '2241389', 1, '2025-12-17 11:55:32', '2026-01-16 11:55:32', 'rav', 'drop off', 'onsite', 1, '2025-12-17 11:55:32', 'trade'),
(45, '2241389', 1, '2025-12-17 13:00:50', '2026-01-16 13:00:50', 'never used', 'in person', 'onsite', 1, '2025-12-17 13:00:50', 'trade');

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
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(38, 29, 'Technology'),
(39, 30, ''),
(40, 30, 'Technology'),
(41, 31, 'Technology'),
(42, 32, 'Others'),
(43, 33, 'Technology'),
(44, 34, ''),
(45, 34, 'Technology'),
(46, 35, ''),
(47, 35, 'Technology'),
(48, 36, ''),
(49, 36, 'Technology'),
(50, 37, ''),
(51, 37, 'Technology'),
(52, 38, ''),
(53, 38, 'Technology'),
(54, 39, ''),
(55, 39, 'Technology'),
(56, 40, ''),
(57, 40, 'Technology'),
(58, 41, ''),
(59, 41, 'Fashion'),
(60, 42, ''),
(61, 42, 'Technology'),
(62, 43, ''),
(63, 43, 'School Supplies'),
(64, 44, ''),
(65, 44, 'School Supplies'),
(66, 45, ''),
(67, 45, 'Technology');

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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(22, 28, '../../../uploads/1765745567_693f239f72938_transparent-dragon-cartoon-dragon-head-with-fiery-expression6586e3b5b18e04.1457572317033389337273.jpg', '2025-12-15 04:52:47'),
(23, 30, '../../../uploads/1765785904_693fc130a93da_logitech.jpg', '2025-12-15 16:05:04'),
(24, 31, '../../../uploads/1765786504_693fc38823af3_logitech-mouse.jpg', '2025-12-15 16:15:04'),
(25, 32, '../../../uploads/1765788438_693fcb160fdfc_pringles.jpg', '2025-12-15 16:47:18'),
(26, 33, '../../../uploads/1765788711_693fcc2794a2a_headphones.jpg', '2025-12-15 16:51:51'),
(27, 34, '../../../uploads/1765802969_694003d9b011e_mouse.jpg', '2025-12-15 20:49:29'),
(28, 35, '../../../uploads/1765828094_694065fec7666_OIP.jpg', '2025-12-16 03:48:14'),
(29, 36, '../../../uploads/1765843217_6940a1113681c_OIP.jpg', '2025-12-16 08:00:17'),
(30, 37, '../../../uploads/1765843896_6940a3b84af94_OIP.jpg', '2025-12-16 08:11:36'),
(31, 38, '../../../uploads/1765850572_6940bdcce1847_OIP.jpg', '2025-12-16 10:02:52'),
(32, 39, '../../../uploads/1765931803_6941fb1b8fabd_computer-05.jpg', '2025-12-17 08:36:43'),
(33, 40, '../../../uploads/1765933057_694200016d166_computer-05.jpg', '2025-12-17 08:57:37'),
(34, 41, '../../../uploads/1765935566_694209ce728e8_computer-05.jpg', '2025-12-17 09:39:26'),
(35, 41, '../../../uploads/1765935566_694209ce72ac8_OIP.jpg', '2025-12-17 09:39:26'),
(36, 42, '../../../uploads/1765942758_694225e677e0d_computer-05.jpg', '2025-12-17 11:39:18'),
(37, 43, '../../../uploads/1765943484_694228bc11ca4_OIP.jpg', '2025-12-17 11:51:24'),
(38, 44, '../../../uploads/1765943732_694229b45541b_OIP.jpg', '2025-12-17 11:55:32'),
(39, 45, '../../../uploads/1765947650_69423902d44ae_computer-05.jpg', '2025-12-17 13:00:50');

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
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(28, 29, 'hutao', 'Good', '2025-12-15 04:58:07'),
(29, 30, 'mouse', 'Good', '2025-12-15 16:05:04'),
(30, 31, 'mouse', 'lightly used', '2025-12-15 16:15:04'),
(31, 32, 'pringles', 'lightly used', '2025-12-15 16:47:18'),
(32, 33, 'headphones', 'brand new', '2025-12-15 16:51:51'),
(33, 34, 'mouse', 'New', '2025-12-15 20:49:29'),
(34, 35, 'sssssssssss', 'Good', '2025-12-16 03:48:14'),
(35, 36, 'sssssssssss12111', 'New', '2025-12-16 08:00:17'),
(36, 37, 'laptop 123', 'Good', '2025-12-16 08:11:36'),
(37, 38, 'iphone 1121', 'Good', '2025-12-16 10:02:52'),
(38, 39, 'computer set', 'New', '2025-12-17 08:36:43'),
(39, 40, 'computer set', 'Good', '2025-12-17 08:57:37'),
(40, 41, 'computer set', 'Like New', '2025-12-17 09:39:26'),
(41, 42, 'computer set', 'New', '2025-12-17 11:39:18'),
(42, 43, 'sssssssssss12111', 'Like New', '2025-12-17 11:51:24'),
(43, 44, 'laptop 123', 'New', '2025-12-17 11:55:32'),
(44, 45, 'computer set', 'New', '2025-12-17 13:00:50');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `receiver_idnum` varchar(20) NOT NULL,
  `sender_idnum` varchar(20) NOT NULL,
  `listing_id` int NOT NULL,
  `type` enum('bid') NOT NULL DEFAULT 'bid',
  `message` varchar(255) NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `receiver_idnum` (`receiver_idnum`),
  KEY `listing_id` (`listing_id`),
  KEY `is_read` (`is_read`),
  KEY `fk_notifications_sender` (`sender_idnum`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
('22412345', '', NULL, '', '$2y$10$cjvhF1svaJf0AWg62TDbfO8k5pZSmLBJH8kA2QsMAKGpiZUVF5MAS', '22412345@yahoo.com', NULL, NULL, 'student'),
('2241389', '', NULL, '', '$2y$10$HbMJVZ3w7PQd03foT5OIi.TCG0kQInwAgwE.kxsJRc42Zrsc6wot6', '2241389@slu.edu.ph', NULL, NULL, 'student'),
('2241901', '', NULL, '', '$2y$10$DHjHhaCi7W23I6pl1B/ORuWxQ/IZ259HHuKui/NMmkzKUQwLZxa6W', '2241901@slu.edu.ph', NULL, NULL, 'student'),
('2242157', '', NULL, '', '$2y$10$CSGrCI0QT2pbUNJNttWUk.aM4DPAQocjPrw1mqZYwtZdgku/P1brm', '2242157@sample.com', NULL, NULL, 'student'),
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
