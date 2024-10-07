// controllers/userAffirmationController.js
const userAffirmationModel = require("../models/userAffirmationModel"); // Mengimpor model user_affirmations

// Menambah afirmasi pengguna
const addUserAffirmation = (req, res) => {
  const userAffirmationData = {
    user_id: req.user.id, // Dapatkan user_id dari token JWT
    affirmation_id: req.body.affirmation_id,
    notification_interval: req.body.notification_interval,
  };

  // Cek apakah afirmasi sudah ada
  userAffirmationModel.getUserAffirmations(
    userAffirmationData.user_id,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const existingAffirmation = results.find(
        (affirmation) =>
          affirmation.affirmation_id === userAffirmationData.affirmation_id
      );

      if (existingAffirmation) {
        return res.status(400).json({ message: "Afirmasi sudah ada." });
      }

      userAffirmationModel.addUserAffirmation(
        userAffirmationData,
        (err, results) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({
            message: "Afirmasi berhasil ditambahkan.",
            id: results.insertId,
          });
        }
      );
    }
  );
};

// Mengambil afirmasi pengguna
const fetchUserAffirmations = (req, res) => {
  const userId = req.user.id;

  userAffirmationModel.getUserAffirmations(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

// Membatalkan afirmasi
const removeAffirmation = (req, res) => {
  const { id } = req.params;

  userAffirmationModel.cancelAffirmation(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Afirmasi berhasil dibatalkan." });
    } else {
      res.status(404).json({ message: "Afirmasi tidak ditemukan." });
    }
  });
};

module.exports = {
  addUserAffirmation,
  fetchUserAffirmations,
  removeAffirmation,
};
