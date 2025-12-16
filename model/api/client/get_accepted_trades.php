<?php
require_once __DIR__ . '/../../config/db_connect.php';

session_start();

header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_idnum'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated. Please login first.']);
    exit;
}

$user_idnum = $_SESSION['user_idnum'];

try {
    // Get database connection
    $conn = get_db_connection();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    // Get accepted trades (barters) created by the current user
    $query = "
        SELECT 
            b.barter_id,
            b.listing_id,
            b.offered_item_name,
            b.offered_item_description,
            b.offered_item_condition,
            b.exchange_method,
            b.payment_method,
            b.max_additional_cash,
            b.trade_tags,
            b.created_at,
            b.updated_at,
            b.status,
            l.description as listing_description,
            li.name as listing_item_name,
            li.item_condition as listing_item_condition,
            bo.offered_item_name as accepted_item_name,
            bo.offered_item_image as accepted_item_image,
            GROUP_CONCAT(li_img.image_path) as images
        FROM barters b
        JOIN listings l ON b.listing_id = l.listing_id
        LEFT JOIN listing_items li ON l.listing_id = li.listing_id
        LEFT JOIN listing_images li_img ON l.listing_id = li_img.listing_id
        LEFT JOIN barter_offers bo ON b.barter_id = bo.barter_id AND bo.status = 'accepted'
        WHERE b.user_idnum = ?
        AND l.listing_type = 'trade'
        AND b.status = 'accepted'  
        AND b.is_active = 1
        GROUP BY b.barter_id
        ORDER BY b.updated_at DESC
    ";
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param('s', $user_idnum);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $trades = [];
    while ($row = $result->fetch_assoc()) {
        // Process images
        if ($row['images']) {
            $images = explode(',', $row['images']);
            $row['images'] = array_map(function($img) {
                $img = str_replace('../../../', '', $img);
                return '/PayBach/uploads/' . ltrim($img, '/');
            }, $images);
        } else {
            $row['images'] = [];
        }
        
        // Process accepted item image
        if ($row['accepted_item_image']) {
            $row['accepted_item_image'] = '/PayBach/' . ltrim($row['accepted_item_image'], '/');
        }
        
        $row['item_name'] = $row['offered_item_name'];
        $row['description'] = $row['offered_item_description'];
        $row['barter_status'] = 'accepted';
        
        $trades[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'trades' => $trades
    ]);
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
}
?>