<?php
require_once("../database/db_connect.php");

if (!isset($_GET["id"])) {
    die("Missing listing ID");
}

$listing_id = intval($_GET["id"]);

// Fetch listing details & seller
$stmt = $conn->prepare("
    SELECT l.*, CONCAT(u.first_name, ' ', u.last_name) AS seller_name, u.email
    FROM listings l
    JOIN users u ON l.user_idnum = u.user_idnum
    WHERE l.listing_id = ?
");
$stmt->execute([$listing_id]);
$listing = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$listing) {
    die("Listing not found");
}

// Fetch item info
$stmt2 = $conn->prepare("
    SELECT name, item_condition
    FROM listing_items
    WHERE listing_id = ?
");
$stmt2->execute([$listing_id]);
$items = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// Fetch categories
$stmt3 = $conn->prepare("
    SELECT category
    FROM listing_categories
    WHERE listing_id = ?
");
$stmt3->execute([$listing_id]);
$categories = $stmt3->fetchAll(PDO::FETCH_COLUMN);

// Fetch images
$stmt4 = $conn->prepare("SELECT image_path FROM listing_images WHERE listing_id = ?");
$stmt4->execute([$listing_id]);
$images = $stmt4->fetchAll(PDO::FETCH_COLUMN);

// Fetch current bid (from bids table)
$stmt5 = $conn->prepare("SELECT current_amount FROM bids WHERE transaction_id = ? LIMIT 1");
$stmt5->execute([$listing_id]);
$currentBid = $stmt5->fetch(PDO::FETCH_ASSOC);

$price = $currentBid["current_amount"] ?? 0;
?>
<!DOCTYPE html>
<html>
<head>
  <title>Buy Item</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>

<h2><?= htmlspecialchars($items[0]["name"] ?? "Unnamed Item") ?></h2>

<!-- MAIN IMAGE -->
<img id="mainImg" src="<?= $images[0] ?? '../images/default.png' ?>" width="300">

<!-- THUMBNAILS -->
<div class="thumb-container">
<?php foreach($images as $img): ?>
  <img class="thumb" src="<?= $img ?>" width="70">
<?php endforeach ?>
</div>

<p>Condition: <?= htmlspecialchars($items[0]["item_condition"] ?? "N/A") ?></p>
<p><?= htmlspecialchars($listing["description"]) ?></p>

<h3>Current bid: ₱<span id="currentPrice"><?= $price ?></span></h3>

<input type="number" id="newPrice">
<button onclick="updatePrice(<?= $listing_id ?>)">Top Up</button>

<script src="buy_item.js"></script>
</body>
</html>
