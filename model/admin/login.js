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
        // Fetch user by email
        const [rows] = await pool.query(
            `SELECT user_idnum, first_name, last_name, password_hash, email, role 
             FROM users WHERE email = ? LIMIT 1`,
            [email]
        );

        if (rows.length === 0) {
            // User not found → let front-end try PHP
            return res.json({ success: false });
        }

        const user = rows[0];

        // Only handle admin accounts
        if (user.role !== "admin") {
            return res.json({ success: false });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.json({
                success: false,
                error: "Incorrect password."
            });
        }

        // Set session for admin
        req.session.user = {
            id: user.user_idnum,
            email: user.email,
            role: user.role,
            name: `${user.first_name} ${user.last_name}`
        };

        // Redirect for admin
        const redirect = "/PayBach/views/pages/admin/admin_homepage.html";

        return res.json({
            success: true,
            role: user.role,
            redirect
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
