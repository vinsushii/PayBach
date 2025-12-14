<?php
header("Content-Type: application/json");
session_start();

require_once __DIR__ . "/../../config/db_connect.php";

if (!isset($_SESSION['user_idnum'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

if (!isset($_POST["id"], $_POST["price"])) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

$listingId = intval($_POST["id"]);
$newPrice  = floatval($_POST["price"]);
$userId    = $_SESSION['user_idnum'];

if ($newPrice <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid price"]);
    exit;
}

// Get current bid
$stmt = $conn->prepare("
    SELECT current_amount, start_bid 
    FROM bids 
    WHERE listing_id = ?
    LIMIT 1
");
$stmt->bind_param("i", $listingId);
$stmt->execute();
$bid = $stmt->get_result()->fetch_assoc();

$current = $bid["current_amount"] ?? $bid["start_bid"] ?? 0;

if ($newPrice <= $current) {
    echo json_encode(["success" => false, "message" => "Bid must be higher"]);
    exit;
}

// Update bid
$update = $conn->prepare("
    UPDATE bids 
    SET 
        current_amount = ?,
        current_highest_bidder = ?,
        bid_datetime = NOW()
    WHERE listing_id = ?
");
$update->bind_param("dsi", $newPrice, $userId, $listingId);

if ($update->execute()) {
    echo json_encode(["success" => true, "newPrice" => $newPrice]);
} else {
    echo json_encode(["success" => false, "message" => "Database error"]);
}
