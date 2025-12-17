import express from "express";
import pool from "../model/admin/db.js";
import { sessionAuth, adminOnly } from "../middleware/sessionAuth.js";

const router = express.Router();

// Require admin session
router.use(sessionAuth);
router.use(adminOnly);

/* -------------------- COUNT ITEMS -------------------- */
router.get("/validate/count", async (req, res) => {
  try {
    const [[bidCount]] = await pool.query(
      `SELECT COUNT(*) AS count
FROM listings
WHERE is_valid = 1
  AND listing_type = 'bid';`
    );

    res.json({
      success: true,
      total: bidCount.count,
      bids: bidCount.count,
    });
  } catch (err) {
    console.error("Count items error:", err);
    res.status(500).json({ success: false });
  }
});

/* -------------------- FETCH ITEMS -------------------- */
router.get("/validate/items", async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
    l.listing_id AS id,
    MAX(li.name) AS name,
    MAX(b.start_bid) AS price,
    MAX(img.image_path) AS image,
    'BID' AS type
FROM listings l
JOIN listing_items li 
    ON li.listing_id = l.listing_id
LEFT JOIN bids b 
    ON b.listing_id = l.listing_id
LEFT JOIN listing_images img 
    ON img.listing_id = l.listing_id
WHERE l.is_valid = 1
  AND l.listing_type = 'bid'
GROUP BY l.listing_id;

      `);
  
      res.json({ success: true, items: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  });
  

/* -------------------- APPROVE ITEM -------------------- */
router.post("/validate/:type/:id/approve", async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === "BID") {
      await pool.query(`UPDATE listings SET is_valid = 0 WHERE listing_id = ?`, [id]);
    }  else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Approve item error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
