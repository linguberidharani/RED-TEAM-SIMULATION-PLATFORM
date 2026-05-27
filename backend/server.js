require('dotenv').config();
const express = require('express');
const cors    = require('cors');

// ── Routes ───────────────────────────────────────────────────
const authRoutes       = require('./routes/auth');       // NEW — full auth system
const deviceRoutes     = require('./routes/devices');
const attackRoutes     = require('./routes/attack');
const logRoutes        = require('./routes/logs');
const riskRoutes       = require('./routes/risk');
const simulationRoutes = require('./routes/simulation');
const reportRoutes     = require('./routes/report');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ────────────────────────────────────────────────
app.use('/auth',       authRoutes);
app.use('/devices',    deviceRoutes);
app.use('/attack',     attackRoutes);
app.use('/logs',       logRoutes);
app.use('/risk',       riskRoutes);
app.use('/simulation', simulationRoutes);
app.use('/report',     reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🔴 RedTeam Platform running on http://localhost:${PORT}`);
  console.log(`🛡️  Auth: JWT + bcrypt + OTP`);
  console.log(`📧 Email: ${process.env.MAIL_USER || 'not configured'}\n`);
});