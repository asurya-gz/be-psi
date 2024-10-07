// controllers/affirmationController.js
const Affirmation = require('../models/Affirmation');

const affirmationController = {
  getAffirmations: (req, res) => {
    Affirmation.getAll((err, affirmations) => {
      if (err) {
        return res.status(500).json({ error: 'Gagal mengambil data afirmasi' });
      }
      return res.json(affirmations);
    });
  },
};

module.exports = affirmationController;
