<?php
session_start();
require_once __DIR__ . '/../../config/db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_idnum'])) {
    echo json_encode(["success" => false]);
    exit;
}

$user_id = $_SESSION['user_idnum'];
$conn = get_db_connection();

$stmt = $conn->prepare("
    SELECT n.notification_id,
           n.message,
           n.listing_id,
           n.is_read,
           n.created_at,
           li.name AS item_name
    FROM notifications n
    JOIN listing_items li ON li.listing_id = n.listing_id
    WHERE n.receiver_idnum = ?
    ORDER BY n.created_at DESC
");
$stmt->bind_param("s", $user_id);
$stmt->execute();

echo json_encode([
    "success" => true,
    "data" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
]);
