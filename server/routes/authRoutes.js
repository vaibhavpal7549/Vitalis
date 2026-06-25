const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signup, login, getMe, refreshToken, googleCallback, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { signupValidation, loginValidation } = require('../utils/validators');

router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.get('/me', auth, getMe);
router.post('/refresh', refreshToken);
router.put('/profile', auth, updateProfile);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

module.exports = router;
