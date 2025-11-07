<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once "db_connect.php";  // MySQLi connection
header("Content-Type: application/json");

// Use $_POST instead of JSON
$data = $_POST;

// Required fields
$required = ["user_idnum", "description", "exchange_method", "payment_method"];
foreach ($required as $r) {
    if (!isset($data[$r]) || empty($data[$r])) {
        echo json_encode(["success" => false, "message" => "Missing: " . $r]);
        exit;
    }
}

$user_idnum      = $data["user_idnum"];
$description     = $data["description"];
$exchange_method = $data["exchange_method"];
$payment_method  = $data["payment_method"];
$quantity        = $data["quantity"] ?? 1;
$start_date      = $data["start_date"] ?? date("Y-m-d H:i:s");
$end_date        = $data["end_date"] ?? date("Y-m-d H:i:s");

// Items and categories from FormData
$items      = $_POST["items"] ?? [];
$categories = $_POST["categories"] ?? [];

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

    // Insert listing images
    if (!empty($_FILES["images"]["name"][0])) {
        $uploadDir = "../uploads/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $stmtImg = $conn->prepare("
            INSERT INTO listing_images (listing_id, image_path, uploaded_at)
            VALUES (?, ?, NOW())
        ");

        foreach ($_FILES["images"]["tmp_name"] as $index => $tmpName) {
            $fileName = basename($_FILES["images"]["name"][$index]);
            $targetPath = $uploadDir . time() . "_" . $fileName;

            if (move_uploaded_file($tmpName, $targetPath)) {
                $stmtImg->bind_param("is", $listing_id, $targetPath);
                $stmtImg->execute();
            }
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
