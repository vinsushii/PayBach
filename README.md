Paybach - PHP and Node JS 

This project was made in compliance with CS312: Website Development.
A lightweight marketplace web application using PHP, SQL, HTML, CSS and Javascript. Features include being able to post your items up for either trading or auction, or bidding/offering trades for items that other users have posted.

Requirements:
Web server: Apache/Nginx(WAMP)
Latest version of PHP
Latest version of Node JS and Express
Browser: (Chrome, Firefox, Opera, etc.)

Installation
Clone the project into your web server directory(www for WAMP)
Move files to web root (C:\wamp64\www\Paybach)
Open WAMP to start Apache and MySQL.

Database Setup
Open phpMyAdmin (http://localhost/phpmyadmin).
Create a new database: paybach_db.
Import the provided SQL file paybach_db.sql:
Go to paybach_db → Import → Choose paybach_db.sql → Go.
Verify tables are created:
users, listings, bids, barters, chat_messages, etc.
Default Admin Account (from SQL):

Configuration
Edit the database connection
config/db_connect.php
<?php
$host = 'localhost';
$db   = 'paybach_db';
$user = 'root';
$pass = ''; // your MySQL password
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
function get_db_connection() {
    global $conn;
    return $conn;
}
Make sure sessions are enabled in php.ini.

How to setup the Project:
Put the project inside the www directory of wamp64
Open the wampserver for the apache.
Import the sql file inside the phpmyadmin.
To setup the node js
Go to command prompt
Go to the directory of the root project (cd {Project directory in WAMP}
Enter the node {node.js}

Features
Auction system with bid history
Barter system with offers 
Trades system with offers
Listing categories and Images
User session and login

Troubleshooting
Blank page / errors → Enable display_errors in PHP for debugging.
DB connection errors → Check db_connect.php credentials.
Session issues → Make sure session_start() is called before output.

License
MIT License — free to use, modify, and distribute.

