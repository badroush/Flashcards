// routes/user.route.js
const express = require('express');
const router = express.Router();

// Route temporaire (tu l’as déjà créée précédemment)
router.get('/', (req, res) => {
  res.json({ status: 'success', data: [] });
});

module.exports = router;