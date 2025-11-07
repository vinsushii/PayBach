<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once "db_connect.php";  // this should return a MySQLi $conn

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

// Required fields
$required = ["user_idnum", "description", "exchange_method", "payment_method"];
foreach ($required as $r) {
    if (!isset($data[$r]) || empty($data[$r])) {
        echo json_encode(["success" => false, "message" => "Missing: " . $r]);
        exit;
    }
}

// Extract values
$user_idnum      = $data["user_idnum"];
$description     = $data["description"];
$exchange_method = $data["exchange_method"];
$payment_method  = $data["payment_method"];
$quantity        = $data["quantity"] ?? 1;
$start_date      = $data["start_date"] ?? date("Y-m-d H:i:s");
$end_date        = $data["end_date"] ?? date("Y-m-d H:i:s");

$items      = $data["items"] ?? [];
$categories = $data["categories"] ?? [];

try {
    $conn->begin_transaction();

    // Insert into listings
    $stmt = $conn->prepare("
        INSERT INTO listings (user_idnum, quantity, start_date, end_date, description, exchange_method, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("sisssss", $user_idnum, $quantity, $start_date, $end_date, $description, $exchange_method, $payment_method);
    $stmt->execute();

    $listing_id = $conn->insert_id;

    // Insert listing items
    if (!empty($items)) {
        $stmtItems = $conn->prepare("
            INSERT INTO listing_items (listing_id, name, item_condition)
            VALUES (?, ?, ?)
        ");
        foreach ($items as $i) {
            $name = $i["name"] ?? "Unnamed";
            $condition = $i["item_condition"] ?? "Unknown";
            $stmtItems->bind_param("iss", $listing_id, $name, $condition);
            $stmtItems->execute();
        }
    }

    // Insert listing categories
    if (!empty($categories)) {
        $stmtCat = $conn->prepare("
            INSERT INTO listing_categories (listing_id, category)
            VALUES (?, ?)
        ");
        foreach ($categories as $cat) {
            $stmtCat->bind_param("is", $listing_id, $cat);
            $stmtCat->execute();
        }
    }

    $conn->commit();
    echo json_encode(["success" => true, "listing_id" => $listing_id]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Insert failed",
        "error" => $e->getMessage()
    ]);
}
?>
