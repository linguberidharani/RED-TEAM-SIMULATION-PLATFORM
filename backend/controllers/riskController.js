const store = require('../utils/store');
const { calculateRisk } = require('../utils/riskEngine');

const getRisk = (req, res) => {
  const result = calculateRisk();
  res.json(result);
};

const getRiskSummary = (req, res) => {
  const result = calculateRisk();
  const stageBreakdown = {};

  store.attackStages.forEach(s => {
    stageBreakdown[s.stage] = (stageBreakdown[s.stage] || 0) + 1;
  });

  res.json({
    ...result,
    stageBreakdown,
    affectedDevices: store.devices.filter(d => d.compromised).map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      stages: d.attackStages,
    })),
    totalLogs: store.logs.length,
    criticalEvents: store.logs.filter(l => l.type === 'CRITICAL').length,
  });
};

module.exports = { getRisk, getRiskSummary };
