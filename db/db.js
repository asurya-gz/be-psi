const mysql = require("mysql2");
const dotenv = require("dotenv");

// Memuat variabel dari file .env
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // Pastikan ini ada jika menggunakan port yang bukan default
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Koneksi ke database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err.stack);
    return;
  }
  console.log("Connected to MySQL database as id " + connection.threadId);
});

// Ekspor koneksi untuk digunakan di file lain
module.exports = connection;
