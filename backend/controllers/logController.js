const store = require('../utils/store');

const getLogs = (req, res) => {
  const { type, deviceId, limit } = req.query;
  let logs = [...store.logs].reverse(); // most recent first

  if (type) logs = logs.filter(l => l.type === type.toUpperCase());
  if (deviceId) logs = logs.filter(l => l.deviceId === deviceId);
  if (limit) logs = logs.slice(0, parseInt(limit));

  res.json({ logs, total: store.logs.length });
};

const clearLogs = (req, res) => {
  store.logs = [];
  store.addLog('INFO', 'Log history cleared by operator.');
  res.json({ success: true, message: 'Logs cleared' });
};

module.exports = { getLogs, clearLogs };
