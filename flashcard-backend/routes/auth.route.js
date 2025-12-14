// routes/auth.route.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login); // ✅ Doit être présent

module.exports = router;