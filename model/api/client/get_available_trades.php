<?php
require_once __DIR__ . '/../../config/db_connect.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_idnum'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated.']);
    exit;
}

$user_idnum = $_SESSION['user_idnum'];

try {
    $conn = get_db_connection();
    
    // FIXED: Changed the condition to only exclude users with pending or accepted offers
    // Users with rejected offers should still see the trade
    $query = "
    SELECT DISTINCT
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
        b.status,
        u.user_idnum as owner_id,
        u.first_name,
        u.last_name,
        u.email as owner_email,
        (
            SELECT GROUP_CONCAT(image_path SEPARATOR ',')
            FROM listing_images li_img
            WHERE li_img.listing_id = b.listing_id
            LIMIT 1
        ) as main_image,
        (
            SELECT bo.status
            FROM barter_offers bo
            WHERE bo.barter_id = b.barter_id
            AND bo.offerer_idnum = ?
            ORDER BY bo.created_at DESC
            LIMIT 1
        ) as user_offer_status
    FROM barters b
    JOIN users u ON b.user_idnum = u.user_idnum
    WHERE b.is_active = 1
    AND b.status = 'active'
    AND b.user_idnum != ?
    AND NOT EXISTS (
        SELECT 1 FROM barter_offers bo 
        WHERE bo.barter_id = b.barter_id 
        AND bo.offerer_idnum = ?
        AND bo.status IN ('pending', 'accepted')  
    )
    ORDER BY b.created_at DESC
    LIMIT 20
    ";
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param('sss', $user_idnum, $user_idnum, $user_idnum);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $trades = [];
    while ($row = $result->fetch_assoc()) {
        // Process image
        $row['images'] = [];
        if (!empty($row['main_image'])) {
            $imagePath = str_replace('../../../', '', $row['main_image']);
            $row['images'] = ['/PayBach/uploads/' . basename($imagePath)];
        } else {
            $row['images'] = ['/PayBach/images/default-item.png'];
        }
        
        $row['item_name'] = $row['offered_item_name'];
        $row['description'] = $row['offered_item_description'];
        $row['owner_name'] = trim($row['first_name'] . ' ' . $row['last_name']);
        $row['barter_status'] = 'available';
        
        // Add user_offer_status for frontend to know if user had a previous rejected offer
        if ($row['user_offer_status'] === 'rejected') {
            $row['has_rejected_offer'] = true;
        } else {
            $row['has_rejected_offer'] = false;
        }
        
        $trades[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'trades' => $trades,
        'count' => count($trades)
    ]);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Available trades error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Failed to load trades: ' . $e->getMessage()
    ]);
}
?>