import express from "express";
import pool from "../model/admin/db.js";
import { sessionAuth, adminOnly } from "../middleware/sessionAuth.js";

const router = express.Router();

router.use(sessionAuth);
router.use(adminOnly);

router.get("/dashboard", async (req, res) => {
  try {
    // TOTAL BIDS (COMPLETED AUCTIONS)
    const [bids] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM transactions 
      WHERE transaction_type = 'auction' AND status = 'completed'
    `);

    // TOTAL TRADES (COMPLETED BARTERS)
    const [trades] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM barters 
      WHERE status = 'completed'
    `);

    // TOTAL MEMBERS (STUDENTS ONLY)
    const [members] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM users 
      WHERE role = 'student'
    `);

    // TOTAL ADMINS
    const [admins] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM users 
      WHERE role = 'admin'
    `);

    // TO VALIDATE (INVALID LISTINGS)
    const [validate] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM listings 
      WHERE is_valid = 0
    `);

    res.json({
      success: true,
      admin: req.session.admin,
      totalBids: bids[0].count,
      totalTrades: trades[0].count,
      totalMembers: members[0].count,
      totalAdmins: admins[0].count,
      toValidate: validate[0].count,
      toReview: 0
    });
    

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
