<?php
header("Content-Type: application/json");
include("../../db_connect.php");

if (!isset($_GET["listing_id"])) {
    echo json_encode(["success" => false, "message" => "Missing ID"]);
    exit;
}

$listing_id = intval($_GET["listing_id"]);

/* =============================
   GET LISTING + SELLER INFO
   ============================= */
$sql = "
SELECT 
    l.*, 
    u.first_name, 
    u.last_name, 
    u.email
FROM listings l
JOIN users u ON l.user_idnum = u.user_idnum
WHERE l.listing_id = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$listing = $stmt->get_result()->fetch_assoc();

if (!$listing) {
    echo json_encode(["success" => false]);
    exit;
}

/* =============================
   GET ITEMS
   ============================= */
$items = [];
$res = $conn->query("SELECT * FROM listing_items WHERE listing_id = $listing_id");
while ($row = $res->fetch_assoc()) {
    $items[] = $row;
}

/* =============================
   GET CATEGORIES
   ============================= */
$categories = [];
$res = $conn->query("SELECT category FROM listing_categories WHERE listing_id = $listing_id");
while ($row = $res->fetch_assoc()) {
    $categories[] = $row;
}

/* =============================
   GET IMAGES
   ============================= */
$images = [];
$res = $conn->query("SELECT image_path FROM listing_images WHERE listing_id = $listing_id");
while ($row = $res->fetch_assoc()) {
    $images[] = $row["image_path"];
}

/* =============================
   GET CURRENT PRICE (via bids)
   ============================= */
$currentPrice = 0;

$res = $conn->query("SELECT current_amount FROM bids WHERE transaction_id = $listing_id");
if ($row = $res->fetch_assoc()) {
    $currentPrice = floatval($row["current_amount"]);
}

echo json_encode([
    "success" => true,
    "listing" => $listing,
    "items" => $items,
    "categories" => $categories,
    "images" => $images,
    "currentPrice" => $currentPrice
]);
?>
