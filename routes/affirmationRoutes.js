// routes/affirmationRoutes.js
const express = require('express');
const affirmationController = require('../controllers/affirmationController');

const router = express.Router();

// Rute untuk mendapatkan semua data afirmasi
router.get('/affirmations', affirmationController.getAffirmations);

module.exports = router;
