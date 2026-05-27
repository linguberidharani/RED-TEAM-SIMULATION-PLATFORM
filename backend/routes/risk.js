const express = require('express');
const router = express.Router();
const { getRisk, getRiskSummary } = require('../controllers/riskController');

router.get('/', getRisk);
router.get('/summary', getRiskSummary);

module.exports = router;
