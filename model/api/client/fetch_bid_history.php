<?php
session_start();
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/db_connect.php";

if (!isset($_SESSION['user_idnum'])) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

if (!isset($_GET["listing_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing listing ID"
    ]);
    exit;
}

$listingId = (int) $_GET["listing_id"];
$ownerId  = $_SESSION['user_idnum'];

/* Verify ownership */
$stmt = $conn->prepare("
    SELECT listing_id
    FROM listings
    WHERE listing_id = ?
      AND user_idnum = ?
");
$stmt->bind_param("is", $listingId, $ownerId);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "You are not allowed to view this history"
    ]);
    exit;
}

/* Fetch bid history */
$stmt = $conn->prepare("
    SELECT b.listing_id, b.bid_amount, b.bid_time, u.first_name, u.last_name
    FROM bid_history b
    JOIN users u ON b.user_idnum = u.user_idnum
    WHERE b.listing_id = ?
    ORDER BY b.bid_time DESC
");
$stmt->bind_param("i", $listingId);
$stmt->execute();

$data = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

foreach ($data as &$bid) {
    $bid['bidder'] = $bid['first_name'] . ' ' . $bid['last_name'];
    unset($bid['first_name'], $bid['last_name']);
}

echo json_encode([
    "success" => true,
    "data" => $data
]);
