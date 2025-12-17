<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db_connect.php';

if (!isset($_SESSION['user_idnum'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit;
}

$user_idnum = $_SESSION['user_idnum'];
$listing_id = (int)($_POST['listing_id'] ?? 0);
$bid_amount = (float)($_POST['bid_amount'] ?? 0);

if ($listing_id <= 0 || $bid_amount <= 0) {
    echo json_encode(["success" => false, "error" => "Invalid data"]);
    exit;
}

$conn = get_db_connection();
$conn->begin_transaction();

try {
    /* Lock auction row */
    $stmt = $conn->prepare("
        SELECT b.current_amount, l.user_idnum AS owner_id
        FROM bids b
        JOIN listings l ON l.listing_id = b.listing_id
        WHERE b.listing_id = ?
        FOR UPDATE
    ");
    $stmt->bind_param("i", $listing_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) {
        throw new Exception("Auction not found");
    }

    if ($row['owner_id'] === $user_idnum) {
        throw new Exception("You cannot bid on your own item");
    }

    if ($bid_amount <= $row['current_amount']) {
        throw new Exception("Bid must be higher than current amount");
    }

    /* Insert bid history */
    $stmt = $conn->prepare("
        INSERT INTO bid_history (listing_id, user_idnum, bid_amount, bid_time)
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->bind_param("isd", $listing_id, $user_idnum, $bid_amount);
    $stmt->execute();
    $stmt->close();

    /* Update current bid */
    $stmt = $conn->prepare("
        UPDATE bids
        SET current_amount = ?,
            current_highest_bidder = ?,
            bid_datetime = NOW()
        WHERE listing_id = ?
    ");
    $stmt->bind_param("dsi", $bid_amount, $user_idnum, $listing_id);
    $stmt->execute();
    $stmt->close();

    /* Notification */
    $message = $user_idnum . " placed a new bid on your item.";
    $stmt = $conn->prepare("
            INSERT INTO notifications
        (receiver_idnum, sender_idnum, listing_id, type, message)
        VALUES (?, ?, ?, 'bid', ?)
    ");
    $stmt->bind_param(
        "ssis",
        $row['owner_id'], //item owner
        $user_idnum, //bidder
        $listing_id,
        $message
    );
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "current_amount" => $bid_amount
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
