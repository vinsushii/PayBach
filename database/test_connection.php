<?php
include("db_connect.php");

$sql = "SELECT * FROM users";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "User: " . $row["first_name"] . " " . $row["last_name"] . "<br>";
    }
} else {
    echo "No users found.";
}

$conn->close();
?>
s