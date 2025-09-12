const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
  const { imei, description } = req.body;

  if (!imei || !description) {
    return res.status(400).json({ message: 'IMEI and description required' });
  }

  // SQLite or PostgreSQL insert
  const query = process.env.NODE_ENV === 'production'
    ? 'INSERT INTO reports (imei, description) VALUES ($1, $2) RETURNING *'
    : 'INSERT INTO reports (imei, description) VALUES (?, ?)';

  const params = process.env.NODE_ENV === 'production'
    ? [imei, description]
    : [imei, description];

  if (process.env.NODE_ENV === 'production') {
    db.query(query, params)
      .then(result => res.status(201).json(result.rows[0]))
      .catch(err => res.status(500).json({ error: err.message }));
  } else {
    db.run(query, params, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, imei, description });
    });
  }
});

module.exports = router;
