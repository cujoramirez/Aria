const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.me);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.put('/preferences', AuthController.updatePreferences);

module.exports = router;