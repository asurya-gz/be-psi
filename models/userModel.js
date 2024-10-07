// models/userModel.js
const db = require("../db/db"); // Mengimpor koneksi ke database
const bcrypt = require("bcrypt"); // Untuk hashing password
const jwt = require("jsonwebtoken"); // Import jsonwebtoken

// Mendapatkan semua pengguna
const getAllUsers = (callback) => {
  db.query("SELECT * FROM users", callback);
};

// Menambah pengguna
const addUser = (userData, callback) => {
  const { username, password, email } = userData; // Hapus notification_interval
  // Hash password sebelum menyimpan ke database
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return callback(err);
    }
    const query =
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
    db.query(query, [username, hashedPassword, email], callback);
  });
};

const loginUser = (email, password, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      return callback(err);
    }

    if (results.length === 0) {
      return callback(null, false);
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return callback(err);
      }

      if (isMatch) {
        // Buat token JWT
        const token = jwt.sign(
          { id: user.id, email: user.email },
          "user123",
          { expiresIn: "7d" }
        );
        return callback(null, { user, token }); // Kembalikan user dan token
      } else {
        return callback(null, false);
      }
    });
  });
};

const changePassword = (userId, newPassword, callback) => {
    // Hash password baru sebelum menyimpannya di database
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return callback(err);
      }
      const query = "UPDATE users SET password = ? WHERE id = ?";
      db.query(query, [hashedPassword, userId], callback);
    });
  };
  
  module.exports = { getAllUsers, addUser, loginUser, changePassword };
