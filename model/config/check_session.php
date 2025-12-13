<?php
session_start();
header('Content-Type: application/json');

if (!empty($_SESSION['UserID'])) {
    echo json_encode([
        "loggedIn" => true,
        "username" => $_SESSION['UserID'], // display ID instead of name
        "role" => $_SESSION['UserType'] ?? ''
    ]);
} else {
    echo json_encode([
        "loggedIn" => false
    ]);
}
