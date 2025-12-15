<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/db_connect.php";

session_start();
$current_user_id = $_SESSION["user_idnum"] ?? "";

try {
    $stmt = $conn->prepare("
        SELECT 
            l.listing_id,
            l.user_idnum AS owner_id,
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
            b.current_amount
        FROM listings l
        JOIN users u ON l.user_idnum = u.user_idnum
        JOIN bids b ON l.listing_id = b.listing_id
        WHERE l.is_valid = TRUE
        ORDER BY l.start_date DESC
    ");

    $stmt->execute();
    $listings = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    foreach ($listings as &$l) {
        $listing_id = $l["listing_id"];

        // Items
        $stmtItems = $conn->prepare("
            SELECT name, item_condition
            FROM listing_items
            WHERE listing_id = ?
        ");
        $stmtItems->bind_param("i", $listing_id);
        $stmtItems->execute();
        $l["items"] = $stmtItems->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmtItems->close();

        // Categories
        $stmtCats = $conn->prepare("
            SELECT category
            FROM listing_categories
            WHERE listing_id = ?
        ");
        $stmtCats->bind_param("i", $listing_id);
        $stmtCats->execute();
        $l["categories"] = array_column(
            $stmtCats->get_result()->fetch_all(MYSQLI_ASSOC),
            "category"
        );
        $stmtCats->close();

        // Images
        $stmtImgs = $conn->prepare("
            SELECT image_path
            FROM listing_images
            WHERE listing_id = ?
        ");
        $stmtImgs->bind_param("i", $listing_id);
        $stmtImgs->execute();
        $l["images"] = array_column(
            $stmtImgs->get_result()->fetch_all(MYSQLI_ASSOC),
            "image_path"
        );
        $stmtImgs->close();

        // Ownership rules
        $l["is_owner"] = ($current_user_id === $l["owner_id"]);
        $l["can_bid"]  = !$l["is_owner"];
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
