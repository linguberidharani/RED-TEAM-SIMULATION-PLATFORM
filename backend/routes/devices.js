const express = require('express');
const router = express.Router();
const { getDevices, addDevice, deleteDevice, getStats } = require('../controllers/deviceController');

router.get('/', getDevices);
router.post('/', addDevice);
router.delete('/:id', deleteDevice);
router.get('/stats', getStats);

module.exports = router;
