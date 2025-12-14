import express from "express";
import session from "express-session";
import cors from "cors";
import loginRoute from "./model/admin/login.js";

const app = express();

app.use(cors({
    origin: "http://localhost", // Apache frontend
    credentials: true
}));

app.use(express.json());

app.use(session({
    name: "paybach.sid",
    secret: "paybach_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,     // http only
        httpOnly: true,
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

// Login API
app.use("/api/login", loginRoute);

// Test session (optional but useful)
app.get("/api/session", (req, res) => {
    res.json(req.session);
});

app.listen(3000, () => {
    console.log("Node Admin Server running on http://localhost:3000");
});
