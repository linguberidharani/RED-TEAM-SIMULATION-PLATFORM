const express = require('express');
const router = express.Router();
const { getStatus, resetSimulation } = require('../controllers/simulationController');

router.get('/status', getStatus);
router.post('/reset', resetSimulation);

module.exports = router;
