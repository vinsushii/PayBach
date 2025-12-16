<?php
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
$barter_id = isset($_POST['barter_id']) ? trim($_POST['barter_id']) : null;

// Validate required fields
if (!$barter_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required field: barter_id']);
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
    
    // First, check if trade exists and user is the owner
    $check_query = "
        SELECT b.barter_id, b.status
        FROM barters b
        WHERE b.barter_id = ? AND b.user_idnum = ?
    ";
    
    $check_stmt = $conn->prepare($check_query);
    if (!$check_stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $check_stmt->bind_param('is', $barter_id, $user_idnum);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        throw new Exception("Trade not found or you are not the owner");
    }
    
    $trade = $check_result->fetch_assoc();
    $check_stmt->close();
    
    // Check if trade is already canceled or completed
    if ($trade['status'] === 'canceled') {
        throw new Exception("Trade is already canceled");
    }
    
    if ($trade['status'] === 'completed') {
        throw new Exception("Trade is already completed");
    }
    
    // Update the trade status to 'canceled' and set is_active = 0
    $update_trade_query = "UPDATE barters SET is_active = 0, status = 'canceled', updated_at = NOW() WHERE barter_id = ?";
    $update_trade_stmt = $conn->prepare($update_trade_query);
    $update_trade_stmt->bind_param('i', $barter_id);
    $update_trade_stmt->execute();
    $update_trade_stmt->close();
    
    // Reject all pending offers for this trade
    $reject_offers_query = "UPDATE barter_offers SET status = 'rejected' WHERE barter_id = ? AND status = 'pending'";
    $reject_offers_stmt = $conn->prepare($reject_offers_query);
    $reject_offers_stmt->bind_param('i', $barter_id);
    $reject_offers_stmt->execute();
    $reject_offers_stmt->close();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Trade canceled successfully'
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    if (isset($conn)) {
        $conn->rollback();
    }
    
    error_log("Cancel trade error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}