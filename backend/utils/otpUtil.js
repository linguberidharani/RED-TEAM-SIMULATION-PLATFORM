const axios = require("axios");

// Generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP using Brevo Email API
async function sendOtpEmail(toEmail, otp, purpose = "register") {
  const isLogin = purpose === "login";

  const subject = isLogin
    ? "🔐 RedTeam Platform - Login Verification Code"
    : "🔐 RedTeam Platform - Account Verification Code";

  const action = isLogin
    ? "complete your login"
    : "verify your account";

  const html = `
    <div style="font-family:Arial,sans-serif;background:#080c10;color:#c9d1d9;padding:30px;">
      <div style="max-width:600px;margin:auto;background:#111827;padding:25px;border-radius:10px;">
        <h2 style="color:#00ff88;text-align:center;">
          Red Team Simulation Platform
        </h2>

        <p>Hello,</p>

        <p>Use the OTP below to <strong>${action}</strong>.</p>

        <div style="text-align:center;margin:30px 0;">
          <span style="
            font-size:34px;
            font-weight:bold;
            letter-spacing:8px;
            color:#00ff88;
          ">
            ${otp}
          </span>
        </div>

        <p>
          This OTP will expire in <strong>5 minutes</strong>.
        </p>

        <p>
          If you did not request this email, please ignore it.
        </p>

        <hr>

        <p style="font-size:12px;color:gray;">
          AI Assisted Red Team Simulation Platform
        </p>
      </div>
    </div>
  `;

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Red Team Platform",
          email: process.env.MAIL_USER
        },
        to: [
          {
            email: toEmail
          }
        ],
        subject,
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ OTP email sent:", response.data);
  } catch (err) {
    console.error(
      "❌ Brevo Email Error:",
      err.response?.data || err.message
    );
    throw new Error("Unable to send OTP email.");
  }
}

module.exports = {
  generateOtp,
  sendOtpEmail,
};