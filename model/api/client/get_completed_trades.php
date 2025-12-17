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
            b.created_at,
            b.updated_at,
            b.status,  
            l.description as listing_description,
            li.name as listing_item_name,
            li.item_condition as listing_item_condition,
            bo.status as final_offer_status,
            bo.offered_item_name as accepted_offer_item,
            bo.offered_item_image as accepted_offer_image,  
            t.transaction_date as completed_date,
            GROUP_CONCAT(DISTINCT li_img.image_path) as images
        FROM barters b
        JOIN listings l ON b.listing_id = l.listing_id
        LEFT JOIN listing_items li ON l.listing_id = li.listing_id
        LEFT JOIN listing_images li_img ON l.listing_id = li_img.listing_id
        LEFT JOIN barter_offers bo ON b.barter_id = bo.barter_id 
            AND (bo.offerer_idnum = ? OR bo.status = 'accepted')
        LEFT JOIN transactions t ON b.listing_id = t.listing_id AND t.transaction_type = 'barter'
        WHERE l.listing_type = 'trade'
        AND (
            (b.user_idnum = ? AND b.status IN ('completed', 'canceled'))  
            OR
            (bo.offerer_idnum = ? AND bo.status IN ('accepted', 'rejected'))  
        )
        GROUP BY b.barter_id
        ORDER BY COALESCE(t.transaction_date, b.updated_at) DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sss', $user_idnum, $user_idnum, $user_idnum);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $trades = [];
    while ($row = $result->fetch_assoc()) {
        if ($row['images']) {
            $images = explode(',', $row['images']);
            $row['images'] = array_map(function($img) {
                $img = str_replace('../../../', '', $img);
                return '/PayBach/uploads/' . ltrim($img, '/');  // Add PayBach prefix
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
        
        // Set barter_status based on database status
        if ($row['status'] === 'canceled') {
            $row['barter_status'] = 'canceled';
        } elseif ($row['status'] === 'completed') {
            $row['barter_status'] = 'completed';
        } elseif ($row['final_offer_status'] === 'accepted') {
            $row['barter_status'] = 'accepted';
        } elseif ($row['final_offer_status'] === 'rejected') {
            $row['barter_status'] = 'rejected';
        } else {
            $row['barter_status'] = 'completed';  // default
        }
        
        $trades[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'trades' => $trades
    ]);
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>