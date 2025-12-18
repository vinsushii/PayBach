import bcrypt from "bcryptjs";

const password = "admin123"; // choose your desired admin password
const hash = await bcrypt.hash(password, 10);
console.log("Use this hash in MySQL:", hash);