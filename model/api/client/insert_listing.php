<?php
// model/api/client/insert_listing.php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

// USE SESSION USER ID
if (!isset($_SESSION['UserID'])) {
    echo json_encode([
        "success" => false,
        "message" => "User not logged in (missing session user_idnum)"
    ]);
    exit;
}

$user_idnum = $_SESSION['UserID'];
echo '<script>console.log('.json_encode($user_idnum).')</script>';

// DB CONNECTION
require_once __DIR__ . "/../../config/db_connect.php";

// REQUIRED FIELDS
$required = ["description", "exchange_method", "payment_method"];

foreach ($required as $r) {
    if (empty($_POST[$r])) {
        echo json_encode(["success" => false, "message" => "Missing: " . $r]);
        exit;
    }
}

$description     = $_POST["description"];
$exchange_method = $_POST["exchange_method"];
$payment_method  = $_POST["payment_method"];

$quantity   = isset($_POST["quantity"]) ? intval($_POST["quantity"]) : 1;
$start_date = $_POST["start_date"] ?? date("Y-m-d H:i:s");
$end_date   = $_POST["end_date"]   ?? date("Y-m-d H:i:s");

echo '<script>console.log("DESCRIPTION: ",' ($description, "ECHANGE METHOD: ", $exchange_method, "PAYMENT METHOD: ", $payment_method, "QUANTITY: ", $quantity, "START DATE: ", $start_date, "END DATE: ", $end_date);
// Arrays sent as JSON strings
$items      = isset($_POST["items"]) ? json_decode($_POST["items"], true) : [];
$categories = isset($_POST["categories"]) ? json_decode($_POST["categories"], true) : [];

try {
    $conn->begin_transaction();

    // INSERT LISTING
    $stmt = $conn->prepare("
        INSERT INTO listings (
            user_idnum, quantity, start_date, end_date,
            description, exchange_method, payment_method
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        $user_idnum,
        $quantity,
        $start_date,
        $end_date,
        $description,
        $exchange_method,
        $payment_method
    );

    $stmt->execute();
    $listing_id = $conn->insert_id;

    // INSERT ITEMS
    if (!empty($items) && is_array($items)) {
        $stmtItems = $conn->prepare("
            INSERT INTO listing_items (listing_id, name, item_condition)
            VALUES (?, ?, ?)
        ");

        foreach ($items as $i) {
            $name      = $i["name"] ?? "Unnamed";
            $condition = $i["item_condition"] ?? "Unknown";

            $stmtItems->bind_param($listing_id, $name, $condition);
            $stmtItems->execute();
        }
        $stmtItems->close();
    }

    // INSERT CATEGORIES
    if (!empty($categories) && is_array($categories)) {
        $stmtCat = $conn->prepare("
            INSERT INTO listing_categories (listing_id, category)
            VALUES (?, ?)
        ");

        foreach ($categories as $cat) {
            $stmtCat->bind_param($listing_id, $cat);
            $stmtCat->execute();
        }
        $stmtCat->close();
    }

    // INSERT IMAGES
    if (!empty($_FILES["images"]["name"][0])) {
        $uploadDir = __DIR__ . "/../../../uploads/";
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $stmtImg = $conn->prepare("
            INSERT INTO listing_images (listing_id, image_path, uploaded_at)
            VALUES (?, ?, NOW())
        ");

        foreach ($_FILES["images"]["tmp_name"] as $index => $tmpName) {
            $fileName = time() . "_" . basename($_FILES["images"]["name"][$index]);
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($tmpName, $targetPath)) {
                $dbPath = $fileName; // store filename only
                $stmtImg->bind_param($listing_id, $dbPath);
                $stmtImg->execute();
            }
        }
        $stmtImg->close();
    }

    // SUCCESS
    $conn->commit();
    echo json_encode([
        "success" => true,
        "listing_id" => $listing_id
    ]);
    exit;

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Insert failed",
        "error" => $e->getMessage()
    ]);
    exit;
}
?>
