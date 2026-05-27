// In-memory data store — no DB required
// All state lives here; reset clears it back to defaults

const { v4: uuidv4 } = require('uuid');

const store = {
  // ── Existing simulation data (UNCHANGED) ─────────────────────
  devices: [
    { id: uuidv4(), name: 'WEB-SERVER-01', type: 'Server', status: 'safe', ip: '192.168.1.10', compromised: false, attackStages: [] },
    { id: uuidv4(), name: 'DB-SERVER-02', type: 'Database', status: 'safe', ip: '192.168.1.20', compromised: false, attackStages: [] },
    { id: uuidv4(), name: 'WORKSTATION-01', type: 'PC', status: 'safe', ip: '192.168.1.30', compromised: false, attackStages: [] },
  ],

  logs: [
    {
      id: uuidv4(),
      type: 'INFO',
      message: 'Simulation platform initialized. All systems nominal.',
      timestamp: new Date().toISOString(),
      deviceId: null,
    }
  ],

  attackStages: [],
  riskLevel: 'LOW',
  riskExplanation: 'No attacks detected. All devices are secure.',
  simulationRunning: false,

  // ── NEW: User accounts ────────────────────────────────────────
  // Each user: { id, email, passwordHash, name, verified, role, createdAt }
  users: [],

  // ── NEW: OTP records ─────────────────────────────────────────
  // Each record: { email, otp, expiresAt, purpose: 'register'|'login' }
  otpStore: [],
};

// ── Existing helpers (UNCHANGED) ─────────────────────────────────
store.addLog = function (type, message, deviceId = null) {
  const entry = {
    id: uuidv4(),
    type,
    message,
    timestamp: new Date().toISOString(),
    deviceId,
  };
  this.logs.push(entry);
  return entry;
};

store.getDevice = function (deviceId) {
  return this.devices.find(d => d.id === deviceId);
};

store.reset = function () {
  this.devices.forEach(d => {
    d.status = 'safe';
    d.compromised = false;
    d.attackStages = [];
  });
  this.logs = [{
    id: uuidv4(),
    type: 'INFO',
    message: 'Simulation RESET. All systems restored to baseline.',
    timestamp: new Date().toISOString(),
    deviceId: null,
  }];
  this.attackStages = [];
  this.riskLevel = 'LOW';
  this.riskExplanation = 'Simulation reset. No active threats detected.';
  this.simulationRunning = false;
  // NOTE: users and otpStore are NOT cleared on simulation reset
};

// ── NEW: User helpers ─────────────────────────────────────────────
store.findUserByEmail = function (email) {
  return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

store.createUser = function ({ email, passwordHash, name }) {
  const user = {
    id: uuidv4(),
    email: email.toLowerCase(),
    passwordHash,
    name: name || email.split('@')[0],
    verified: false,
    role: 'analyst',
    createdAt: new Date().toISOString(),
  };
  this.users.push(user);
  return user;
};

// ── NEW: OTP helpers ──────────────────────────────────────────────
store.saveOtp = function (email, otp, purpose = 'register') {
  // Remove any existing OTP for this email+purpose
  this.otpStore = this.otpStore.filter(
    o => !(o.email.toLowerCase() === email.toLowerCase() && o.purpose === purpose)
  );
  const record = {
    email: email.toLowerCase(),
    otp,
    purpose,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
  };
  this.otpStore.push(record);
  return record;
};

store.verifyOtp = function (email, otp, purpose = 'register') {
  const record = this.otpStore.find(
    o => o.email.toLowerCase() === email.toLowerCase() && o.purpose === purpose
  );
  if (!record) return { valid: false, reason: 'No OTP found for this email' };
  if (new Date() > new Date(record.expiresAt)) {
    this.otpStore = this.otpStore.filter(o => o !== record);
    return { valid: false, reason: 'OTP has expired' };
  }
  if (record.otp !== otp) return { valid: false, reason: 'Incorrect OTP' };

  // OTP used — delete it
  this.otpStore = this.otpStore.filter(o => o !== record);
  return { valid: true };
};

module.exports = store;