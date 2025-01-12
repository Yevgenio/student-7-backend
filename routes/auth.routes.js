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
//router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// Google login for Android
router.post('/google/web', passport.authenticate('google', { session: false }), (req, res) => {
    // Generate and return tokens after successful login
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '180d' });

    res.json({ token, refreshToken });
});


// Google Callback Route
router.get('/google/web/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
        // Generate tokens
        const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '180d' }); // 6 months
        res.json({ token, refreshToken });
    }
);

//router.get('/google/android', passport.authenticate('google-android', { scope: ['profile', 'email'] }));

// Google login for Android
router.post('/google/android', passport.authenticate('google-android', { session: false }), async (req, res) => {
    try {
        // Log the incoming request for debugging
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);

        // Authentication logic (e.g., token validation, user creation)
        const user = await User.findOne({ email: req.body.email }); // Example logic
        if (!user) {
            throw new Error('User not found');
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '180d' });

        res.json({ token, refreshToken });
    } catch (err) {
        console.error('Google login failed:', err.message); // Log error for debugging
        res.status(500).json({ message: 'Google login failed', error: err.message });
    }
});


router.get('/google/android/callback', passport.authenticate('google-android', { session: false }), (req, res) => {
    // Handle tokens and login success
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '180d' });

    res.json({ token, refreshToken });
});


module.exports = router;