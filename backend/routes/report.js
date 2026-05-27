const express = require('express');
const router = express.Router();
const { sendReportEmail } = require('../utils/mailer');
const store = require('../utils/store');

router.post('/send', async (req, res) => {
  const { pdfBase64 } = req.body;

  if (!pdfBase64) {
    return res.status(400).json({ error: 'PDF data is required' });
  }

  const compromisedCount = store.devices.filter(d => d.compromised).length;

  try {
    await sendReportEmail(
      'dlinguberi@gmail.com',
      pdfBase64,
      store.riskLevel,
      compromisedCount
    );

    store.addLog('SUCCESS', `Report successfully emailed to dlinguberi@gmail.com (Risk: ${store.riskLevel})`);

    res.json({
      success: true,
      message: 'Report sent to dlinguberi@gmail.com',
      recipient: 'dlinguberi@gmail.com',
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
    res.status(500).json({
      error: 'Failed to send email',
      detail: err.message,
    });
  }
});

module.exports = router;