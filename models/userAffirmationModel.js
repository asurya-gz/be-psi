// models/userAffirmationModel.js
const db = require("../db/db"); // Mengimpor koneksi ke database

// Menambah afirmasi pengguna
const addUserAffirmation = (userAffirmationData, callback) => {
  const { user_id, affirmation_id, notification_interval } =
    userAffirmationData;
  const query =
    "INSERT INTO user_affirmations (user_id, affirmation_id, notification_interval, created_at) VALUES (?, ?, ?, NOW())";
  db.query(query, [user_id, affirmation_id, notification_interval], callback);
};

// Mengambil afirmasi pengguna berdasarkan user_id
const getUserAffirmations = (userId, callback) => {
  const query = "SELECT * FROM user_affirmations WHERE user_id = ?";
  db.query(query, [userId], callback);
};

// Membatalkan afirmasi
const cancelAffirmation = (id, callback) => {
  const query = "DELETE FROM user_affirmations WHERE id = ?";
  db.query(query, [id], callback);
};

module.exports = {
  addUserAffirmation,
  getUserAffirmations,
  cancelAffirmation,
};
