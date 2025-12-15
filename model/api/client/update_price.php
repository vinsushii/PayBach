<?php
header("Content-Type: application/json");
session_start();
require_once __DIR__ . "/../../config/db_connect.php";

if (!isset($_SESSION["user_idnum"])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

if (!isset($_POST["id"], $_POST["price"])) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

$listingId = intval($_POST["id"]);
$bidAmount = floatval($_POST["price"]);
$userId    = $_SESSION["user_idnum"];

if ($bidAmount <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid bid amount"]);
    exit;
}

$conn->begin_transaction();

try {
    // Check ownership
    $stmtOwner = $conn->prepare("
        SELECT user_idnum 
        FROM listings 
        WHERE listing_id = ?
    ");
    $stmtOwner->bind_param("i", $listingId);
    $stmtOwner->execute();
    $owner = $stmtOwner->get_result()->fetch_assoc();

    if ($owner && $owner["user_idnum"] === $userId) {
        throw new Exception("You cannot bid on your own listing");
    }

    // Lock auction row
    $stmt = $conn->prepare("
        SELECT current_amount, bid_increment, bid_status
        FROM bids
        WHERE listing_id = ?
        FOR UPDATE
    ");
    $stmt->bind_param("i", $listingId);
    $stmt->execute();
    $auction = $stmt->get_result()->fetch_assoc();

    if (!$auction || $auction["bid_status"] !== "ACTIVE") {
        throw new Exception("Auction is closed");
    }

    $minBid = $auction["current_amount"] + $auction["bid_increment"];
    if ($bidAmount < $minBid) {
        throw new Exception("Bid must be at least ₱" . number_format($minBid, 2));
    }

    // Insert bid history
    $stmtHist = $conn->prepare("
        INSERT INTO bid_history (listing_id, user_idnum, bid_amount)
        VALUES (?, ?, ?)
    ");
    $stmtHist->bind_param("isd", $listingId, $userId, $bidAmount);
    $stmtHist->execute();

    // Update auction state
    $stmtUpdate = $conn->prepare("
        UPDATE bids
        SET current_amount = ?,
            current_highest_bidder = ?,
            bid_datetime = NOW()
        WHERE listing_id = ?
    ");
    $stmtUpdate->bind_param("dsi", $bidAmount, $userId, $listingId);
    $stmtUpdate->execute();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "newPrice" => $bidAmount
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
