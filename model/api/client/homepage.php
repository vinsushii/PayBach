<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// Only allow logged-in students
if (!isset($_SESSION['user_idnum']) || $_SESSION['role'] !== 'student') {
    header("Location: ../../../index.html"); // back to login
    exit();
}

// If user is valid, go to HTML page
header("Location: ../../../views/pages/client/homepage.html");
exit();
?>
