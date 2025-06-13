const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { initModel } = require('../models/user');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const User = await initModel();
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Local Strategy for username/password authentication
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const User = await initModel();
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// GitHub OAuth Strategy (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const User = await initModel();
      // Check if user already exists with this GitHub ID
      let user = await User.findOne({ githubId: profile.id });
      if (user) {
        return done(null, user);
      }
      // Check if user exists with this email
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || '';
      user = await User.findOne({ email });
      if (user) {
        // Link GitHub account to existing user
        user.githubId = profile.id;
        user.profilePicture = user.profilePicture || (profile.photos && profile.photos[0] && profile.photos[0].value) || '';
        await user.save();
        return done(null, user);
      }
      // Create new user
      const newUser = new User({
        githubId: profile.id,
        username: profile.username || (email ? email.split('@')[0] : 'github_' + profile.id),
        email,
        password: 'oauth_user_' + Math.random().toString(36).substring(7), // Random password for OAuth users
        firstName: profile.displayName || 'GitHub',
        lastName: '',
        profilePicture: (profile.photos && profile.photos[0] && profile.photos[0].value) || '',
        authProvider: 'github',
        isEmailVerified: true
      });
      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.log('ℹ️  GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable GitHub authentication.');
}

module.exports = passport; 