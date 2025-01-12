const express = require('express');
const router = express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const authController = require('../controllers/auth.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

const passport = require('passport'); // google strategy
const jwt = require('jsonwebtoken'); // google strategy

// const User = require('../models/user.model');

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/settings', verifyToken, authController.settings);

router.get('/profile', verifyToken, authController.settings);

router.post('/refresh', authController.refreshToken);

// router.get('/is-admin', authController.isAdmin)

router.post('/google-login', authController.googleLogin);

module.exports = router;