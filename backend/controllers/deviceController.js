const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const getDevices = (req, res) => {
  res.json({ devices: store.devices });
};

const addDevice = (req, res) => {
  const { name, type, ip } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Device name and type are required' });
  }

  const validTypes = ['Server', 'PC', 'Database', 'Router', 'Firewall'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });
  }

  const device = {
    id: uuidv4(),
    name: name.toUpperCase().replace(/\s+/g, '-'),
    type,
    status: 'safe',
    ip: ip || `192.168.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`,
    compromised: false,
    attackStages: [],
  };

  store.devices.push(device);
  store.addLog('INFO', `New device registered: ${device.name} (${device.type}) at ${device.ip}`);

  res.status(201).json({ device });
};

const deleteDevice = (req, res) => {
  const { id } = req.params;
  const index = store.devices.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const [removed] = store.devices.splice(index, 1);
  store.addLog('WARNING', `Device removed from inventory: ${removed.name}`);

  res.json({ success: true, removed });
};

const getStats = (req, res) => {
  const total = store.devices.length;
  const compromised = store.devices.filter(d => d.compromised).length;
  const safe = total - compromised;

  res.json({ total, compromised, safe, riskLevel: store.riskLevel });
};

module.exports = { getDevices, addDevice, deleteDevice, getStats };
