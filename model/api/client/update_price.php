<?php
require_once("../database/db_connect.php");
header("Content-Type: application/json");

if (!isset($_POST["id"]) || !isset($_POST["price"])) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

$id = $_POST["id"];
$price = $_POST["price"];

if (!ctype_digit($id)) {
    echo json_encode(["success" => false, "message" => "Invalid ID"]);
    exit;
}

if (!is_numeric($price)) {
    echo json_encode(["success" => false, "message" => "Invalid price"]);
    exit;
}

$id = intval($id);
$price = floatval($price);

// Get current bid
$stmt = $conn->prepare("SELECT current_amount, start_bid FROM bids WHERE transaction_id = ? LIMIT 1");
$stmt->bind_param("i", $id);
$stmt->execute();
$bidData = $stmt->get_result()->fetch_assoc();

$current = $bidData["current_amount"] ?? $bidData["start_bid"] ?? 0;

if ($price <= $current) {
    echo json_encode(["success" => false, "message" => "Bid must be higher"]);
    exit;
}

// Update
$stmt2 = $conn->prepare("UPDATE bids SET current_amount = ?, bid_datetime = NOW() WHERE transaction_id = ?");
$stmt2->bind_param("di", $price, $id);

if ($stmt2->execute()) {
    echo json_encode(["success" => true, "newPrice" => $price]);
} else {
    echo json_encode(["success" => false, "message" => "Database error"]);
}
