// routes/users.js
const express = require("express");
const userController = require("../controllers/userController"); // Mengimpor controller pengguna
const router = express.Router();
const authenticate = require("../middleware/authenticate");

// Endpoint untuk mendapatkan semua pengguna
router.get("/", userController.getAllUsers);

// Endpoint untuk menambah pengguna
router.post("/", userController.addUser); 

// Endpoint untuk login pengguna
router.post("/login", userController.loginUser);

// Endpoint untuk mengubah password pengguna
router.put("/change-password", authenticate, userController.changePassword); 
module.exports = router; // Ekspor router
