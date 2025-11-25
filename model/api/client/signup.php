<?php
session_start();
include("db_connect.php"); // your DB connection

$email     = $_POST["email"] ?? '';
$password  = $_POST["password"] ?? '';
$cpassword = $_POST["cpassword"] ?? '';
$user_idnum = $_POST["user_idnum"] ?? ''; // if you're collecting it

if ($password === $cpassword) {
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 🔍 1. Check if email already exists
   $check = $conn->prepare("SELECT user_idnum FROM users WHERE user_idnum = ?");
   $check->bind_param("s", $user_idnum);
   $check->execute();
   $check->store_result();

    if ($check->num_rows > 0) {
        echo "<h1>That Student ID is already registered</h1>";
        exit();
    }


    // 🔑 2. If not found, insert new user
    $sql = "INSERT INTO users (user_idnum, email, password_hash, role)
            VALUES (?, ?, ?, 'student')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $user_idnum, $email, $password_hash);

    if ($stmt->execute()) {
        echo "<h1>Account created successfully</h1>";
        echo "<a href='index.html'>Go to login</a>";
    } else {
        echo "<h1>Account creation failed</h1>";
        echo "<p>Error: " . $conn->error . "</p>";
    }

    $stmt->close();
} else {
    echo "<h1>Passwords do not match</h1>";
}

$conn->close();
?>
