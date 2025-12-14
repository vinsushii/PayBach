<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// Include database connection
require_once __DIR__ . "/../../config/db_connect.php";

// Only allow logged-in students
if (!isset($_SESSION['user_idnum']) || $_SESSION['role'] !== 'student') {
    header("Location: ../../../index.html"); // back to login
    exit();
}

// Debug: Check if connection is established
if (!$conn) {
    die("Database connection failed");
}

// Get Bids (FIXED TABLE NAMES - use your actual table names)
$sqlBids = "SELECT listing_id, description, start_date, end_date, exchange_method, 'Bid' AS item_type 
            FROM listings 
            WHERE listing_type='bid' AND is_valid=1";

$bids = $conn->query($sqlBids)->fetch_all(MYSQLI_ASSOC);

// Get Trades (FIXED TABLE NAMES - use your actual table names)
$sqlTrades = "SELECT listing_id, description, start_date, end_date, exchange_method, 'Trade' AS item_type 
              FROM listings 
              WHERE listing_type='trade' AND is_valid=1";

$trades = $conn->query($sqlTrades)->fetch_all(MYSQLI_ASSOC);

// Merge into one list
$allItems = array_merge($bids, $trades);

// Optionally sort (newest first)
usort($allItems, function($a, $b) {
    return strtotime($b['start_date']) - strtotime($a['start_date']);
});

echo json_encode($allItems);
?>