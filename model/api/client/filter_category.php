<?php
header("Content-Type: application/json");
require("../../config/connection.php");

if (!isset($_GET['category'])) {
    echo json_encode(["status" => "error", "message" => "No category"]);
    exit;
}

$category = trim($_GET['category']);
$category = mysqli_real_escape_string($conn, $category);

$query = "
    SELECT 
        li.item_id,
        li.name,
        li.item_condition,
        cat.category,
        l.description,
        img.image_path
    FROM listing_items li
    LEFT JOIN listings l ON li.listing_id = l.listing_id
    LEFT JOIN listing_images img ON li.listing_id = img.listing_id
    LEFT JOIN listing_categories cat ON li.listing_id = cat.listing_id
    WHERE cat.category = '$category'
";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL error: " . mysqli_error($conn)
    ]);
    exit;
}

$items = [];

while ($row = mysqli_fetch_assoc($result)) {
    $items[] = $row;
}

if (count($items) > 0) {
    echo json_encode([
        "status" => "success",
        "items" => $items
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "No items found"
    ]);
}
?>