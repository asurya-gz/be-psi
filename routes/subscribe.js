// routes/subscribe.js
const express = require("express");
const db = require("../db/db"); // Pastikan Anda sudah mengkonfigurasi db
const router = express.Router();

// Endpoint untuk menyimpan subscription
router.post("/subscribe", async (req, res) => {
    const { endpoint, keys } = req.body;

    // Ambil user_id dari cookie atau session, sesuaikan dengan logika aplikasi Anda
    const user_id = req.userId; // Anda perlu menyesuaikan ini sesuai dengan cara Anda mengambil user_id

    try {
        // Simpan subscription ke database
        const result = await db.query("INSERT INTO subscriptions (user_id, endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, ?, NOW())", [
            user_id,
            endpoint,
            keys.p256dh,
            keys.auth
        ]);

        res.status(201).json({ message: "Subscription saved successfully", subscriptionId: result.insertId });
    } catch (error) {
        console.error("Error saving subscription:", error);
        res.status(500).json({ message: "Failed to save subscription" });
    }
});

module.exports = router;
