import express from "express";
import bcrypt from "bcrypt";
import pool from "./db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("LOGIN REQUEST BODY:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      error: "Email and password are required."
    });
  }

  try {
    // Fetch user
    const [rows] = await pool.query(
      `SELECT user_idnum, first_name, last_name, password_hash, email, role
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.json({ success: false });
    }

    const user = rows[0];

    // Admin only
    if (user.role !== "admin") {
      return res.json({ success: false });
    }

    // Compare bcrypt hash
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.json({
        success: false,
        error: "Incorrect password."
      });
    }

    // SET SESSION AFTER VALIDATION
    req.session.user = {
      id: user.user_idnum,
      email: user.email,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`
    };

    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to save session"
        });
      }

      return res.json({
        success: true,
        role: user.role,
        redirect: "/PayBach/views/pages/admin/admin_homepage.html",
        user: req.session.user
      });
    });

  } catch (err) {
    console.error("Node.js login error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error."
    });
  }
});

export default router;
