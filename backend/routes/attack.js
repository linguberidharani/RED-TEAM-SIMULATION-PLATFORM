const express = require('express');
const router = express.Router();
const { startAttack, escalateAttack, moveAttack, exfiltrateAttack } = require('../controllers/attackController');

router.post('/start', startAttack);
router.post('/escalate', escalateAttack);
router.post('/move', moveAttack);
router.post('/exfiltrate', exfiltrateAttack);

module.exports = router;
