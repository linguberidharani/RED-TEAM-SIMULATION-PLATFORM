const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,   // your Gmail address
    pass: process.env.MAIL_PASS,   // your Gmail App Password
  },
});

async function sendReportEmail(recipientEmail, pdfBase64, riskLevel, compromisedCount) {
  const mailOptions = {
    from: `"RedTeam Sim Platform" <${process.env.MAIL_USER}>`,
    to: recipientEmail,
    subject: `🔴 [REDTEAM REPORT] Risk Level: ${riskLevel} — Simulation Complete`,
    html: `
      <div style="font-family: monospace; background: #080c10; color: #c9d1d9; padding: 32px; border-radius: 8px;">
        <h2 style="color: #00ff88; letter-spacing: 4px;">RED TEAM SIMULATION REPORT</h2>
        <hr style="border-color: #1e2d3d;" />
        <p>A simulation has completed. Please review the attached PDF report.</p>
        <table style="margin-top: 16px; border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; color: #4a6270;">Risk Level</td>
            <td style="padding: 8px; color: ${riskLevel === 'CRITICAL' ? '#ff3b3b' : riskLevel === 'HIGH' ? '#ff7800' : riskLevel === 'MEDIUM' ? '#ffd60a' : '#00ff88'}; font-weight: bold;">
              ${riskLevel}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #4a6270;">Compromised Devices</td>
            <td style="padding: 8px; color: #ff3b3b;">${compromisedCount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #4a6270;">Generated</td>
            <td style="padding: 8px;">${new Date().toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #4a6270;">Platform</td>
            <td style="padding: 8px;">AI-Assisted RedTeam Simulation v1.0</td>
          </tr>
        </table>
        <hr style="border-color: #1e2d3d; margin-top: 24px;" />
        <p style="color: #4a6270; font-size: 11px;">
          ⚠ SIMULATION ONLY — This report was generated from a safe, educational simulation environment.
          No real systems were compromised.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `redteam-report-${Date.now()}.pdf`,
        content: pdfBase64,
        encoding: 'base64',
        contentType: 'application/pdf',
      },
    ],
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendReportEmail };