<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/db_connect.php";

session_start();
$current_user_id = $_SESSION["user_idnum"] ?? "";

// Get search term from request
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // Base query
    $sql = "
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
            COALESCE(b.current_amount, 0) AS current_amount,
            b.start_bid,
            li_items.name AS item_name,
            li_items.item_condition,
            GROUP_CONCAT(DISTINCT lc.category) AS category_list,
            GROUP_CONCAT(DISTINCT li.image_path) AS image_list
        FROM listings l
        JOIN users u ON l.user_idnum = u.user_idnum
        LEFT JOIN bids b ON l.listing_id = b.listing_id
        LEFT JOIN listing_items li_items ON l.listing_id = li_items.listing_id
        LEFT JOIN listing_categories lc ON l.listing_id = lc.listing_id
        LEFT JOIN listing_images li ON l.listing_id = li.listing_id
        WHERE l.is_valid = TRUE
    ";

    // Add search conditions if search term exists
    $params = [];
    $types = "";
    
    if (!empty($search)) {
        $searchPattern = "%" . $search . "%";
        $sql .= " AND (
                    l.description LIKE ? OR 
                    li_items.name LIKE ? OR 
                    l.exchange_method LIKE ? OR 
                    l.listing_type LIKE ? OR 
                    lc.category LIKE ? OR 
                    b.start_bid LIKE ? OR 
                    b.current_amount LIKE ? OR
                    u.first_name LIKE ? OR
                    u.last_name LIKE ?
                )";
        $params = array_fill(0, 9, $searchPattern);
        $types = str_repeat('s', 9); // 9 string parameters
    }

    $sql .= " GROUP BY l.listing_id
              ORDER BY l.start_date DESC";

    // Prepare and execute query
    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $listings = $result->fetch_all(MYSQLI_ASSOC);

    foreach ($listings as &$l) {
        $listing_id = $l["listing_id"];

        // Process concatenated fields into arrays
        // Categories
        if (!empty($l["category_list"])) {
            $l["categories"] = explode(",", $l["category_list"]);
        } else {
            $l["categories"] = [];
        }
        unset($l["category_list"]);

        // Images
        if (!empty($l["image_list"])) {
            $l["images"] = explode(",", $l["image_list"]);
        } else {
            $l["images"] = [];
        }
        unset($l["image_list"]);

        // Items array (from the joined item data)
        if (!empty($l["item_name"])) {
            $l["items"] = [[
                "name" => $l["item_name"],
                "item_condition" => $l["item_condition"]
            ]];
        } else {
            // Fallback: query items separately if needed
            $stmtItems = $conn->prepare("
                SELECT name, item_condition
                FROM listing_items
                WHERE listing_id = ?
            ");
            $stmtItems->bind_param("i", $listing_id);
            $stmtItems->execute();
            $l["items"] = $stmtItems->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmtItems->close();
        }
        
        unset($l["item_name"], $l["item_condition"]);

        // Ownership rules
        $l["is_owner"] = ($current_user_id === $l["owner_id"]);
        $l["can_bid"] = !$l["is_owner"];
    }

    echo json_encode([
        "success" => true,
        "data" => $listings,
        "search_term" => $search // Optional: return the search term for debugging
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Fetch failed",
        "error" => $e->getMessage()
    ]);
}