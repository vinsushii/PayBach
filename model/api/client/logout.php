<?php
session_start();

// Unset all session variables
$_SESSION = [];

// Destroy the session
session_destroy();

// Return JSON response
header('Content-Type: application/json');
echo json_encode(["success" => true]);
?>