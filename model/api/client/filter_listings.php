<?php
// model/api/client/filter_listings.php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/db_connect.php";

session_start();
$current_user_id = $_SESSION["user_idnum"] ?? "";

// Get filter parameters
$categories = isset($_GET['categories']) ? explode(',', $_GET['categories']) : [];
$listing_type = isset($_GET['type']) ? $_GET['type'] : 'bid'; // 'bid' or 'trade'

try {
    // Base query - MATCHING YOUR EXACT STRUCTURE
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
        AND l.listing_type = ?
    ";
    
    $params = [$listing_type];
    $types = "s";
    
    // Add category filtering if categories provided
    if (!empty($categories)) {
        // Filter out empty categories
        $categories = array_filter($categories);
        if (!empty($categories)) {
            $placeholders = implode(',', array_fill(0, count($categories), '?'));
            $sql .= " AND lc.category IN ($placeholders)";
            $params = array_merge($params, $categories);
            $types .= str_repeat('s', count($categories));
        }
    }
    
    $sql .= " GROUP BY l.listing_id
              ORDER BY l.start_date DESC";
    
    // Prepare and execute
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("SQL prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if (!$result) {
        throw new Exception("Query failed: " . $stmt->error);
    }
    
    $listings = $result->fetch_all(MYSQLI_ASSOC);
    
    // Process data (EXACTLY LIKE YOUR fetch_listings.php)
    foreach ($listings as &$l) {
        $listing_id = $l["listing_id"];
        
        // Process categories
        if (!empty($l["category_list"])) {
            $l["categories"] = explode(",", $l["category_list"]);
        } else {
            $l["categories"] = [];
        }
        unset($l["category_list"]);
        
        // Process images
        if (!empty($l["image_list"])) {
            $l["images"] = explode(",", $l["image_list"]);
        } else {
            $l["images"] = [];
        }
        unset($l["image_list"]);
        
        // Process items
        if (!empty($l["item_name"])) {
            $l["items"] = [[
                "name" => $l["item_name"],
                "item_condition" => $l["item_condition"]
            ]];
        } else {
            $stmtItems = $conn->prepare("SELECT name, item_condition FROM listing_items WHERE listing_id = ?");
            $stmtItems->bind_param("i", $listing_id);
            $stmtItems->execute();
            $l["items"] = $stmtItems->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmtItems->close();
        }
        
        unset($l["item_name"], $l["item_condition"]);
        
        // Ownership
        $l["is_owner"] = ($current_user_id === $l["owner_id"]);
        $l["can_bid"] = !$l["is_owner"];
    }
    
    echo json_encode([
        "success" => true,
        "data" => $listings,
        "filters_applied" => [
            "type" => $listing_type,
            "categories" => $categories
        ],
        "count" => count($listings)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Filter failed",
        "error" => $e->getMessage(),
        "query_error" => $conn->error ?? null
    ]);
}