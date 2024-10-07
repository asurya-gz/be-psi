const userModel = require("../models/userModel"); // Mengimpor model pengguna

// Mendapatkan semua pengguna
const getAllUsers = (req, res) => {
  userModel.getAllUsers((err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Menambah pengguna
const addUser = (req, res) => {
  userModel.addUser(req.body, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: results.insertId, username: req.body.username });
  });
};

// Login pengguna
const loginUser = (req, res) => {
  const { email, password } = req.body; 
  userModel.loginUser(email, password, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result && result.token) {
      // Jika pengguna ditemukan dan password cocok
      res.status(200).json({
        message: "Login sukses!",
        user: result.user,
        token: result.token,
      });
    } else {
      
      res.status(401).json({ message: "Email atau password salah." });
    }
  });
};

const changePassword = (req, res) => {
  const { password } = req.body; 
  const token = req.headers.authorization?.split(" ")[1]; 
  const userId = req.user.id; 
  userModel.changePassword(userId, password, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: "Password berhasil diubah." });
  });
};

module.exports = { getAllUsers, addUser, loginUser, changePassword };
