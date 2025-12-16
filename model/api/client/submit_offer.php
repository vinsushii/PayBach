<?php
ob_start(); // Start output buffering

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/db_connect.php';
session_start();

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
$item_name = isset($_POST['item_name']) ? trim($_POST['item_name']) : null;
$description = isset($_POST['description']) ? trim($_POST['description']) : '';
$condition = isset($_POST['condition']) ? trim($_POST['condition']) : 'good';
$additional_cash = isset($_POST['additional_cash']) ? floatval($_POST['additional_cash']) : 0;
$notes = isset($_POST['notes']) ? trim($_POST['notes']) : '';

// Validate required fields
if (!$barter_id || !$item_name) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields: barter_id and item_name are required']);
    exit;
}

$user_idnum = $_SESSION['user_idnum'];

try {
    $conn = get_db_connection();
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    // Check if barter exists
    $check_query = "
        SELECT b.barter_id, b.listing_id, b.user_idnum as owner_id
        FROM barters b
        WHERE b.barter_id = ?
    ";
    
    $check_stmt = $conn->prepare($check_query);
    if (!$check_stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $check_stmt->bind_param('i', $barter_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        throw new Exception("Trade not found");
    }
    
    $barter = $check_result->fetch_assoc();
    $listing_id = $barter['listing_id'];
    
    // Check if user is the owner (can't make offer on own trade)
    if ($barter['owner_id'] == $user_idnum) {
        throw new Exception("You cannot make an offer on your own trade");
    }
    
    // Check if user already made an offer
    $existing_offer_query = "
        SELECT offer_id 
        FROM barter_offers 
        WHERE barter_id = ? 
        AND offerer_idnum = ?
        AND status IN ('pending', 'accepted')
    ";
    
    $existing_stmt = $conn->prepare($existing_offer_query);
    if ($existing_stmt) {
        $existing_stmt->bind_param('is', $barter_id, $user_idnum);
        $existing_stmt->execute();
        $existing_result = $existing_stmt->get_result();
        
        if ($existing_result->num_rows > 0) {
            throw new Exception("You have already made an offer on this trade");
        }
        $existing_stmt->close();
    }
    
    // Handle image upload
    $image_path = null;
    if (isset($_FILES['item_image']) && $_FILES['item_image']['error'] == UPLOAD_ERR_OK) {
        // Create uploads directory if it doesn't exist
        $upload_dir = __DIR__ . '/../../../uploads/';
        $offer_images_dir = $upload_dir . 'offer_images/';
        
        // Ensure main uploads directory exists
        if (!is_dir($upload_dir)) {
            if (!mkdir($upload_dir, 0755, true)) {
                throw new Exception("Failed to create upload directory");
            }
        }
        
        // Ensure offer_images subdirectory exists
        if (!is_dir($offer_images_dir)) {
            if (!mkdir($offer_images_dir, 0755, true)) {
                throw new Exception("Failed to create offer_images directory");
            }
        }
        
        // Validate image
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        $file_type = $_FILES['item_image']['type'];
        $file_size = $_FILES['item_image']['size'];
        
        if (!in_array($file_type, $allowed_types)) {
            throw new Exception("Invalid image type. Allowed: JPG, PNG, GIF, WebP");
        }
        
        if ($file_size > 5 * 1024 * 1024) { // 5MB limit
            throw new Exception("Image size should be less than 5MB");
        }
        
        // Generate unique filename
        $file_extension = strtolower(pathinfo($_FILES['item_image']['name'], PATHINFO_EXTENSION));
        $unique_filename = uniqid('offer_', true) . '.' . $file_extension;
        $upload_path = $offer_images_dir . $unique_filename;
        
        // Move uploaded file
        if (move_uploaded_file($_FILES['item_image']['tmp_name'], $upload_path)) {
            // Store relative path for database
            $image_path = 'uploads/offer_images/' . $unique_filename;
        } else {
            throw new Exception("Failed to upload image");
        }
    }
    
    // Combine description and notes
    $full_description = $description;
    if (!empty($notes)) {
        $full_description .= "\n\nNotes: " . $notes;
    }
    
    // Check if the offered_item_image column exists, if not, add it
    $check_column_query = "SHOW COLUMNS FROM barter_offers LIKE 'offered_item_image'";
    $column_result = $conn->query($check_column_query);
    
    if ($column_result->num_rows == 0) {
        // Add the column if it doesn't exist
        $alter_query = "ALTER TABLE barter_offers ADD COLUMN offered_item_image VARCHAR(255) DEFAULT NULL AFTER additional_cash";
        $conn->query($alter_query);
    }
    
    // Insert the offer into database
    $insert_query = "
        INSERT INTO barter_offers (
            listing_id, 
            barter_id, 
            offerer_idnum, 
            offered_item_name, 
            item_condition, 
            offered_item_description, 
            additional_cash, 
            offered_item_image,
            status, 
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ";
    
    $insert_stmt = $conn->prepare($insert_query);
    if (!$insert_stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    // Bind parameters
    $insert_stmt->bind_param(
        'iisssdss',
        $listing_id,
        $barter_id,
        $user_idnum,
        $item_name,
        $condition,
        $full_description,
        $additional_cash,
        $image_path
    );
    
    if (!$insert_stmt->execute()) {
        throw new Exception("Failed to save offer: " . $insert_stmt->error);
    }
    
    $offer_id = $insert_stmt->insert_id;
    
    // Close statements
    $check_stmt->close();
    $insert_stmt->close();
    $conn->close();
    
    // Clear any output buffer and send JSON response
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Offer submitted successfully',
        'offer_id' => $offer_id
    ]);
    
} catch (Exception $e) {
    // Clear any output buffer and send error response
    ob_end_clean();
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}