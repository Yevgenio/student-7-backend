const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // google strategy
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client('148902254409-uq64ellll31au13423122frfb7cjalnd.apps.googleusercontent.com');

exports.googleLogin = async (req, res) => {
  const { googleToken } = req.body;

  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: '148902254409-uq64ellll31au13423122frfb7cjalnd.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const avatar = payload.picture;

    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user if they don't exist
      user = new User({
        username: name,
        email,
        avatar,
        authProvider: 'google',
      });
      await user.save();
    }

    // Generate JWT tokens
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '180d' });

    res.status(200).json({ token, refreshToken });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(401).json({ message: 'Invalid Google token', error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: 'User created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    // Access token (1-hour expiration)
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Refresh token (6-month expiration)
    const refreshToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '180d' } // 6 months
    );

    res.status(200).json({ token, refreshToken });    
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.settings = async (req, res) => {
  try {
    // Check if the Authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    // Extract token from the Authorization header
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find the user by ID and exclude the password field
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Respond with the user data
    res.json(user);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error', error });
  }
}

exports.refreshToken = async (req, res) => {
  try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
          return res.status(400).json({ message: 'Refresh token is required' });
      }

      // Verify the refresh token
      jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
          if (err) {
              return res.status(403).json({ message: 'Invalid refresh token' });
          }

          // Check if user exists
          const user = await User.findById(decoded.userId);
          if (!user) {
              return res.status(404).json({ message: 'User not found' });
          }

          // Generate a new access token
          const newAccessToken = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET,
              { expiresIn: '1h' }
          );

          res.status(200).json({ token: newAccessToken });
      });
  } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
