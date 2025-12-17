<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

// USE SESSION USER ID
if (!isset($_SESSION['user_idnum'])) {
    echo json_encode([
        "success" => false,
        "message" => "User not logged in (missing session user_idnum)"
    ]);
    exit;
}

$user_idnum = $_SESSION['user_idnum'];

// DB CONNECTION
require_once __DIR__ . "/../../config/db_connect.php";

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// GET FORM DATA
$item_name = $_POST['item_name'] ?? '';
$condition = $_POST['condition'] ?? '';
$description = $_POST['description'] ?? '';
$exchange_method = $_POST['exchange_method'] ?? '';
$payment_method = $_POST['payment_method'] ?? 'onsite'; // default
$listing_type = $_POST['listing_type'] ?? 'bid';

// Validate required fields
$required = ['item_name', 'condition', 'description', 'exchange_method'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
        exit;
    }
}

try {
    $conn->begin_transaction();

    // 1. INSERT INTO LISTINGS TABLE
    $stmt_listing = $conn->prepare("
        INSERT INTO listings (
            user_idnum, quantity, description, 
            exchange_method, payment_method, listing_type
        ) VALUES (?, 1, ?, ?, ?, ?)
    ");
    
    // Default quantity to 1
    $quantity = 1;
    $stmt_listing->bind_param(
        "sssss", 
        $user_idnum, 
        $description, 
        $exchange_method, 
        $payment_method, 
        $listing_type
    );
    
    if (!$stmt_listing->execute()) {
        throw new Exception("Failed to insert listing: " . $stmt_listing->error);
    }
    
    $listing_id = $conn->insert_id;
    
    // 2. INSERT INTO LISTING_ITEMS TABLE
    // Get category from tags (use first selected tag as category)
    $category = 'Others'; // default
    if (isset($_POST['categories']) && is_array($_POST['categories']) && !empty($_POST['categories'][0])) {
        $category = $_POST['categories'][0];
    }
    
    $stmt_item = $conn->prepare("
        INSERT INTO listing_items (
            listing_id, name, item_condition, created_at
        ) VALUES (?, ?, ?, NOW())
    ");
    
    $stmt_item->bind_param(
        "iss",
        $listing_id,
        $item_name,
        $condition
    );
    
    if (!$stmt_item->execute()) {
        throw new Exception("Failed to insert item: " . $stmt_item->error);
    }
    
    // 3. INSERT INTO LISTING_CATEGORIES TABLE
    if (isset($_POST['categories']) && is_array($_POST['categories'])) {
        $stmt_cat = $conn->prepare("
            INSERT INTO listing_categories (listing_id, category)
            VALUES (?, ?)
        ");
        
        foreach ($_POST['categories'] as $cat) {
            $stmt_cat->bind_param("is", $listing_id, $cat);
            $stmt_cat->execute();
        }
        $stmt_cat->close();
    }
    // 3. INSERT INTO BIDS TABLE (for bid listings)
    if ($listing_type === 'bid') {
    $starting_bid = $_POST['bid'] ?? 0;
    $max_bid = $_POST['max_bid'] ?? 0;
    
    $bid_increment = max(50.00, $starting_bid * 0.05);
    
    $stmt_bid = $conn->prepare("
        INSERT INTO bids (
            listing_id,
            user_idnum, 
            autobuy_amount, 
            start_bid, 
            bid_increment, 
            current_amount, 
            bid_datetime, 
            current_highest_bidder
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
    ");
    
    $current_amount = $starting_bid;
    $current_highest_bidder = $user_idnum;
    
    $stmt_bid->bind_param(
        "isdddds",
        $listing_id,
        $user_idnum,
        $max_bid,
        $starting_bid,
        $bid_increment,
        $current_amount,
        $current_highest_bidder
    );
    
    if (!$stmt_bid->execute()) {
        throw new Exception("Failed to insert bid: " . $stmt_bid->error);
    }
    
    $bid_id = $conn->insert_id;
    $stmt_bid->close();
    
    }
    // 4. HANDLE TRADE-SPECIFIC DATA
    if ($listing_type === 'trade') {
        // Get trade-specific data
        $requested_items = $_POST['requested_items'] ?? '';
        $max_price = $_POST['max_price'] ?? 0;
        $trade_tags = isset($_POST['trade_tags']) ? json_decode($_POST['trade_tags'], true) : [];
        
        // Note: $item_name, $condition, $description, and $exchange_method are already captured
        
        // Insert into barters table with offered item info
        $stmt_barter = $conn->prepare("
            INSERT INTO barters (
                listing_id,
                user_idnum, 
                offered_item_name,
                offered_item_condition,
                offered_item_description,
                exchange_method,
                payment_method,
                requested_items_text,
                max_additional_cash,
                trade_tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        ");
        
        $tags_json = !empty($trade_tags) ? json_encode($trade_tags) : null;
        
        $stmt_barter->bind_param(
        "isssssssds",  
            $listing_id,
            $user_idnum,
            $item_name,           
            $condition,           
            $description,         
            $exchange_method,    
            $payment_method,
            $requested_items,
            $max_price,
            $tags_json
        );
        
        if (!$stmt_barter->execute()) {
            throw new Exception("Failed to insert barter: " . $stmt_barter->error);
        }
        
        $barter_id = $conn->insert_id;
        $stmt_barter->close();
        
        // If max_price is set and greater than 0, update payment method
        if ($max_price > 0) {
            // Determine payment method text
            $payment_text = '';
            if ($payment_method === 'none') {
                $payment_text = 'Trade with cash option';
            } else if ($payment_method === 'onsite') {
                $payment_text = 'Trade + onsite cash';
            } else if ($payment_method === 'online') {
                $payment_text = 'Trade + online payment';
            } else {
                $payment_text = $payment_method;
            }
            
            $stmt_update_payment = $conn->prepare("
                UPDATE listings 
                SET payment_method = CONCAT(?, ' (Max cash: ₱', ?, ')')
                WHERE listing_id = ?
            ");
            $stmt_update_payment->bind_param("sdi", $payment_text, $max_price, $listing_id);
            $stmt_update_payment->execute();
            $stmt_update_payment->close();
        } else if ($payment_method === 'none') {
            // Update payment method to indicate pure trade
            $stmt_update_payment = $conn->prepare("
                UPDATE listings 
                SET payment_method = 'Trade only'
                WHERE listing_id = ?
            ");
            $stmt_update_payment->bind_param("i", $listing_id);
            $stmt_update_payment->execute();
            $stmt_update_payment->close();
        }
        
        // Set appropriate dates for trade listings
        $stmt_update_date = $conn->prepare("
            UPDATE listings 
            SET start_date = NOW(),
                end_date = DATE_ADD(NOW(), INTERVAL 30 DAY) -- Trades active for 30 days
            WHERE listing_id = ?
        ");
        $stmt_update_date->bind_param("i", $listing_id);
        $stmt_update_date->execute();
        $stmt_update_date->close();
    }

    // 5. HANDLE BID-SPECIFIC DATA
    if ($listing_type === 'bid') {
        
        // You might want to store this in a bids table or listings table
        // For now, let's update the listings table with bid info
        $stmt_update = $conn->prepare("
            UPDATE listings 
            SET start_date = NOW(),
                end_date = DATE_ADD(NOW(), INTERVAL 7 DAY) -- 7 days from now
            WHERE listing_id = ?
        ");
        $stmt_update->bind_param("i", $listing_id);
        $stmt_update->execute();
        $stmt_update->close();
    }
    
    // 6. HANDLE IMAGE UPLOADS
    if (!empty($_FILES['images'])) {
        $uploadDir = __DIR__ . "/../../../uploads/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $stmt_img = $conn->prepare("
            INSERT INTO listing_images (listing_id, image_path)
            VALUES (?, ?)
        ");
        
        // Handle multiple images
        for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
            if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                $fileName = time() . '_' . uniqid() . '_' . basename($_FILES['images']['name'][$i]);
                $targetPath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $targetPath)) {
                    // Store relative path
                    $dbPath = '../../../uploads/' . $fileName;
                    $stmt_img->bind_param("is", $listing_id, $dbPath);
                    $stmt_img->execute();
                }
            }
        }
        $stmt_img->close();
    }
    
    // 7. COMMIT TRANSACTION
    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Listing posted successfully!",
        "listing_id" => $listing_id
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}

// Close connections
if (isset($stmt_listing)) $stmt_listing->close();
if (isset($stmt_item)) $stmt_item->close();
$conn->close();
?>