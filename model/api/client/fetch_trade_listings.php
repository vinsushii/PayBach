<?php
/////////////////////////
// NEED MAPALITAN TOH //
///////////////////////


// model/api/client/fetch_trade_listings.php
header("Content-Type: application/json");

// Adjust path to config file (model/config/db_connect.php)
require_once __DIR__ . "/../../config/db_connect.php";  // MySQLi connection in $conn

session_start();
$current_user_id = $_SESSION["user_idnum"] ?? 0;

try {

    $stmt = $conn->prepare("
        SELECT 
            l.listing_id,
            l.user_idnum,
            l.description,
            l.exchange_method,
            l.payment_method,
            l.quantity AS start_bid,  
            l.start_date,
            l.end_date,
            l.listing_type,           
            l.created_at,            
            CONCAT(u.first_name, ' ', u.last_name) AS seller_name,
            u.school, 
            u.program
        FROM listings l
        JOIN users u ON l.user_idnum = u.user_idnum
        WHERE l.is_valid = TRUE 
          AND l.listing_type = 'trade'  // Filter for trades only
        ORDER BY l.created_at DESC      
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    $listings = $result->fetch_all(MYSQLI_ASSOC);

    foreach ($listings as &$l) {
        $listing_id = $l["listing_id"];

        // Fetch items 
        $stmtItems = $conn->prepare("
            SELECT name, item_condition
            FROM listing_items
            WHERE listing_id = ?
        ");
        $stmtItems->bind_param("i", $listing_id);
        $stmtItems->execute();
        $resItems = $stmtItems->get_result();
        $l["items"] = $resItems->fetch_all(MYSQLI_ASSOC);
        $stmtItems->close();

        // Fetch categories 
        $stmtCats = $conn->prepare("
            SELECT category
            FROM listing_categories
            WHERE listing_id = ?
        ");
        $stmtCats->bind_param("i", $listing_id);
        $stmtCats->execute();
        $resCats = $stmtCats->get_result();
        $l["categories"] = array_column($resCats->fetch_all(MYSQLI_ASSOC), "category");
        $stmtCats->close();

        // Fetch images 
        $stmtImgs = $conn->prepare("
            SELECT image_path
            FROM listing_images
            WHERE listing_id = ?
        ");
        $stmtImgs->bind_param("i", $listing_id);
        $stmtImgs->execute();
        $resImgs = $stmtImgs->get_result();
        $l["images"] = array_column($resImgs->fetch_all(MYSQLI_ASSOC), "image_path");
        $stmtImgs->close();

        // ---------------------------------------------------------
        // TRADE PARTICIPATION CHECK - UPDATED FOR TRADES
        // Check if current user has made offers on this trade listing
        // ---------------------------------------------------------
        
        $stmtTradePart = $conn->prepare("
            SELECT 1 FROM barter_offers bo
            JOIN barters b ON bo.barter_id = b.barter_id
            WHERE b.listing_id = ? AND bo.nagoffer = ?
            LIMIT 1
        ");
        
        
      
        $stmtTradePart = $conn->prepare("
            SELECT 1 FROM listings 
            WHERE listing_id = ? AND user_idnum = ?
            LIMIT 1
        ");
        $stmtTradePart->bind_param("is", $listing_id, $current_user_id);
        $stmtTradePart->execute();
        $resTradePart = $stmtTradePart->get_result();
        
       
        $l["user_participating"] = false;
        
        $stmtTradePart->close();
        
    
        if ($current_user_id !== 0) {
            
    }

    // Return success with trade listings data
    echo json_encode([
        "success" => true,
        "data" => $listings,
        "count" => count($listings),
        "message" => "Trade listings fetched successfully"
    ]);

} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch trade listings",
        "error" => $e->getMessage()
    ]);
}
}
?>