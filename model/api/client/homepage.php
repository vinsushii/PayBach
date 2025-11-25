<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// Only allow logged-in students
if (!isset($_SESSION['user_idnum']) || $_SESSION['role'] !== 'student') {
    header("Location: ../index.html"); // back to login
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PayBach | Home</title>
  <link rel="stylesheet" href="homepage.css" />
</head>
<body>
  <!-- HEADER-->
  <header class="header">
    <div class="header-top">
      <div class="logo-section">
        <img src="../images/payback-logo.png" alt="PayBach Logo" class="logo" />
        <div class="logo-text">
          <h1>PayBach</h1>
          <p>We have your back 24/7.</p>
        </div>
      </div>

      <div class="header-icons">
        <a href="chats.html" title="Chats">
          <img src="../images/chat_bubble.png" alt="Chats" class="icon" /> Chats
        </a>
        <a href="notifications.html" title="Notifications">
          <img src="../images/notif-bell.png" alt="Notifications" class="icon" /> Notifications
        </a>
        <a href="../index.html" class="profile-link" title="Profile">
          <img src="../images/user-profile.png" alt="Profile" class="icon" /> Log in/Sign up
        </a>
      </div>
    </div>

  <!-- NAVIGATION -->
  <nav class="navbar">
    <a href="../user/ongoing_bids.html">BIDS</a>
    <a href="../user/ongoing_trades.html">TRADES</a>
    <a href="../user/view_listing.html">CATEGORIES</a>
    <a href="#help">HELP</a>
    <div class="search-bar">
      <input type="text" placeholder="Search..." />
        <button type="submit">
            <img src="../images/search-icon.png" alt="Search" />
        </button>
    </div>
  </nav>
</header>

  <!-- CAROUSEL -->
  <section class="carousel">
    <div class="slides">
      <img src="../images/SAMCIS.png" alt="SAMCIS" class="active" />
      <img src="../images/SAS.png" alt="SAS" />
      <img src="../images/SEA.png" alt="SEA" />
      <img src="../images/SOL.png" alt="SOL" />
      <img src="../images/SOM.png" alt="SOM" />
      <img src="../images/SONAHBS.png" alt="SONAHBS" />
      <img src="../images/STELA.png" alt="STELA" />
    </div>
  </section>

  <!-- ONGOING BIDS -->
<section class="bids">
  <div class="section-header">
    <h2>ONGOING BIDS</h2>
    <button class="add-btn" onclick="window.location.href='post_item.html'">+</button>
  </div>
  <div class="card-container">
    <div class="card">
      <img src="../images/iphone.png" alt="iPhone 17 Pro Max" />
      <p>IPhone 17 Pro Max</p>
      <span class="price">₱35000</span>
    </div>
    <div class="card">
      <img src="../images/wallet.png" alt="Leather Wallet" />
      <p>Leather Wallet</p>
      <span class="price">₱170</span>
    </div>
    <div class="card">
      <img src="../images/goggles.png" alt="Swimming Goggles" />
      <p>Swimming Goggles</p>
      <span class="price">₱50</span>
    </div>
    <div class="card">
      <img src="../images/stanley.png" alt="Stanley Grey" />
      <p>Stanley Grey</p>
      <span class="price">₱550</span>
    </div>
  </div>
</section>

<!-- ONGOING TRADES -->
<section class="trades">
  <div class="section-header">
    <h2>ONGOING TRADES</h2>
    <button class="add-btn" onclick="window.location.href='post_item.html'">+</button>
  </div>
  <div class="card-container">
    <div class="card">
      <img src="../images/coding.png" alt="Coding for Dummies" />
      <p>Coding for Dummies</p>
    </div>
    <div class="card">
      <img src="../images/apple.png" alt="Apple" />
      <p>Apple</p>
    </div>
    <div class="card">
      <img src="../images/pliers.png" alt="Pliers" />
      <p>Pliers</p>
    </div>
    <div class="card">
      <img src="../images/stanleyblue.png" alt="Stanley Blue" />
      <p>Stanley Blue</p>
    </div>
  </div>
</section>

  <!-- CATEGORIES -->
  <section class="categories">
    <h2>CATEGORIES</h2>
    <div class="card-container">
      <div class="card">
        <img src="../images/fashion-main.jpg" alt="Fashion" />
        <p>Fashion</p>
      </div>
      <div class="card">
        <img src="../images/school supplies-main.jpg" alt="School Supplies" />
        <p>School Supplies</p>
      </div>
      <div class="card">
        <img src="../images/tech.png" alt="Technology" />
        <p>Technology</p>
      </div>
      <div class="card">
        <img src="../images/tools.png" alt="Tools & Home Materials" />
        <p>Tools & Home Materials</p>
      </div>
    </div>
  </section>

  <!-- HELP -->
  <section class="help" id="help">
    <h2>HELP</h2>
    <div class="help-box">
      <p><strong>Don't know what to do? Let us help you.</strong></p>
      <p><b>Bidding</b> is when you top up a certain price point to get the item you want. <b>Bartering</b> is when you trade items with the seller.</p>
      <p>If you have any further questions or concerns, don’t hesitate to email us. Happy shopping!</p>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="contact">
      <h3>Contact Us</h3>
      <p>222222@slu.edu.ph</p>
      <p>Saint Louis University, Maryheights Campus</p>
      <p>Bakakeng Norte, Baguio City</p>
    </div>
    <p class="credits">Website made by Team Bach ©2025</p>
  </footer>

  <script src="homepage.js"></script>
</body>
</html>
