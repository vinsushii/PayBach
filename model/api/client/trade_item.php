<?php
require_once __DIR__ . '/../../config/db_connect.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_idnum'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated.']);
    exit;
}

$barter_id = isset($_GET['barter_id']) ? intval($_GET['barter_id']) : 0;
$current_user_id = $_SESSION['user_idnum'];

if (!$barter_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing barter_id']);
    exit;
}

try {
    $conn = get_db_connection();
    
    // Get the basic trade information
    $query = "
        SELECT 
            b.*,
            l.description as listing_description,
            li.name as listing_item_name,
            li.item_condition as listing_item_condition,
            u.user_idnum as owner_idnum,
            CONCAT(u.first_name, ' ', u.last_name) as owner_name,
            u.email as owner_email,
            GROUP_CONCAT(DISTINCT li_img.image_path) as offered_images,
            GROUP_CONCAT(DISTINCT li_img2.image_path) as listing_images,
            (
                SELECT COUNT(*) 
                FROM barter_offers bo 
                WHERE bo.barter_id = b.barter_id 
                AND bo.status = 'pending'
            ) as offer_count,
            (
                SELECT COUNT(*) 
                FROM barter_offers bo 
                WHERE bo.barter_id = b.barter_id 
                AND bo.status = 'accepted'
            ) as has_accepted_offer
        FROM barters b
        JOIN listings l ON b.listing_id = l.listing_id
        JOIN users u ON b.user_idnum = u.user_idnum
        LEFT JOIN listing_items li ON l.listing_id = li.listing_id
        LEFT JOIN listing_images li_img ON b.listing_id = li_img.listing_id
        LEFT JOIN listing_images li_img2 ON l.listing_id = li_img2.listing_id
        WHERE b.barter_id = ?
        GROUP BY b.barter_id
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $barter_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Trade not found");
    }
    
    $trade = $result->fetch_assoc();
    
    // Process images
    if ($trade['offered_images']) {
        $trade['offered_images'] = array_filter(explode(',', $trade['offered_images']));
    } else {
        $trade['offered_images'] = [];
    }
    
    if ($trade['listing_images']) {
        $trade['listing_images'] = array_filter(explode(',', $trade['listing_images']));
    } else {
        $trade['listing_images'] = [];
    }
    
    // Check if current user has made an offer to this trade
    $user_offer_query = "
        SELECT 
            bo.*,
            CONCAT(u.first_name, ' ', u.last_name) as offerer_name,
            u.email as offerer_email
        FROM barter_offers bo
        JOIN users u ON bo.offerer_idnum = u.user_idnum
        WHERE bo.barter_id = ? 
        AND bo.offerer_idnum = ?
        ORDER BY bo.created_at DESC
        LIMIT 1
    ";
    
    $user_offer_stmt = $conn->prepare($user_offer_query);
    $user_offer_stmt->bind_param('is', $barter_id, $current_user_id);
    $user_offer_stmt->execute();
    $user_offer_result = $user_offer_stmt->get_result();
    
    $user_has_offer = $user_offer_result->num_rows > 0;
    $user_offer = $user_has_offer ? $user_offer_result->fetch_assoc() : null;
    
    // Get all offers for this trade
    $all_offers = [];
    $rejected_offers = [];
    $filtered_offers = [];
    
    if ($trade['owner_idnum'] == $current_user_id) {
        // Owner: get all offers for viewing in modal
        $all_offers_query = "
            SELECT 
                bo.*,
                CONCAT(u.first_name, ' ', u.last_name) as offerer_name,
                u.email as offerer_email
            FROM barter_offers bo
            JOIN users u ON bo.offerer_idnum = u.user_idnum
            WHERE bo.barter_id = ?
            ORDER BY 
                CASE WHEN bo.status = 'accepted' THEN 1 
                     WHEN bo.status = 'pending' THEN 2
                     ELSE 3 END,
                bo.created_at DESC
        ";
        
        $offers_stmt = $conn->prepare($all_offers_query);
        $offers_stmt->bind_param('i', $barter_id);
        $offers_stmt->execute();
        $offers_result = $offers_stmt->get_result();
        
        while ($row = $offers_result->fetch_assoc()) {
            $all_offers[] = $row;
            // Separate rejected offers for owner's sidebar filtering
            if ($row['status'] === 'rejected') {
                $rejected_offers[] = $row;
            }
        }
        
        // For owner's sidebar, filter out rejected offers
        $filtered_offers = array_filter($all_offers, function($offer) {
            return $offer['status'] !== 'rejected';
        });
        $filtered_offers = array_values($filtered_offers); // Reset array keys
        
    } else if ($user_has_offer) {
        // Offerer: show only their own offer (including rejected)
        $all_offers = [$user_offer]; 
        $filtered_offers = [$user_offer];
    }
    
    // Determine user role and prepare response data
    $user_role = 'viewer';
    $response_trade = null;
    
    if ($user_has_offer) {
        $user_role = 'offerer';
        
        // For offerer perspective: flip the trade
        $response_trade = [
            'barter_id' => $trade['barter_id'],
            'listing_id' => $trade['listing_id'],
            'offered_item_name' => $user_offer['offered_item_name'] ?? 'Your Offer',
            'offered_item_description' => $user_offer['offered_item_description'] ?? $user_offer['description'] ?? '',
            'offered_item_condition' => $user_offer['item_condition'] ?? 'N/A',
            'offered_images' => $user_offer['offered_item_image'] ? [$user_offer['offered_item_image']] : [],
            
            // What the offerer is looking for
            'listing_item_name' => $trade['offered_item_name'],
            'listing_description' => $trade['offered_item_description'],
            'listing_item_condition' => $trade['offered_item_condition'],
            'listing_images' => $trade['offered_images'],
            'requested_items_text' => $trade['offered_item_name'],
            
            // Trade details (same)
            'exchange_method' => $trade['exchange_method'],
            'payment_method' => $trade['payment_method'],
            'max_additional_cash' => $user_offer['additional_cash'] ?? 0,
            'trade_tags' => $trade['trade_tags'],
            'created_at' => $trade['created_at'],
            'updated_at' => $trade['updated_at'],
            'is_active' => $trade['is_active'],
            'status' => $trade['status'],
            'barter_status' => $trade['barter_status'] ?? 'active',
            
            // Owner info 
            'owner_name' => $trade['owner_name'],
            'owner_email' => $trade['owner_email'],
            
            // Offer info
            'offer_count' => $trade['offer_count'],
            'has_accepted_offer' => $trade['has_accepted_offer'] > 0,
            'accepted_offer_image' => $trade['accepted_offer_image'] ?? null,
            
            // Accepted by info 
            'accepted_by_name' => null,
            'accepted_by_email' => null,
            
            // Include user_offer_status in the trade object
            'user_offer_status' => $user_offer['status'] ?? 'pending'
        ];
        
    }  else if ($trade['owner_idnum'] == $current_user_id) {
    $user_role = 'owner';
    
    // For owner: show original trade with requested_items_text
    $response_trade = $trade;
    
    // Ensure we have the correct requested item text
    if (empty($response_trade['requested_items_text']) && !empty($response_trade['listing_item_name'])) {
        $response_trade['requested_items_text'] = $response_trade['listing_description'] ?? 'Trade Item';
    }
    
    // rejected offers information
    $response_trade['rejected_offers_count'] = count($rejected_offers);
    $response_trade['has_rejected_offers'] = !empty($rejected_offers);
    
    // Include user_offer_status
    $response_trade['user_offer_status'] = null;
    
    } else {
        $user_role = 'viewer';
        
        // For viewer: show original trade
        $response_trade = $trade;
        
        // Ensure we have the correct requested item text
        if (empty($response_trade['requested_items_text']) && !empty($response_trade['listing_item_name'])) {
            $response_trade['requested_items_text'] = $response_trade['listing_description'] ?? 'Trade Item';
        }
        
        // Include user_offer_status
        $response_trade['user_offer_status'] = null;
    }
    
    // Build the final response
    $response = [
        'success' => true,
        'current_user_id' => $current_user_id,
        'user_role' => $user_role,
        'user_offer_status' => $user_has_offer ? ($user_offer['status'] ?? 'pending') : null,
        'trade' => $response_trade,
        'offers' => $filtered_offers, // Main offers list 
        'all_offers' => $all_offers, // All offers including rejected (for owner's modal)
    ];
    
    // Add rejected offers for owner
    if ($user_role === 'owner') {
        $response['rejected_offers'] = $rejected_offers;
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Trade API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>