<?php
require_once "db_connect.php";

header("Content-Type: application/json");

try {
    $stmt = $conn->prepare("
        SELECT 
            l.*, 
            CONCAT(u.first_name, ' ', u.last_name) AS seller_name,
            u.school, u.program
        FROM listings l
        JOIN users u ON l.user_idnum = u.user_idnum
        WHERE l.is_valid = TRUE
        ORDER BY l.start_date DESC
    ");
    $stmt->execute();
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($listings as &$l) {
        $listing_id = $l["listing_id"];

        // items
        $stmtItems = $conn->prepare("
            SELECT name, item_condition
            FROM listing_items
            WHERE listing_id = ?
        ");
        $stmtItems->execute([$listing_id]);
        $l["items"] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        // categories
        $stmtCats = $conn->prepare("
            SELECT category
            FROM listing_categories
            WHERE listing_id = ?
        ");
        $stmtCats->execute([$listing_id]);
        $l["categories"] = array_column($stmtCats->fetchAll(PDO::FETCH_ASSOC), "category");
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
