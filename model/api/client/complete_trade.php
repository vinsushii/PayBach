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
    
    // First, check if trade exists and user is the owner
    $check_query = "
        SELECT b.barter_id, b.status, 
               EXISTS (
                   SELECT 1 FROM barter_offers bo 
                   WHERE bo.barter_id = b.barter_id AND bo.status = 'accepted'
               ) as has_accepted_offer
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
    
    // Check if trade is already completed
    if ($trade['status'] === 'completed') {
        throw new Exception("Trade is already completed");
    }
    
    // Check if trade is canceled
    if ($trade['status'] === 'canceled') {
        throw new Exception("Cannot complete a canceled trade");
    }
    
    // Check if trade has an accepted offer
    if ($trade['has_accepted_offer'] == 0) {
        throw new Exception("Cannot complete trade without an accepted offer");
    }
    
    // Update the trade to completed
    $update_trade_query = "UPDATE barters SET is_active = 0, status = 'completed', updated_at = NOW() WHERE barter_id = ?";
    $update_trade_stmt = $conn->prepare($update_trade_query);
    $update_trade_stmt->bind_param('i', $barter_id);
    
    if (!$update_trade_stmt->execute()) {
        throw new Exception("Failed to update trade: " . $update_trade_stmt->error);
    }
    
    $update_trade_stmt->close();
    $conn->close();
    
    echo json_encode([
        'success' => true,
        'message' => 'Trade marked as completed successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Complete trade error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}