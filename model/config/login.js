import express from "express";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
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
            return res.json({
                success: false,
                error: "Account not found."
            });
        }

        const user = rows[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.json({
                success: false,
                error: "Incorrect password."
            });
        }

        // Set session values
        req.session.UserID = user.user_idnum;
        req.session.UserEmail = user.email;
        req.session.UserName = `${user.first_name} ${user.last_name}`;
        req.session.UserType = user.role;

        // Determine redirect URL
        const redirect =
            user.role === "admin"
                ? "/PayBach/views/pages/admin/validate_listing.html"
                : "/PayBach/views/pages/client/homepage.html";

        return res.json({
            success: true,
            redirect,
            message: "Login successful."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Server error."
        });
    }
});

export default router;
