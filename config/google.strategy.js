const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model'); // Adjust the path to your User model

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // From .env
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // From .env
    callbackURL: 'https://student-7.boukingolts.art/api/auth/google/callback', // Must match the redirect URI in Google Cloud Console
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create user
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            user = new User({
                username: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0]?.value,
            });
            await user.save();
        }
        return done(null, user); // Pass user to Passport
    } catch (err) {
        return done(err, null);
    }
}));
