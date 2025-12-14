// routes/history.route.js
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');

router.get('/user/:userId', historyController.getUserHistory);
router.get('/stats/:userId', historyController.getUserStats); // ✅ Ajouter
router.post('/', historyController.addHistory);

module.exports = router;