<?php
session_start();

//  Correct path to db_connect.php
include __DIR__ . '/../../config/db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!$email || !$password) {
        echo " Email and password are required.";
        echo "<br><a href='../../../index.html'>Back to login</a>";
        exit();
    }

    // Prepare statement
    $stmt = $conn->prepare("SELECT user_idnum, password_hash, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($user_idnum, $password_hash, $role);
        $stmt->fetch();

        if (password_verify($password, $password_hash)) {
            $_SESSION['user_idnum'] = $user_idnum;
            $_SESSION['role'] = $role;

            // Redirect based on role
            if ($role === 'admin') {
                header("Location: ../../../views/pages/admin/bidding_summary.html"); // adjust if you have an admin homepage
            } else {
                header("Location: ../../../views/pages/client/homepage.html"); // adjust if you have a client homepage
            }
            exit();
        } else {
            echo " Incorrect password.";
            echo "<br><a href='../../../index.html'>Back to login</a>";
        }
    } else {
        echo " No user found with that email.";
        echo "<br><a href='../../../index.html'>Back to login</a>";
    }

    $stmt->close();
}
$conn->close();
?>
