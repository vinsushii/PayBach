<?php
session_start();

//  Correct path to db_connect.php
require_once __DIR__ . '/../../config/db_connect.php';

// Get form data
$email      = $_POST["email"] ?? '';
$password   = $_POST["password"] ?? '';
$cpassword  = $_POST["cpassword"] ?? '';
$user_idnum = $_POST["user_idnum"] ?? ''; 

// 1️ Check if passwords match
if ($password !== $cpassword) {
    echo "<h1> Passwords do not match</h1>";
    echo "<a href='../../../index.html'>Back to signup</a>";
    exit();
}

// 2️ Hash the password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// 3️ Check if Student ID already exists
$check = $conn->prepare("SELECT user_idnum FROM users WHERE user_idnum = ?");
$check->bind_param("s", $user_idnum);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo "<h1> That Student ID is already registered</h1>";
    echo "<a href='../../../index.html'>Back to login</a>";
    exit();
}

// 4️ Insert new user
$sql = "INSERT INTO users (user_idnum, email, password_hash, role)
        VALUES (?, ?, ?, 'student')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $user_idnum, $email, $password_hash);

if ($stmt->execute()) {
    echo "<h1> Account created successfully!</h1>";
    echo "<p>You will be redirected to the login page in 3 seconds...</p>";
    echo "<p>If not redirected, click <a href='../../../index.html'>here</a></p>";

    // Redirect after 3 seconds
    header("refresh:3;url=../../../index.html");
    exit();
} else {
    echo "<h1> Account creation failed</h1>";
    echo "<p>Error: " . $conn->error . "</p>";
}

// Close statements and connection
$stmt->close();
$conn->close();
?>
