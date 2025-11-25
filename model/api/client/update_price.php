<?php
require_once("db_connect.php");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["listing_id"]) || !isset($data["new_price"])) {
    echo json_encode(["success" => false]);
    exit;
}

$id = $data["listing_id"];
$new = $data["new_price"];

// update bids.current_amount
$stmt = $conn->prepare("UPDATE bids SET current_amount = ? WHERE transaction_id = ?");
$ok = $stmt->execute([$new, $id]);

echo json_encode(["success" => $ok]);
