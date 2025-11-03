<?php
require_once "db_connect.php";  

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

$required = ["user_idnum", "quantity", "start_date", "end_date", "description"];
foreach ($required as $r) {
    if (!isset($data[$r])) {
        echo json_encode(["success" => false, "message" => "Missing: " . $r]);
        exit;
    }
}

$user_idnum     = $data["user_idnum"];
$quantity       = $data["quantity"];
$start_date     = $data["start_date"];
$end_date       = $data["end_date"];
$description    = $data["description"];
$exchange_method = $data["exchange_method"] ?? null;
$payment_method  = $data["payment_method"] ?? null;

// optional arrays
$items      = $data["items"] ?? [];
$categories = $data["categories"] ?? [];

try {
    $conn->beginTransaction();

    $stmt = $conn->prepare("
        INSERT INTO listings (user_idnum, quantity, start_date, end_date, description, exchange_method, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $user_idnum,
        $quantity,
        $start_date,
        $end_date,
        $description,
        $exchange_method,
        $payment_method
    ]);

    $listing_id = $conn->lastInsertId();

    // insert items
    if (!empty($items)) {
        $stmtItems = $conn->prepare("
            INSERT INTO listing_items (listing_id, name, item_condition)
            VALUES (?, ?, ?)
        ");

        foreach ($items as $i) {
            $stmtItems->execute([
                $listing_id,
                $i["name"],
                $i["item_condition"]
            ]);
        }
    }

    // insert categories
    if (!empty($categories)) {
        $stmtCat = $conn->prepare("
            INSERT INTO listing_categories (listing_id, category)
            VALUES (?, ?)
        ");

        foreach ($categories as $cat) {
            $stmtCat->execute([$listing_id, $cat]);
        }
    }

    $conn->commit();

    echo json_encode(["success" => true, "listing_id" => $listing_id]);

} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => "Insert failed",
        "error" => $e->getMessage()
    ]);
}
