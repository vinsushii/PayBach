<?php
// trade_item.php
require_once __DIR__ . '/../../config/db_connect.php';
session_start();

header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_idnum'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated. Please login first.']);
    exit;
}

// Get request parameters
$barter_id = isset($_GET['barter_id']) ? $_GET['barter_id'] : (isset($_POST['barter_id']) ? $_POST['barter_id'] : null);
$listing_id = isset($_GET['listing_id']) ? $_GET['listing_id'] : (isset($_POST['listing_id']) ? $_POST['listing_id'] : null);

if (!$barter_id && !$listing_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing barter_id or listing_id']);
    exit;
}

$user_idnum = $_SESSION['user_idnum'];

try {
    $conn = get_db_connection();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    // Get trade details
    $query = "
        SELECT 
            b.barter_id,
            b.listing_id,
            b.user_idnum as owner_id,
            b.offered_item_name,
            b.offered_item_description,
            b.offered_item_condition,
            b.exchange_method,
            b.payment_method,
            b.max_additional_cash,
            b.trade_tags,
            b.created_at,
            b.updated_at,
            b.is_active,
            l.description as listing_description,
            li.name as listing_item_name,
            li.item_condition as listing_item_condition,
            u.first_name,
            u.last_name,
            u.email as owner_email,
            GROUP_CONCAT(DISTINCT li_img.image_path) as images,
            GROUP_CONCAT(DISTINCT li_img2.image_path) as listing_images,
            
            -- Check if user has made an offer
            EXISTS (
                SELECT 1 FROM barter_offers bo 
                WHERE bo.barter_id = b.barter_id 
                AND bo.offerer_idnum = ?
                AND bo.status IN ('pending', 'accepted')
            ) as has_user_offer,
            
            -- Get user's offer status if exists
            (
                SELECT bo.status 
                FROM barter_offers bo 
                WHERE bo.barter_id = b.barter_id 
                AND bo.offerer_idnum = ?
                ORDER BY bo.created_at DESC 
                LIMIT 1
            ) as user_offer_status,
            
            -- Check if there are any offers
            EXISTS (
                SELECT 1 FROM barter_offers bo 
                WHERE bo.barter_id = b.barter_id 
                AND bo.status IN ('pending')
            ) as has_offers,
            
            -- Check if there's an accepted offer
            EXISTS (
                SELECT 1 FROM barter_offers bo 
                WHERE bo.barter_id = b.barter_id 
                AND bo.status = 'accepted'
            ) as has_accepted_offer,
            
            -- Get count of offers
            (
                SELECT COUNT(*) 
                FROM barter_offers bo 
                WHERE bo.barter_id = b.barter_id 
                AND bo.status = 'pending'
            ) as offer_count
            
        FROM barters b
        JOIN listings l ON b.listing_id = l.listing_id
        LEFT JOIN listing_items li ON l.listing_id = li.listing_id
        LEFT JOIN listing_images li_img ON l.listing_id = li_img.listing_id
        LEFT JOIN listing_images li_img2 ON l.listing_id = li_img2.listing_id
        JOIN users u ON b.user_idnum = u.user_idnum
        WHERE l.listing_type = 'trade'
        AND " . ($barter_id ? "b.barter_id = ?" : "b.listing_id = ?") . "
        GROUP BY b.barter_id
    ";
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    if ($barter_id) {
        $stmt->bind_param('ssi', $user_idnum, $user_idnum, $barter_id);
    } else {
        $stmt->bind_param('ssi', $user_idnum, $user_idnum, $listing_id);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Trade not found']);
        exit;
    }
    
    $trade = $result->fetch_assoc();
    
    // Process images
    if ($trade['images']) {
        $images = explode(',', $trade['images']);
        $trade['images'] = array_map(function($img) {
            $img = str_replace('../../../', '', $img);
            return '/uploads/' . ltrim($img, '/');
        }, $images);
    } else {
        $trade['images'] = [];
    }
    
    if ($trade['listing_images']) {
        $listing_images = explode(',', $trade['listing_images']);
        $trade['listing_images'] = array_map(function($img) {
            $img = str_replace('../../../', '', $img);
            return '/uploads/' . ltrim($img, '/');
        }, $listing_images);
    } else {
        $trade['listing_images'] = [];
    }
    
    // Determine user role
    if ($trade['owner_id'] === $user_idnum) {
        $trade['user_role'] = 'owner';
    } elseif ($trade['has_user_offer']) {
        $trade['user_role'] = 'offerer';
    } else {
        $trade['user_role'] = 'viewer';
    }
    
    // Determine barter status
    if ($trade['is_active'] == 0) {
        $trade['barter_status'] = 'completed';
    } elseif ($trade['has_accepted_offer']) {
        $trade['barter_status'] = 'accepted';
    } elseif ($trade['has_offers']) {
        $trade['barter_status'] = 'has_offers';
    } else {
        $trade['barter_status'] = 'active';
    }
    
    // Format owner name
    $trade['owner_name'] = trim($trade['first_name'] . ' ' . $trade['last_name']);
    
    // Get offers if user is owner
    $offers = [];
    if ($trade['user_role'] === 'owner') {
        $offers_query = "
            SELECT 
                bo.offer_id,
                bo.offered_item_name,
                bo.item_condition as offered_item_condition,
                bo.offered_item_description as description,
                bo.additional_cash,
                bo.status,
                bo.created_at,
                bo.notes,
                u.first_name,
                u.last_name,
                u.email as offerer_email
            FROM barter_offers bo
            JOIN users u ON bo.offerer_idnum = u.user_idnum
            WHERE bo.barter_id = ?
            ORDER BY bo.created_at DESC
        ";
        
        $offers_stmt = $conn->prepare($offers_query);
        $offers_stmt->bind_param('i', $trade['barter_id']);
        $offers_stmt->execute();
        $offers_result = $offers_stmt->get_result();
        
        while ($offer = $offers_result->fetch_assoc()) {
            $offer['offerer_name'] = trim($offer['first_name'] . ' ' . $offer['last_name']);
            $offers[] = $offer;
        }
        $offers_stmt->close();
    }
    
    echo json_encode([
        'success' => true,
        'trade' => $trade,
        'offers' => $offers
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