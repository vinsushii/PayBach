<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// Only allow logged-in students
if (!isset($_SESSION['user_idnum']) || $_SESSION['role'] !== 'student') {
    header("Location: ../../../index.html"); // back to login
    exit();
}

// If user is valid, go to HTML page
header("Location: ../../../views/pages/client/homepage.html");
exit();

// Get Bids
$sqlBids = "SELECT id, name, description, price, image, 'Bid' AS item_type 
            FROM bids 
            WHERE status='active'";

$bids = $conn->query($sqlBids)->fetch_all(MYSQLI_ASSOC);

// Get Trades
$sqlTrades = "SELECT id, name, description, image, 'Trade' AS item_type 
              FROM trades 
              WHERE status='active'";

$trades = $conn->query($sqlTrades)->fetch_all(MYSQLI_ASSOC);

// Merge into one list
$allItems = array_merge($bids, $trades);

// Optionally sort (newest first)
usort($allItems, function($a, $b) {
    return $b['id'] - $a['id'];
});

echo json_encode($allItems);
?>
