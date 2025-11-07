<?php
require_once "db_connect.php";  // MySQLi connection

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
