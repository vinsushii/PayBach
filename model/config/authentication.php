<?php
session_start();

if (!isset($_SESSION['email']) || !isset($_SESSION['role'])) {
    header('Location: /PayBach/index.html');
    exit;
}

if (isset($allowedRoles)) {
    $currentRole = strtolower($_SESSION['role']);
    $allowedRoles = array_map('strtolower', $allowedRoles);

    if (!in_array($currentRole, $allowedRoles)) {
        header('Location: /PayBach/index.html');
        exit;
    }
}
