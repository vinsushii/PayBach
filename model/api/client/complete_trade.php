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
    
    // Get essential trade data for metrics
    $check_query = "
        SELECT 
            b.barter_id, 
            b.status, 
            b.listing_id,
            b.offered_item_name as seller_item_name,
            b.user_idnum as seller_id,
            b.max_additional_cash,
            b.exchange_method,
            bo.offerer_idnum as buyer_id,
            bo.offered_item_name as buyer_item_name,
            bo.additional_cash
        FROM barters b
        LEFT JOIN barter_offers bo ON b.barter_id = bo.barter_id AND bo.status = 'accepted'
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
    if (!$trade['buyer_id']) {
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
    
    // Check if barter_transactions table exists, create if not
    $check_table_query = "SHOW TABLES LIKE 'barter_transactions'";
    $table_result = $conn->query($check_table_query);
    
    if ($table_result->num_rows == 0) {
        // Create the simple metrics table if it doesn't exist
        $create_table_query = "
            CREATE TABLE IF NOT EXISTS `barter_transactions` (
                `id` int NOT NULL AUTO_INCREMENT,
                `barter_id` int NOT NULL,
                `listing_id` int NOT NULL,
                `seller_id` varchar(20) NOT NULL,
                `buyer_id` varchar(20) NOT NULL,
                `seller_item_name` varchar(100) NOT NULL,
                `buyer_item_name` varchar(100) NOT NULL,
                `additional_cash` decimal(10,2) DEFAULT '0.00',
                `exchange_method` varchar(50) DEFAULT NULL,
                `completed_date` datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `barter_id` (`barter_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        ";
        
        if (!$conn->query($create_table_query)) {
            throw new Exception("Failed to create barter_transactions table: " . $conn->error);
        }
    }
    
    // Insert into barter_transactions table (for admin metrics)
    $additional_cash = $trade['additional_cash'] ?? $trade['max_additional_cash'] ?? 0.00;
    
    $insert_barter_transaction_query = "
        INSERT INTO barter_transactions (
            barter_id,
            listing_id,
            seller_id,
            buyer_id,
            seller_item_name,
            buyer_item_name,
            additional_cash,
            exchange_method,
            completed_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
            completed_date = NOW()
    ";
    
    $insert_barter_transaction_stmt = $conn->prepare($insert_barter_transaction_query);
    if (!$insert_barter_transaction_stmt) {
        throw new Exception("Prepare failed for barter_transactions insert: " . $conn->error);
    }
    
    $insert_barter_transaction_stmt->bind_param(
        'iissssds',
        $barter_id,
        $trade['listing_id'],
        $trade['seller_id'],
        $trade['buyer_id'],
        $trade['seller_item_name'],
        $trade['buyer_item_name'],
        $additional_cash,
        $trade['exchange_method']
    );
    
    if (!$insert_barter_transaction_stmt->execute()) {
        throw new Exception("Failed to insert into barter_transactions: " . $insert_barter_transaction_stmt->error);
    }
    
    $barter_transaction_id = $insert_barter_transaction_stmt->insert_id;
    $insert_barter_transaction_stmt->close();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Trade marked as completed successfully',
        'metrics_recorded' => true
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    if (isset($conn)) {
        $conn->rollback();
    }
    
    error_log("Complete trade error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}
?>