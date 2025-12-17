<?php
require_once __DIR__ . '/../../config/db_connect.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_idnum'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated.']);
    exit;
}

$user_idnum = $_SESSION['user_idnum'];

try {
    $conn = get_db_connection();
    
    // Get completed trades for the current user
    // This includes trades where user is owner and trade is completed/canceled
    // OR where user made an accepted/rejected offer
    
    $query = "
        -- Get trades where user is owner and trade is completed/canceled
        SELECT 
            b.barter_id,
            b.listing_id,
            b.offered_item_name,
            b.offered_item_description,
            b.offered_item_condition,
            b.exchange_method,
            b.payment_method,
            b.max_additional_cash,
            b.created_at,
            b.updated_at,
            b.status,
            l.description as listing_description,
            li.name as listing_item_name,
            li.item_condition as listing_item_condition,
            'owner' as user_role,
            NULL as offer_status,
            NULL as accepted_offer_item,
            NULL as accepted_offer_image,
            bt.completed_date,
            GROUP_CONCAT(DISTINCT li_img.image_path) as images,
            NULL as offerer_name,
            NULL as offerer_email
        FROM barters b
        JOIN listings l ON b.listing_id = l.listing_id
        LEFT JOIN listing_items li ON l.listing_id = li.listing_id
        LEFT JOIN listing_images li_img ON l.listing_id = li_img.listing_id
        LEFT JOIN barter_transactions bt ON b.barter_id = bt.barter_id
        WHERE l.listing_type = 'trade'
        AND b.user_idnum = ?
        AND b.status IN ('completed', 'canceled')
        GROUP BY b.barter_id
        
        UNION ALL
        
        -- Get trades where user made offers that were accepted/rejected
        SELECT 
            b.barter_id,
            b.listing_id,
            b.offered_item_name,
            b.offered_item_description,
            b.offered_item_condition,
            b.exchange_method,
            b.payment_method,
            b.max_additional_cash,
            b.created_at,
            b.updated_at,
            b.status,
            l.description as listing_description,
            li.name as listing_item_name,
            li.item_condition as listing_item_condition,
            'offerer' as user_role,
            bo.status as offer_status,
            bo.offered_item_name as accepted_offer_item,
            bo.offered_item_image as accepted_offer_image,
            bt.completed_date,
            GROUP_CONCAT(DISTINCT li_img.image_path) as images,
            CONCAT(u.first_name, ' ', u.last_name) as offerer_name,
            u.email as offerer_email
        FROM barter_offers bo
        JOIN barters b ON bo.barter_id = b.barter_id
        JOIN listings l ON b.listing_id = l.listing_id
        JOIN users u ON b.user_idnum = u.user_idnum
        LEFT JOIN listing_items li ON l.listing_id = li.listing_id
        LEFT JOIN listing_images li_img ON l.listing_id = li_img.listing_id
        LEFT JOIN barter_transactions bt ON b.barter_id = bt.barter_id
        WHERE l.listing_type = 'trade'
        AND bo.offerer_idnum = ?
        AND bo.status IN ('accepted', 'rejected')
        GROUP BY b.barter_id, bo.offer_id
        
        ORDER BY completed_date DESC, updated_at DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ss', $user_idnum, $user_idnum);
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
        
        // Process accepted offer image if exists
        if ($row['accepted_offer_image']) {
            $row['accepted_offer_image'] = '/PayBach/' . ltrim($row['accepted_offer_image'], '/');
        }
        
        $row['item_name'] = $row['offered_item_name'];
        $row['description'] = $row['offered_item_description'];
        
        // Determine barter status
        if ($row['status'] === 'canceled') {
            $row['barter_status'] = 'canceled';
        } elseif ($row['status'] === 'completed') {
            $row['barter_status'] = 'completed';
        } elseif ($row['offer_status'] === 'accepted') {
            $row['barter_status'] = 'accepted';
        } elseif ($row['offer_status'] === 'rejected') {
            $row['barter_status'] = 'rejected';
        } else {
            $row['barter_status'] = 'completed';
        }
        
        $trades[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'trades' => $trades
    ]);
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("Completed trades error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load completed trades: ' . $e->getMessage()
    ]);
}
?>