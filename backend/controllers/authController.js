const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const store  = require('../utils/store');
const { generateOtp, sendOtpEmail } = require('../utils/otpUtil');

// ── Helper: sign JWT ──────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'redteam_dev_secret_change_in_prod',
    { expiresIn: '7d' }
  );

// ── Helper: safe user object (no password) ────────────────────
const safeUser = (user) => ({
  id:        user.id,
  email:     user.email,
  name:      user.name,
  role:      user.role,
  verified:  user.verified,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────
// POST /auth/register
// Body: { email, password, confirmPassword, name? }
// Creates account (unverified) then sends OTP
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { email, password, confirmPassword, name } = req.body;

    // Basic validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Email, password and confirm password are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check if email already used
    if (store.findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (unverified)
    const user = store.createUser({ email, passwordHash, name });

    // Generate and send OTP
    const otp = generateOtp();
    store.saveOtp(email, otp, 'register');

    await sendOtpEmail(email, otp, 'register');

    console.log(`[Auth] New user registered: ${email} | OTP sent`);

    res.status(201).json({
      message: 'Account created. Check your email for the 6-digit verification code.',
      email,   // Return email so frontend knows where OTP was sent
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /auth/send-otp
// Body: { email, purpose: 'register' | 'login' }
// Resend OTP (or send login OTP after password check)
// ─────────────────────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { email, purpose = 'register' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = store.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'No account found with this email.' });

    const otp = generateOtp();
    store.saveOtp(email, otp, purpose);
    await sendOtpEmail(email, otp, purpose);

    console.log(`[Auth] OTP sent to ${email} for purpose: ${purpose}`);

    res.json({ message: `Verification code sent to ${email}` });
  } catch (err) {
    console.error('[Auth] Send OTP error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP. Check email configuration.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /auth/verify-otp
// Body: { email, otp, purpose: 'register' | 'login' }
// Verifies OTP — for 'register': marks account verified
// ─────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose = 'register' } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

    const result = store.verifyOtp(email, otp.trim(), purpose);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }

    const user = store.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Mark account as verified after registration OTP
    if (purpose === 'register') {
      user.verified = true;
    }

    // Issue JWT — OTP verified means we can log them in
    const token = signToken(user);
    console.log(`[Auth] OTP verified for ${email} (${purpose})`);

    res.json({
      message: purpose === 'register' ? 'Account verified successfully!' : 'Login verified!',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('[Auth] Verify OTP error:', err.message);
    res.status(500).json({ error: 'OTP verification failed.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /auth/login
// Body: { email, password }
// Step 1: check credentials → send OTP
// Step 2: frontend calls /auth/verify-otp with purpose: 'login'
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = store.findUserByEmail(email);

    // Generic error — don't reveal whether email exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.verified) {
      // Resend OTP so they can verify
      const otp = generateOtp();
      store.saveOtp(email, otp, 'register');
      await sendOtpEmail(email, otp, 'register');
      return res.status(403).json({
        error: 'Account not verified. A new verification code has been sent to your email.',
        needsVerification: true,
        email,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Password correct — send OTP for 2FA
    const otp = generateOtp();
    store.saveOtp(email, otp, 'login');
    await sendOtpEmail(email, otp, 'login');

    console.log(`[Auth] Login OTP sent to ${email}`);

    res.json({
      message: 'Password verified. Check your email for the login code.',
      requiresOtp: true,
      email,
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /auth/me  (protected — requires JWT)
// ─────────────────────────────────────────────────────────────
const getMe = (req, res) => {
  const user = store.findUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: safeUser(user) });
};

module.exports = { register, sendOtp, verifyOtp, login, getMe };