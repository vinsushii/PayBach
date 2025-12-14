<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/db_connect.php";

$result = $conn->query("
  SELECT id, name, image
  FROM categories
  ORDER BY name ASC
");

if (!$result) {
  echo json_encode([
    "success" => false,
    "message" => "Query failed"
  ]);
  exit;
}

$categories = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode([
  "success" => true,
  "categories" => $categories
]);
exit;