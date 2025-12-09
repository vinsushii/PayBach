import express from "express";
import session from "express-session";
import cors from "cors";
import loginRoute from "../config/login.js";

const app = express();

app.use(cors({
    origin: "http://localhost:3000", // adjust if your frontend runs elsewhere
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: "your_secret_key_here", // change this to something secure
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // must be false for http
}));

// Register login route
app.use("/api/login", loginRoute);

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));
