const axios = require('axios');

async function sendReportEmail(recipientEmail, pdfBase64, riskLevel, compromisedCount) {
  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "Red Team Platform",
        email: process.env.MAIL_USER,
      },
      to: [
        {
          email: recipientEmail,
        },
      ],
      subject: `🔴 [REDTEAM REPORT] Risk Level: ${riskLevel}`,
      htmlContent: `
      <div style="font-family:Arial;padding:20px">
        <h2>Red Team Simulation Report</h2>

        <p><b>Risk Level:</b> ${riskLevel}</p>

        <p><b>Compromised Devices:</b> ${compromisedCount}</p>

        <p>Generated at ${new Date().toLocaleString()}</p>
      </div>
      `,
      attachment: [
        {
          name: `redteam-report-${Date.now()}.pdf`,
          content: pdfBase64,
        },
      ],
    },
    {
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
    }
  );

  console.log("Report email sent:", response.data);

  return response.data;
}

module.exports = { sendReportEmail };