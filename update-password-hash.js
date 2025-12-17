// update-password-hash.js
import bcrypt from "bcryptjs";
import pool from "./model/admin/db.js";

async function updatePasswordHash() {
  try {
    const plainPassword = "Admin123"; // The correct password
    const saltRounds = 10;
    
    // Generate Node.js compatible hash
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    console.log("Generated Node.js hash:", hash);
    console.log("Hash starts with:", hash.substring(0, 4));
    
    // Update database
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hash, 'admin@paybach.com']
    );
    
    console.log('Password updated. Rows affected:', result.affectedRows);
    console.log('New password:', plainPassword);
    
    // Verify it works
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE email = ?',
      ['admin@paybach.com']
    );
    
    const storedHash = rows[0].password_hash;
    console.log("Stored hash:", storedHash);
    
    const isValid = await bcrypt.compare(plainPassword, storedHash);
    console.log('Verification:', isValid ? '✅ Password works!' : '❌ Failed');
    
    process.exit();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePasswordHash();