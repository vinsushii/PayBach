import express from "express";
import pool from "../model/admin/db.js";
import { sessionAuth, adminOnly } from "../middleware/sessionAuth.js";

const router = express.Router();

router.use(sessionAuth);
router.use(adminOnly);

/* ===================== METRICS ===================== */
router.get("/metrics", async (req, res) => {
  const { type } = req.query;

  try {
    /* ---------- SUMMARY ---------- */
    if (type === "SUMMARY") {
        const [[users]] = await pool.query(`SELECT COUNT(*) AS total_users FROM users`);
      
        const [[activeUsers]] = await pool.query(`
          SELECT COUNT(DISTINCT user_idnum) AS active_users
          FROM user_sessions
          WHERE logout_time IS NULL
        `);
      
        const [[newUsers]] = await pool.query(`
          SELECT COUNT(*) AS new_users
          FROM users
          WHERE DATE(created_at) = CURDATE()
        `);
      
        const [[listings]] = await pool.query(`SELECT COUNT(*) AS total_listings FROM listings`);
      
        const [[activeListings]] = await pool.query(`
          SELECT COUNT(*) AS active_listings
          FROM listings
          WHERE is_valid = 1
        `);
      
        const [[transactions]] = await pool.query(`
          SELECT COUNT(*) AS completed_transactions,
                 IFNULL(SUM(current_amount),0) AS total_sales,
                 IFNULL(AVG(current_amount),0) AS avg_value
          FROM bids
          WHERE bid_status = 'CLOSED'
        `);
      
        return res.json({
          success: true,
          data: {
            total_users: users.total_users,
            active_users: activeUsers.active_users,
            new_users: newUsers.new_users,
            total_listings: listings.total_listings,
            active_listings: activeListings.active_listings,
            completed_transactions: transactions.completed_transactions,
            total_sales: transactions.total_sales,
            average_transaction_value: transactions.avg_value
          }
        });
      }
      

    /* ---------- USER ---------- */
    if (type === "USER") {
      const [rows] = await pool.query(`
        SELECT 
          session_id,
          user_idnum,
          login_time,
          last_activity,
          logout_time
        FROM user_sessions
        ORDER BY login_time DESC
      `);

      return res.json({ success: true, data: rows });
    }

    /* ---------- TRANSACTION ---------- */
    if (type === "TRANSACTION") {
      const [rows] = await pool.query(`
        SELECT
          l.listing_id,
          b.current_highest_bidder AS buyer_id,
          l.listing_type,
          li.name AS item_name,
          b.start_bid,
          b.current_amount AS final_price,
          b.bid_datetime AS transaction_date,
          l.status,
          l.created_at
        FROM listings l
        JOIN listing_items li ON li.listing_id = l.listing_id
        LEFT JOIN bids b ON b.listing_id = l.listing_id
        ORDER BY transaction_date DESC
      `);

      return res.json({ success: true, data: rows });
    }

    res.status(400).json({ success: false, message: "Invalid type" });

  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
