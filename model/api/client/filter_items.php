<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/db_connect.php";

$db = Database::getInstance();
$conn = $db->getConnection();

if (!$conn) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

if (!isset($_GET['category'])) {
    echo json_encode(["error" => "Category not provided"]);
    exit;
}

$category = mysqli_real_escape_string($conn, $_GET['category']);

$sql = "
    SELECT 
        li.item_id, 
        li.listing_id,
        li.name, 
        li.item_condition,
        l.description,
        COALESCE(img.image_path, '') AS image_url
    FROM listing_items li
    LEFT JOIN listings l ON l.listing_id = li.listing_id
    LEFT JOIN listing_images img ON img.listing_id = li.listing_id
    LEFT JOIN listing_categories cat ON li.listing_id = cat.listing_id
    WHERE cat.category = '$category'
";

$result = $conn->query($sql);

$items = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
}

echo json_encode([
    "status" => "success",
    "items" => $items
]);
?>