<?php
session_start();
include '../config/db_connect.php';

header('Content-Type: application/json');

$conn = Database::getInstance()->getConnection();
$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "error" => "Missing email or password"]);
    exit;
}

$sql = "SELECT user_idnum, first_name, last_name, password_hash, email, role 
        FROM users 
        WHERE email = ?
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {

    if (password_verify($password, $row['password_hash'])) {

        $_SESSION['email'] = $row['email'];
        $_SESSION['role']  = strtolower($row['role']);
        $_SESSION['username'] = $row['first_name'] . " " . $row['last_name'];

        // CORRECT PATH
        $redirect = $row['role'] === 'admin'
            ? "/PayBach/views/pages/admin/bidding_summary.html"
            : "/PayBach/views/pages/client/homepage.html";

        echo json_encode([
            "success"  => true,
            "redirect" => $redirect
        ]);
    } else {
        echo json_encode(["success" => false, "error" => "Invalid password"]);
    }

} else {
    echo json_encode(["success" => false, "error" => "Account not found"]);
}
