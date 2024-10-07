// routes/userAffirmationRoutes.js
const express = require("express");
const userAffirmationController = require("../controllers/userAffirmationController");
const authenticate = require("../middleware/authenticate"); // Mengimpor middleware untuk autentikasi
const router = express.Router();

// Endpoint untuk menambah afirmasi pengguna
router.post("/", authenticate, userAffirmationController.addUserAffirmation);

// Endpoint untuk mengambil afirmasi pengguna
router.get("/", authenticate, userAffirmationController.fetchUserAffirmations);

// Endpoint untuk membatalkan afirmasi
router.delete(
  "/:id",
  authenticate,
  userAffirmationController.removeAffirmation
);

module.exports = router;
