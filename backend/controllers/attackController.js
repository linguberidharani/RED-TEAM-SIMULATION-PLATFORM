const store = require('../utils/store');
const { calculateRisk } = require('../utils/riskEngine');

// Shared helper: validate device exists
function resolveDevice(deviceId, res) {
  if (!deviceId) {
    res.status(400).json({ error: 'deviceId is required' });
    return null;
  }
  const device = store.getDevice(deviceId);
  if (!device) {
    res.status(404).json({ error: 'Device not found' });
    return null;
  }
  return device;
}

// Stage 1 — Initial Access
const startAttack = (req, res) => {
  const { deviceId } = req.body;
  const device = resolveDevice(deviceId, res);
  if (!device) return;

  if (device.attackStages.includes('start')) {
    return res.status(409).json({ error: 'Initial access already performed on this device' });
  }

  // Simulate initial access
  device.status = 'compromised';
  device.compromised = true;
  device.attackStages.push('start');

  store.attackStages.push({ deviceId, stage: 'start', timestamp: new Date().toISOString() });

  const log1 = store.addLog('WARNING', `[INITIAL ACCESS] Phishing payload delivered to ${device.name} (${device.ip}). Backdoor shell established.`, deviceId);
  const log2 = store.addLog('CRITICAL', `[INITIAL ACCESS] Unauthorized session opened on ${device.name}. C2 beacon active.`, deviceId);

  store.simulationRunning = true;
  const risk = calculateRisk();

  res.json({
    success: true,
    stage: 'initial_access',
    device,
    risk,
    logs: [log1, log2],
  });
};

// Stage 2 — Privilege Escalation
const escalateAttack = (req, res) => {
  const { deviceId } = req.body;
  const device = resolveDevice(deviceId, res);
  if (!device) return;

  if (!device.attackStages.includes('start')) {
    return res.status(400).json({ error: 'Initial access must be performed first' });
  }
  if (device.attackStages.includes('escalate')) {
    return res.status(409).json({ error: 'Privilege escalation already performed on this device' });
  }

  device.attackStages.push('escalate');
  store.attackStages.push({ deviceId, stage: 'escalate', timestamp: new Date().toISOString() });

  const log1 = store.addLog('WARNING', `[PRIV ESC] Local exploit CVE-SIMULATED-001 triggered on ${device.name}. Attempting root access.`, deviceId);
  const log2 = store.addLog('CRITICAL', `[PRIV ESC] ROOT privileges obtained on ${device.name}. Attacker now has SYSTEM-level control.`, deviceId);

  const risk = calculateRisk();

  res.json({
    success: true,
    stage: 'privilege_escalation',
    device,
    risk,
    logs: [log1, log2],
  });
};

// Stage 3 — Lateral Movement
const moveAttack = (req, res) => {
  const { deviceId, targetDeviceId } = req.body;
  const source = resolveDevice(deviceId, res);
  if (!source) return;

  if (!source.attackStages.includes('escalate')) {
    return res.status(400).json({ error: 'Privilege escalation must be performed first' });
  }

  const targetDevice = targetDeviceId ? store.getDevice(targetDeviceId) : null;
  const target = targetDevice || store.devices.find(d => d.id !== deviceId && !d.compromised);

  if (!target) {
    return res.status(404).json({ error: 'No available target for lateral movement' });
  }

  source.attackStages.push('move');
  target.status = 'compromised';
  target.compromised = true;
  if (!target.attackStages.includes('start')) target.attackStages.push('start');

  store.attackStages.push({ deviceId, targetDeviceId: target.id, stage: 'move', timestamp: new Date().toISOString() });

  const log1 = store.addLog('WARNING', `[LATERAL MOVE] Credential harvesting from ${source.name} targeting internal network.`, deviceId);
  const log2 = store.addLog('CRITICAL', `[LATERAL MOVE] ${source.name} → ${target.name} pivot successful. New foothold established at ${target.ip}.`, target.id);

  const risk = calculateRisk();

  res.json({
    success: true,
    stage: 'lateral_movement',
    sourceDevice: source,
    targetDevice: target,
    risk,
    logs: [log1, log2],
  });
};

// Stage 4 — Data Exfiltration
const exfiltrateAttack = (req, res) => {
  const { deviceId } = req.body;
  const device = resolveDevice(deviceId, res);
  if (!device) return;

  if (!device.attackStages.includes('start')) {
    return res.status(400).json({ error: 'Device must be compromised before exfiltration' });
  }
  if (device.attackStages.includes('exfiltrate')) {
    return res.status(409).json({ error: 'Data already exfiltrated from this device' });
  }

  device.attackStages.push('exfiltrate');
  store.attackStages.push({ deviceId, stage: 'exfiltrate', timestamp: new Date().toISOString() });

  const dataTypes = ['customer PII records', 'internal credentials dump', 'financial transaction logs', 'proprietary source code', 'encryption keys'];
  const stolen = dataTypes[Math.floor(Math.random() * dataTypes.length)];

  const log1 = store.addLog('CRITICAL', `[EXFILTRATION] Data staging initiated on ${device.name}. Target: ${stolen}.`, deviceId);
  const log2 = store.addLog('CRITICAL', `[EXFILTRATION] Encrypted tunnel to external C2 established. ${stolen} transferred. Volume: ~${Math.floor(Math.random() * 500) + 50}MB.`, deviceId);

  const risk = calculateRisk();

  res.json({
    success: true,
    stage: 'data_exfiltration',
    device,
    stolenData: stolen,
    risk,
    logs: [log1, log2],
  });
};

module.exports = { startAttack, escalateAttack, moveAttack, exfiltrateAttack };
