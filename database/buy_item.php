<?php
require_once("../database/db_connect.php");

header("Content-Type: application/json");

if (!isset($_GET["id"])) {
    echo json_encode(["success" => false, "message" => "Missing listing ID"]);
    exit;
}

$listing_id = intval($_GET["id"]);

// Fetch listing + seller
$stmt = $conn->prepare("
    SELECT l.*, CONCAT(u.first_name, ' ', u.last_name) AS seller_name, u.email
    FROM listings l
    JOIN users u ON l.user_idnum = u.user_idnum
    WHERE l.listing_id = ?
");
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$result = $stmt->get_result();
$listing = $result->fetch_assoc();

if (!$listing) {
    echo json_encode(["success" => false, "message" => "Listing not found"]);
    exit;
}

// Items
$stmt2 = $conn->prepare("SELECT name, item_condition FROM listing_items WHERE listing_id = ?");
$stmt2->bind_param("i", $listing_id);
$stmt2->execute();
$items = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

// Categories
$stmt3 = $conn->prepare("SELECT category FROM listing_categories WHERE listing_id = ?");
$stmt3->bind_param("i", $listing_id);
$stmt3->execute();
$categories = array_column($stmt3->get_result()->fetch_all(MYSQLI_ASSOC), "category");

// Images
$stmt4 = $conn->prepare("SELECT image_path FROM listing_images WHERE listing_id = ?");
$stmt4->bind_param("i", $listing_id);
$stmt4->execute();
$images = array_column($stmt4->get_result()->fetch_all(MYSQLI_ASSOC), "image_path");

// Current bid
$stmt5 = $conn->prepare("SELECT current_amount FROM bids WHERE transaction_id = ? LIMIT 1");
$stmt5->bind_param("i", $listing_id);
$stmt5->execute();
$currentBid = $stmt5->get_result()->fetch_assoc();
$currentPrice = $currentBid["current_amount"] ?? $listing["start_bid"] ?? 0;

echo json_encode([
    "success" => true,
    "listing" => $listing,
    "items" => $items,
    "categories" => $categories,
    "images" => $images,
    "currentPrice" => $currentPrice
]);
