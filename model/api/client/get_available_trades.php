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
            l.description as listing_description,
            li.name as listing_item_name,
            li.item_condition as listing_item_condition,
            u.user_idnum as owner_id,
            u.first_name,
            u.last_name,
            GROUP_CONCAT(DISTINCT li_img.image_path) as images
        FROM barters b
        JOIN listings l ON b.listing_id = l.listing_id
        LEFT JOIN listing_items li ON l.listing_id = li.listing_id
        LEFT JOIN listing_images li_img ON l.listing_id = li_img.listing_id
        JOIN users u ON b.user_idnum = u.user_idnum
        WHERE l.listing_type = 'trade'
        AND b.is_active = 1
        AND b.user_idnum != ?
        AND NOT EXISTS (
            SELECT 1 FROM barter_offers bo 
            WHERE bo.barter_id = b.barter_id 
            AND bo.offerer_idnum = ?
            AND bo.status IN ('pending', 'accepted')
        )
        GROUP BY b.barter_id
        ORDER BY b.created_at DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ss', $user_idnum, $user_idnum);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $trades = [];
    while ($row = $result->fetch_assoc()) {
        if ($row['images']) {
            $images = explode(',', $row['images']);
            $row['images'] = array_map(function($img) {
                $img = str_replace('../../../', '', $img);
                return '/uploads/' . ltrim($img, '/');
            }, $images);
        } else {
            $row['images'] = [];
        }
        
        $row['item_name'] = $row['offered_item_name'];
        $row['description'] = $row['offered_item_description'];
        $row['owner_name'] = trim($row['first_name'] . ' ' . $row['last_name']);
        $row['barter_status'] = 'available';
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