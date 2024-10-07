// db.js
const mysql = require('mysql2');

// Membuat koneksi ke database
const connection = mysql.createConnection({
    host: 'localhost',       // Ganti dengan host database Anda
    user: 'root',   // Ganti dengan username database Anda
    password: 'BismillahKaya123', // Ganti dengan password database Anda
    database: 'katakitamah'     // Nama database yang telah Anda buat
});

// Koneksi ke database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
});

// Ekspor koneksi untuk digunakan di file lain
module.exports = connection;
