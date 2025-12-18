// model/admin/db.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "paybach_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
