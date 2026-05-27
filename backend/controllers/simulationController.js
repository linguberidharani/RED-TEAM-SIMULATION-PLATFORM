const store = require('../utils/store');

const getStatus = (req, res) => {
  const total = store.devices.length;
  const compromised = store.devices.filter(d => d.compromised).length;

  res.json({
    simulationRunning: store.simulationRunning,
    riskLevel: store.riskLevel,
    riskExplanation: store.riskExplanation,
    totalDevices: total,
    compromisedDevices: compromised,
    safeDevices: total - compromised,
    totalLogs: store.logs.length,
    attackStagesExecuted: store.attackStages.length,
  });
};

const resetSimulation = (req, res) => {
  store.reset();
  res.json({
    success: true,
    message: 'Simulation fully reset. All devices restored to safe state.',
    riskLevel: store.riskLevel,
  });
};

module.exports = { getStatus, resetSimulation };
