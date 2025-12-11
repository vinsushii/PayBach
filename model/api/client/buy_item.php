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

// ===== GET LISTING DETAILS =====
$stmt = $conn->prepare("
    SELECT 
        l.listing_id,
        l.user_idnum,
        l.description,
        l.exchange_method,
        l.payment_method,
        l.quantity AS start_bid,
        l.start_date,
        l.end_date,
        CONCAT(u.first_name, ' ', u.last_name) AS seller_name,
        u.school,
        u.program
    FROM listings l
    JOIN users u ON l.user_idnum = u.user_idnum
    WHERE l.listing_id = ? AND l.is_valid = TRUE
    LIMIT 1
");
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$result = $stmt->get_result();
$listing = $result->fetch_assoc();
$stmt->close();

if (!$listing) {
    echo json_encode(["success" => false, "message" => "Listing not found"]);
    exit;
}

// ===== GET ITEMS =====
$stmtItems = $conn->prepare("
    SELECT name, item_condition
    FROM listing_items
    WHERE listing_id = ?
");
$stmtItems->bind_param("i", $listing_id);
$stmtItems->execute();
$items = $stmtItems->get_result()->fetch_all(MYSQLI_ASSOC);
$stmtItems->close();

// ===== GET CATEGORIES =====
$stmtCats = $conn->prepare("
    SELECT category
    FROM listing_categories
    WHERE listing_id = ?
");
$stmtCats->bind_param("i", $listing_id);
$stmtCats->execute();
$categories = array_column(
    $stmtCats->get_result()->fetch_all(MYSQLI_ASSOC),
    "category"
);
$stmtCats->close();

// ===== GET IMAGES =====
$stmtImgs = $conn->prepare("
    SELECT image_path
    FROM listing_images
    WHERE listing_id = ?
");
$stmtImgs->bind_param("i", $listing_id);
$stmtImgs->execute();
$images = array_column(
    $stmtImgs->get_result()->fetch_all(MYSQLI_ASSOC),
    "image_path"
);
$stmtImgs->close();

// ===== GET CURRENT PRICE =====
$stmtPrice = $conn->prepare("
    SELECT MAX(price_offered) AS current_price
    FROM bid_offers
    WHERE bid_id = ?
");
$stmtPrice->bind_param("i", $listing_id);
$stmtPrice->execute();
$priceRes = $stmtPrice->get_result()->fetch_assoc();
$currentPrice = $priceRes["current_price"] ?? $listing["start_bid"];
$stmtPrice->close();

echo json_encode([
    "success" => true,
    "listing" => $listing,
    "items" => $items,
    "categories" => $categories,
    "images" => $images,
    "currentPrice" => $currentPrice
]);
