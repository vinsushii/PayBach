<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/db_connect.php";

if (!isset($_GET["listing_id"])) {
    echo json_encode(["success" => false, "message" => "Missing listing ID"]);
    exit;
}

$listingId = intval($_GET["listing_id"]);

$stmt = $conn->prepare("
    SELECT 
        bh.bid_amount,
        bh.bid_time,
        CONCAT(u.first_name, ' ', u.last_name) AS bidder
    FROM bid_history bh
    JOIN users u ON bh.user_idnum = u.user_idnum
    WHERE bh.listing_id = ?
    ORDER BY bh.bid_time DESC
");

$stmt->bind_param("i", $listingId);
$stmt->execute();

echo json_encode([
    "success" => true,
    "data" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
]);
