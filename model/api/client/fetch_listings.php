<?php
// model/api/fetch_listing.php
header("Content-Type: application/json");

// adjust path to config file (model/config/db_connect.php)
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
            l.quantity,
            l.start_date,
            l.end_date,
            l.listing_type,
            CONCAT(u.first_name, ' ', u.last_name) AS seller_name,
            u.school, 
            u.program,
            b.current_amount,
            i.name
        FROM listings l
        JOIN users u ON l.user_idnum = u.user_idnum
        JOIN bids b ON l.listing_id = b.listing_id
        JOIN listing_items i ON i.listing_id = l.listing_id
        WHERE l.is_valid = TRUE
        ORDER BY l.start_date DESC
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

        // -----------------------------------------
        // CHECK IF CURRENT USER IS PARTICIPATING
        // -----------------------------------------
        $stmtBid = $conn->prepare("
            SELECT 1 FROM bids 
            WHERE listing_id = ? AND user_idnum = ? 
            LIMIT 1
        ");
        $stmtBid->bind_param("ii", $listing_id, $current_user_id);
        $stmtBid->execute();
        $resBid = $stmtBid->get_result();
        $l["user_participating"] = $resBid->num_rows > 0;
        $stmtBid->close();
    }

    echo json_encode([
        "success" => true,
        "data" => $listings
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Fetch failed",
        "error" => $e->getMessage()
    ]);
}
?>