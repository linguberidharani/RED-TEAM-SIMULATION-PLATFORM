const express = require('express');
const router = express.Router();
const { getLogs, clearLogs } = require('../controllers/logController');

router.get('/', getLogs);
router.delete('/', clearLogs);

module.exports = router;
