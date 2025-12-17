<?php
// model/api/client/filter_listings.php
session_start();
header("Content-Type: application/json");

require_once "../../config/database.php"; // <-- adjust if needed

try {
    // Validate input
    if (!isset($_GET['type']) || $_GET['type'] !== 'bid') {
        throw new Exception("Invalid listing type");
    }

    if (!isset($_GET['categories']) || empty($_GET['categories'])) {
        throw new Exception("No categories provided");
    }

    // Parse categories
    $categories = explode(',', $_GET['categories']);
    $categories = array_map('trim', $categories);

    // Build placeholders (?, ?, ?)
    $placeholders = implode(',', array_fill(0, count($categories), '?'));

    $sql = "
        SELECT DISTINCT
            l.listing_id,
            l.user_idnum,
            l.listing_type,
            l.start_bid,
            l.current_amount,
            l.description,

            i.item_id,
            i.name AS item_name,

            c.category_name,

            img.image_path

        FROM listings l
        JOIN items i ON i.listing_id = l.listing_id

        JOIN item_categories ic ON ic.item_id = i.item_id
        JOIN categories c ON c.category_id = ic.category_id

        LEFT JOIN listing_images img ON img.listing_id = l.listing_id

        WHERE l.listing_type = 'bid'
          AND c.category_name IN ($placeholders)
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($categories);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group results per listing (important for cards)
    $bids = [];

    foreach ($rows as $row) {
        $id = $row['listing_id'];

        if (!isset($bids[$id])) {
            $bids[$id] = [
                "listing_id"     => $id,
                "user_idnum"     => $row['user_idnum'],
                "listing_type"   => "bid",
                "start_bid"      => $row['start_bid'],
                "current_amount" => $row['current_amount'],
                "description"    => $row['description'],
                "items" => [
                    [
                        "name" => $row['item_name']
                    ]
                ],
                "images" => []
            ];
        }

        // Collect images
        if (!empty($row['image_path'])) {
            $bids[$id]['images'][] = $row['image_path'];
        }
    }

    echo json_encode([
        "success" => true,
        "count"   => count($bids),
        "data"    => array_values($bids)
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
