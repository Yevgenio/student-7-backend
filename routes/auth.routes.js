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
router.post('/google/android', async (req, res) => {
    try {
      console.log('Request received at /google/android:', req.body);
  
      const { idToken } = req.body;
      if (!idToken) {
        console.error('ID Token is missing');
        return res.status(400).json({ message: 'ID token is required' });
      }
  
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_ANDROID_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      console.log('Verified payload:', payload);
  
      const email = payload.email;
      let user = await User.findOne({ email });
  
      if (!user) {
        user = new User({
          username: payload.name,
          email: payload.email,
          avatar: payload.picture,
        });
        await user.save();
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '180d' });
  
      res.json({ token, refreshToken });
    } catch (err) {
      console.error('Error during Google login:', err);
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