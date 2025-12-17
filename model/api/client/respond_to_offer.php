<?php
// respond_to_offer.php - Handle accepting/rejecting offers
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/db_connect.php';
session_start();

header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_idnum'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated. Please login first.']);
    exit;
}

// Check if form was submitted via POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get form data
$offer_id = isset($_POST['offer_id']) ? trim($_POST['offer_id']) : null;
$action = isset($_POST['action']) ? trim($_POST['action']) : null;

// Validate required fields
if (!$offer_id || !$action) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields: offer_id and action are required']);
    exit;
}

// Validate action
if (!in_array($action, ['accept', 'reject'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid action. Must be "accept" or "reject"']);
    exit;
}

$user_idnum = $_SESSION['user_idnum'];

try {
    $conn = get_db_connection();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    // First, get offer details and verify ownership
    $check_query = "
        SELECT bo.*, b.user_idnum as trade_owner_id, b.listing_id, b.requested_items_text
        FROM barter_offers bo
        JOIN barters b ON bo.barter_id = b.barter_id
        WHERE bo.offer_id = ?
    ";
    
    $check_stmt = $conn->prepare($check_query);
    if (!$check_stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $check_stmt->bind_param('i', $offer_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        throw new Exception("Offer not found");
    }
    
    $offer_data = $check_result->fetch_assoc();
    $check_stmt->close();
    
    // Check if current user is the trade owner
    if ($offer_data['trade_owner_id'] != $user_idnum) {
        throw new Exception("You are not authorized to respond to this offer");
    }
    
    // Check if offer is still pending
    if ($offer_data['status'] != 'pending') {
        throw new Exception("Offer is no longer pending");
    }
    
if ($action === 'accept') {
    // When accepting an offer:
    
    // Update this offer to accepted
    $update_offer_query = "UPDATE barter_offers SET status = 'accepted' WHERE offer_id = ?";
    $update_offer_stmt = $conn->prepare($update_offer_query);
    $update_offer_stmt->bind_param('i', $offer_id);
    if (!$update_offer_stmt->execute()) {
        throw new Exception("Failed to accept offer: " . $update_offer_stmt->error);
    }
    $update_offer_stmt->close();
    
    // Reject all other offers for this barter
    $reject_others_query = "UPDATE barter_offers SET status = 'rejected' WHERE barter_id = ? AND offer_id != ? AND status = 'pending'";
    $reject_others_stmt = $conn->prepare($reject_others_query);
    $reject_others_stmt->bind_param('ii', $offer_data['barter_id'], $offer_id);
    if (!$reject_others_stmt->execute()) {
        throw new Exception("Failed to reject other offers: " . $reject_others_stmt->error);
    }
    $reject_others_stmt->close();
    
    // Update barter status to 'accepted'
    $update_barter_status_query = "
        UPDATE barters 
        SET status = 'accepted',
            updated_at = NOW()
        WHERE barter_id = ?
    ";
    $update_barter_status_stmt = $conn->prepare($update_barter_status_query);
    $update_barter_status_stmt->bind_param('i', $offer_data['barter_id']);
    if (!$update_barter_status_stmt->execute()) {
        throw new Exception("Failed to update barter status: " . $update_barter_status_stmt->error);
    }
    $update_barter_status_stmt->close();
    
} else if ($action === 'reject') {
    // When rejecting an offer, just update its status
    $update_offer_query = "UPDATE barter_offers SET status = 'rejected' WHERE offer_id = ?";
    $update_offer_stmt = $conn->prepare($update_offer_query);
    $update_offer_stmt->bind_param('i', $offer_id);
    if (!$update_offer_stmt->execute()) {
        throw new Exception("Failed to reject offer: " . $update_offer_stmt->error);
    }
    $update_offer_stmt->close();
    
    // Check if there are any pending offers left
    $check_pending_query = "
        SELECT COUNT(*) as pending_count 
        FROM barter_offers 
        WHERE barter_id = ? 
        AND status = 'pending'
    ";
    $check_pending_stmt = $conn->prepare($check_pending_query);
    $check_pending_stmt->bind_param('i', $offer_data['barter_id']);
    $check_pending_stmt->execute();
    $pending_result = $check_pending_stmt->get_result();
    $pending_data = $pending_result->fetch_assoc();
    $check_pending_stmt->close();
    
    // If no pending offers left, update barter status
    if ($pending_data['pending_count'] == 0) {
        $update_barter_no_offers_query = "
            UPDATE barters 
            SET status = 'active',
                updated_at = NOW()
            WHERE barter_id = ?
            AND status != 'accepted'
        ";
        $update_barter_no_offers_stmt = $conn->prepare($update_barter_no_offers_query);
        $update_barter_no_offers_stmt->bind_param('i', $offer_data['barter_id']);
        $update_barter_no_offers_stmt->execute();
        $update_barter_no_offers_stmt->close();
    }
}
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "Offer {$action}ed successfully"
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    if (isset($conn)) {
        $conn->rollback();
    }
    
    error_log("Respond to offer error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}