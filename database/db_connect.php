<?php
$host = "localhost";
$user = "root";   // default WAMP user
$pass = "";       // default WAMP password is empty
$db   = "paybach_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 
?>
