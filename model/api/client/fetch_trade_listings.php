<?php
header("Content-Type: application/json");

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
          AND l.listing_type = 'trade'
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

        
        $userParticipating = false;
        
        $stmtBarterCheck = $conn->prepare("
            SELECT 1 FROM barter_offers bo
            WHERE bo.nagoffer = ?
            AND bo.barter_id IN (
                SELECT b.barter_id FROM barters b 
                WHERE b.listing_id = ?
            )
            LIMIT 1
        ");
        
        if ($stmtBarterCheck) {
            $stmtBarterCheck->bind_param("si", $current_user_id, $listing_id);
            $stmtBarterCheck->execute();
            $resBarterCheck = $stmtBarterCheck->get_result();
            $userParticipating = $resBarterCheck->num_rows > 0;
            $stmtBarterCheck->close();
        }
        
        // If no relationship found, check if this is user's own listing
        if (!$userParticipating) {
            $stmtOwnCheck = $conn->prepare("
                SELECT 1 FROM listings 
                WHERE listing_id = ? AND user_idnum = ?
                LIMIT 1
            ");
            $stmtOwnCheck->bind_param("is", $listing_id, $current_user_id);
            $stmtOwnCheck->execute();
            $resOwnCheck = $stmtOwnCheck->get_result();
            $userParticipating = $resOwnCheck->num_rows > 0;
            $stmtOwnCheck->close();
        }
        
        $l["user_participating"] = $userParticipating;
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
?>
