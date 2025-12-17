import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import cors from "cors";
import pool from "./model/admin/db.js";
import adminDashboardRoutes from "./routes/adminDashboard.js";
import adminValidateRoutes from "./routes/adminValidateItems.js";

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
app.use(cors({
  origin: "http://localhost",
  credentials: true
}));
app.use(session({
  name: "paybach.sid",
  secret: "paybach_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 }
}));

/* -------------------- ROUTES -------------------- */
// Mount routers at top level
app.use("/api/admin", adminDashboardRoutes);
app.use("/admin", adminValidateRoutes);

/* -------------------- LOGIN (ADMIN ONLY) -------------------- */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      "SELECT user_idnum, email, password_hash, role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) return res.json({ success: false });

    const user = rows[0];
    if (user.role !== "admin") return res.json({ success: false });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.json({ success: false });

    req.session.admin = { user_idnum: user.user_idnum, email: user.email, role: user.role };

    res.json({
      success: true,
      role: "admin",
      redirect: "/PayBach/views/pages/admin/admin_homepage.html"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* -------------------- FETCH CURRENT ADMIN (/me) -------------------- */
app.get("/api/admin/me", (req, res) => {
  if (!req.session.admin) return res.status(401).json({ loggedIn: false });
  res.json({ loggedIn: true, admin: req.session.admin });
});

/* -------------------- LOGOUT -------------------- */
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("paybach.sid");
    res.json({ success: true });
  });
});

/* -------------------- SERVER -------------------- */
app.listen(3000, () => console.log("Admin server running on http://localhost:3000"));
