<?php

ob_start(); // Start output buffering

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/db_connect.php';
session_start();

header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_idnum'])) {
    ob_end_clean();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated. Please login first.']);
    exit;
}

// Get request parameters
$barter_id = isset($_GET['barter_id']) ? trim($_GET['barter_id']) : null;

if (!$barter_id) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing barter_id parameter']);
    exit;
}

$user_idnum = $_SESSION['user_idnum'];

try {
    $conn = get_db_connection();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    // Check if barter_id is numeric
    if (!is_numeric($barter_id)) {
        throw new Exception("Invalid barter_id: must be numeric");
    }
    
    $barter_id_int = (int)$barter_id;
    
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
            b.requested_items_text,
            b.created_at,
            b.updated_at,
            b.is_active,
            b.status,  
            l.description as listing_description,
            u.first_name,
            u.last_name,
            u.email as owner_email,
            li.name as listing_item_name,
            li.item_condition as listing_item_condition
        FROM barters b
        JOIN listings l ON b.listing_id = l.listing_id
        JOIN users u ON b.user_idnum = u.user_idnum
        LEFT JOIN listing_items li ON l.listing_id = li.listing_id
        WHERE b.barter_id = ?
        LIMIT 1
    ";
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param('i', $barter_id_int);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Trade not found");
    }
    
    $trade = $result->fetch_assoc();
    $stmt->close();
    
    // Get images for the OFFERED item (from listing_images)
    $images_query = "
        SELECT image_path 
        FROM listing_images 
        WHERE listing_id = ? 
        ORDER BY image_id ASC
    ";
    
    $images_stmt = $conn->prepare($images_query);
    if ($images_stmt) {
        $images_stmt->bind_param('i', $trade['listing_id']);
        $images_stmt->execute();
        $images_result = $images_stmt->get_result();
        
        $offered_images = [];
        while ($row = $images_result->fetch_assoc()) {
            $offered_images[] = $row['image_path'];
        }
        $trade['offered_images'] = $offered_images;
        $images_stmt->close();
    } else {
        $trade['offered_images'] = [];
    }
    
    // For the REQUESTED item (what they're looking for), we don't have images
    $trade['requested_images'] = [];
    
    // Process image paths for offered item
    if (!empty($trade['offered_images'])) {
        $trade['offered_images'] = array_map(function($img) {
            // Remove any directory traversal prefixes
            $img = preg_replace('/^(\.\.\/)+/', '', $img);
            $img = preg_replace('/^\.\//', '', $img);
            
            // Check if path already contains uploads
            if (strpos($img, 'uploads/') === 0) {
                return '/PayBach/' . $img;
            }
            
            // Otherwise prepend uploads directory
            return '/PayBach/uploads/' . ltrim($img, '/');
        }, $trade['offered_images']);
    }
    
    // Determine user role
    if ($trade['owner_id'] == $user_idnum) {
        $trade['user_role'] = 'owner';
        
        // Get offers for owner
        $offers_query = "
            SELECT 
                bo.offer_id,
                bo.offered_item_name,
                bo.item_condition as offered_item_condition,
                bo.offered_item_description as description,
                bo.additional_cash,
                bo.offered_item_image,  
                bo.status,
                bo.created_at,
                u.first_name,
                u.last_name,
                u.email as offerer_email
            FROM barter_offers bo
            JOIN users u ON bo.offerer_idnum = u.user_idnum
            WHERE bo.barter_id = ?
            ORDER BY bo.created_at DESC
        ";
        
        $offers_stmt = $conn->prepare($offers_query);
        if ($offers_stmt) {
            $offers_stmt->bind_param('i', $barter_id_int);
            $offers_stmt->execute();
            $offers_result = $offers_stmt->get_result();
            
            $offers = [];
            while ($offer = $offers_result->fetch_assoc()) {
                $offer['offerer_name'] = trim($offer['first_name'] . ' ' . $offer['last_name']);
                $offers[] = $offer;
            }
            $offers_stmt->close();
        } else {
            $offers = [];
        }
        
        // Check if has offers
        $trade['has_offers'] = !empty($offers);
        $trade['offer_count'] = count($offers);
        
        // Check for accepted offer and get offerer info
        $accepted_offerer_info = null;
        foreach ($offers as $offer) {
            if ($offer['status'] === 'accepted') {
                $accepted_offerer_info = [
                    'name' => $offer['offerer_name'],
                    'email' => $offer['offerer_email']
                ];
                break;
            }
        }

        // If there's an accepted offer, update the trade with offerer info
        if ($accepted_offerer_info) {
            $trade['accepted_by_name'] = $accepted_offerer_info['name'];
            $trade['accepted_by_email'] = $accepted_offerer_info['email'];
        }

        $trade['owner_name'] = trim($trade['first_name'] . ' ' . $trade['last_name']);
        $trade['owner_email'] = $trade['owner_email'] ?: 'Email not available';

        // If no owner name, set default
        if (empty($trade['owner_name']) || $trade['owner_name'] === ' ') {
            $trade['owner_name'] = 'Unknown User';
        }
        
    } else {
        $trade['user_role'] = 'viewer';
        $offers = [];
        
        // Check if user has made an offer
        $user_offer_query = "
            SELECT status 
            FROM barter_offers 
            WHERE barter_id = ? 
            AND offerer_idnum = ?
            ORDER BY created_at DESC 
            LIMIT 1
        ";
        
        $user_offer_stmt = $conn->prepare($user_offer_query);
        if ($user_offer_stmt) {
            $user_offer_stmt->bind_param('is', $barter_id, $user_idnum);
            $user_offer_stmt->execute();
            $user_offer_result = $user_offer_stmt->get_result();
            
            if ($user_offer_result->num_rows > 0) {
                $user_offer = $user_offer_result->fetch_assoc();
                $trade['user_role'] = 'offerer';
                $trade['user_offer_status'] = $user_offer['status'];
            }
            $user_offer_stmt->close();
        }
        
        $trade['has_offers'] = false;
        $trade['offer_count'] = 0;
        $trade['has_accepted_offer'] = false;
    }
    
    // Determine barter status
    switch($trade['status']) {
        case 'completed':
            $trade['barter_status'] = 'completed';
            break;
        case 'canceled':
            $trade['barter_status'] = 'canceled';
            break;
        case 'accepted':
            $trade['barter_status'] = 'accepted';
            break;
        default:
            // For active trades, check if they have offers or accepted offers
            if ($trade['has_accepted_offer']) {
                $trade['barter_status'] = 'accepted';
            } elseif ($trade['has_offers']) {
                $trade['barter_status'] = 'has_offers';
            } else {
                $trade['barter_status'] = 'active';
            }
    }
    
    // Format data for frontend
    $trade['owner_name'] = trim($trade['first_name'] . ' ' . $trade['last_name']);
    $trade['owner_email'] = $trade['owner_email'] ?: 'Email not available';

    // Make sure we're setting these values correctly
    if (empty($trade['owner_name']) || $trade['owner_name'] === ' ') {
        $trade['owner_name'] = 'Unknown User';
    }

    // The item they're looking for is in requested_items_text
    $trade['listing_item_name'] = $trade['requested_items_text'] ?: ($trade['listing_item_name'] ?: 'Trade Item');

    // If no listing_item_condition, use a default
    if (empty($trade['listing_item_condition'])) {
        $trade['listing_item_condition'] = 'Not specified';
    }
    
    // Format dates
    if ($trade['created_at']) {
        $trade['created_at_formatted'] = date('F j, Y, g:i a', strtotime($trade['created_at']));
    }
    if ($trade['updated_at']) {
        $trade['updated_at_formatted'] = date('F j, Y, g:i a', strtotime($trade['updated_at']));
    }
    
    // Parse trade tags if they exist
    if ($trade['trade_tags']) {
        try {
            $tags = json_decode($trade['trade_tags'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $trade['parsed_tags'] = $tags;
            } else {
                $trade['parsed_tags'] = [];
            }
        } catch (Exception $e) {
            $trade['parsed_tags'] = [];
        }
    } else {
        $trade['parsed_tags'] = [];
    }
    
    // Close connection
    $conn->close();
    
    // Clear output buffer and send response
    ob_end_clean();
    echo json_encode([
        'success' => true,
        'trade' => $trade,
        'offers' => $offers
    ]);
    
} catch (Exception $e) {
    // Clear output buffer and send error
    ob_end_clean();
    error_log("Trade item error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}