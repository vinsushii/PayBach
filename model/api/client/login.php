<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/../../config/db_connect.php";

$conn = Database::getInstance()->getConnection();

// Read JSON body from fetch()
$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"] ?? "";
$password = $data["password"] ?? "";

// Validate inputs
if (empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "error" => "Email and password are required."
    ]);
    exit;
}

// Fetch user
$sql = "SELECT user_idnum, first_name, last_name, password_hash, email, role 
        FROM users WHERE email = ? LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if (!$result || $result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "error" => "Account not found."
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Validate password
if (!password_verify($password, $user["password_hash"])) {
    echo json_encode([
        "success" => false,
        "error" => "Incorrect password."
    ]);
    exit;
}

// SESSION VALUES (unified format)
$_SESSION["UserID"]   = $user["user_idnum"];
$_SESSION["UserEmail"] = $user["email"];
$_SESSION["UserName"]  = $user["first_name"] . " " . $user["last_name"];
$_SESSION["UserType"]  = $user["role"]; // admin / student

// Role-based redirect
$redirect = ($user["role"] === "admin")
    ? "/Paybach/views/pages/admin/validate_listing.html"
    : "/Paybach/views/pages/client/homepage.html";

echo json_encode([
    "success"  => true,
    "redirect" => $redirect,
    "message"  => "Login successful."
]);
