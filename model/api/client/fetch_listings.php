<?php
// model/api/fetch_listing.php
header("Content-Type: application/json");

// adjust path to config file (model/config/db_connect.php)
require_once __DIR__ . "/../config/db_connect.php";  // MySQLi connection in $conn

try {
    // Alias quantity as start_bid so frontend can use l.start_bid
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
            CONCAT(u.first_name, ' ', u.last_name) AS seller_name,
            u.school, 
            u.program
        FROM listings l
        JOIN users u ON l.user_idnum = u.user_idnum
        WHERE l.is_valid = TRUE
        ORDER BY l.start_date DESC
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    $listings = $result->fetch_all(MYSQLI_ASSOC);

    foreach ($listings as &$l) {
        $listing_id = $l["listing_id"];

        // items
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

        // categories
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

        // images
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
