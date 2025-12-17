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
      `SELECT COUNT(*) AS count FROM listings WHERE is_valid = 0`
    );
    const [[tradeCount]] = await pool.query(
      `SELECT COUNT(*) AS count FROM barters WHERE is_valid = 0`
    );

    res.json({
      success: true,
      total: bidCount.count + tradeCount.count,
      bids: bidCount.count,
      trades: tradeCount.count,
    });
  } catch (err) {
    console.error("Count items error:", err);
    res.status(500).json({ success: false });
  }
});

/* -------------------- FETCH ITEMS -------------------- */
router.get("/validate/items", async (req, res) => {
  const { type } = req.query; // BID | TRADE | ALL
  try {
    let results = [];

    if (!type || type === "BID" || type === "ALL") {
      const [bids] = await pool.query(
        `SELECT listing_id AS id, listing_name AS name, starting_price AS price, image_path AS image, 'BID' AS type 
         FROM listings 
         WHERE is_valid = 0`
      );
      results = results.concat(bids);
    }

    if (!type || type === "TRADE" || type === "ALL") {
      const [trades] = await pool.query(
        `SELECT barter_id AS id, item_name AS name, NULL AS price, image_path AS image, 'TRADE' AS type 
         FROM barters 
         WHERE is_valid = 0`
      );
      results = results.concat(trades);
    }

    res.json({ success: true, items: results });
  } catch (err) {
    console.error("Fetch items error:", err);
    res.status(500).json({ success: false });
  }
});

/* -------------------- APPROVE ITEM -------------------- */
router.post("/validate/:type/:id/approve", async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === "BID") {
      await pool.query(`UPDATE listings SET is_valid = 1 WHERE listing_id = ?`, [id]);
    } else if (type === "TRADE") {
      await pool.query(`UPDATE barters SET is_valid = 1 WHERE barter_id = ?`, [id]);
    } else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Approve item error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
