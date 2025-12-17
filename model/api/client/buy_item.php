<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/db_connect.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Use POST"]);
    exit;
}

$listing_id = $_POST["listing_id"] ?? null;
if (!$listing_id) {
    echo json_encode(["success" => false, "message" => "Missing listing_id"]);
    exit;
}

// check if listing should still be active, set listing to completed if not

$stmtStatusCheck = $conn->prepare("
    SELECT end_date, status
    FROM listings
    WHERE listing_id = ? AND is_valid = TRUE
");
$stmtStatusCheck->bind_param("i", $listing_id);
$stmtStatusCheck->execute();
$statusCheck = $stmtStatusCheck->get_result()->fetch_assoc();
$stmtStatusCheck->close();

$currentDateTime = date('m/d/Y h:i:s a', time());
$currentTime = strtotime($currentDateTime);
$endTime = strtotime($statusCheck["end_date"]);

if ($endTime < $currentTime && $statusCheck["status"] == "ongoing") {
    $completed = "completed";
    $stmtStatusCheck = $conn->prepare("
        UPDATE listings
        SET status = ?
        WHERE listing_id = ?
    ");
    $stmtStatusCheck->bind_param("si", $completed, $listing_id);
    $stmtStatusCheck->execute();
    
    $completed = "CLOSED";
    $stmtStatusCheck = $conn->prepare("
        UPDATE bids
        SET bid_status = ?
        WHERE listing_id = ?
    ");
    $stmtStatusCheck->bind_param("si", $completed, $listing_id);
    $stmtStatusCheck->execute();
    $stmtStatusCheck->close();
}

/* ================= LISTING ================= */ 

$stmt = $conn->prepare("
    SELECT l.*, u.first_name, u.last_name, u.email, l.end_date, l.status
    FROM listings l
    JOIN users u ON l.user_idnum = u.user_idnum
    WHERE l.listing_id = ? AND l.is_valid = TRUE
    LIMIT 1
");
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$listing = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$listing) {
    echo json_encode(["success" => false, "message" => "Listing not found"]);
    exit;
}

/* ================= ITEMS ================= */

$stmt = $conn->prepare("
    SELECT name, item_condition
    FROM listing_items
    WHERE listing_id = ?
");
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

/* ================= CATEGORIES ================= */

$stmt = $conn->prepare("
    SELECT category
    FROM listing_categories
    WHERE listing_id = ?
");
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$categories = array_column(
    $stmt->get_result()->fetch_all(MYSQLI_ASSOC),
    "category"
);
$stmt->close();

/* ================= IMAGES ================= */

$stmt = $conn->prepare("
    SELECT image_path
    FROM listing_images
    WHERE listing_id = ?
");
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$images = array_column(
    $stmt->get_result()->fetch_all(MYSQLI_ASSOC),
    "image_path"
);
$stmt->close();

/* ================= BIDS ================= */

$stmt = $conn->prepare("
    SELECT current_amount, bid_increment, autobuy_amount, current_highest_bidder
    FROM bids
    WHERE listing_id = ?
");
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$bid = $stmt->get_result()->fetch_assoc();
$stmt->close();

$currentPrice = $bid["current_amount"] ?? 0;
$increment = $bid["bid_increment"] ?? 1;
$autobuy = $bid["autobuy_amount"];
$highestBidder = $bid["current_highest_bidder"];

/* ================= OFFERS ================= */

$stmt = $conn->prepare("
    SELECT bo.user_id, bo.price_offered
    FROM bid_offers bo
    JOIN bids b ON bo.bid_id = b.listing_id
    WHERE b.listing_id = ?
    ORDER BY bo.price_offered DESC
");
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$offers = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

/* ================= RESPONSE ================= */

echo json_encode([
    "success" => true,
    "listing" => $listing,
    "items" => $items,
    "categories" => $categories,
    "images" => $images,
    "currentPrice" => $currentPrice,
    "increment" => $increment,
    "offers" => $offers,
    "autobuy" => $autobuy,
    "highestBidder" => $highestBidder
]);
