// models/Affirmation.js
const db = require("../db/db");
const Affirmation = {
  getAll: (callback) => {
    const query = "SELECT * FROM affirmations";
    db.query(query, (err, results) => {
      if (err) {
        return callback(err);
      }
      return callback(null, results);
    });
  },
};

module.exports = Affirmation;
