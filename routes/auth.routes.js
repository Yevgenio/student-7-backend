const express = require('express');
const router = express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const authController = require('../controllers/auth.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// const User = require('../models/user.model');

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/settings', verifyToken, authController.settings);

router.get('/profile', verifyToken, authController.settings);

router.post('/refresh', authController.refreshToken);

// router.get('/is-admin', authController.isAdmin)

// google login route ===========================================================
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google Login Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback Route
router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
        // Generate tokens
        const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '180d' }); // 6 months
        res.json({ token, refreshToken });
    }
);

router.get('/google/android', passport.authenticate('google-android', { scope: ['profile', 'email'] }));
router.get('/google/android/callback', passport.authenticate('google-android', { session: false }), (req, res) => {
    // Handle tokens and login success
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '180d' });

    res.json({ token, refreshToken });
});


module.exports = router;