const nodemailer = require('nodemailer');
// ── Generate a 6-digit OTP ────────────────────────────────────
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
// ── Nodemailer transporter (reuse existing Gmail config) ──────
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("SMTP Server is ready.");
  }
});
// ── Send OTP email ────────────────────────────────────────────
async function sendOtpEmail(toEmail, otp, purpose = 'register') {
  const isLogin = purpose === 'login';
  const subject = isLogin
    ? '🔐 RedTeam Platform — Login Verification Code'
    : '🔐 RedTeam Platform — Account Verification Code';
  const action = isLogin ? 'complete your login' : 'verify your account';
  const html = `
    <div style="font-family:monospace;background:#080c10;color:#c9d1d9;padding:32px;border-radius:8px;max-width:480px;margin:0 auto;">
      <div style="border-left:4px solid #00ff88;padding-left:16px;margin-bottom:24px;">
        <h2 style="color:#00ff88;letter-spacing:3px;margin:0 0 4px 0;font-size:16px;">REDTEAM PLATFORM</h2>
        <p style="color:#4a6270;margin:0;font-size:12px;">AI-Assisted Red Team Simulation</p>
      </div>
      <p style="margin-bottom:20px;line-height:1.6;font-size:14px;">
        Use the verification code below to ${action}:
      </p>
      <div style="background:#0d1117;border:2px solid #00ff88;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#00ff88;">
          ${otp}
        </div>
        <div style="color:#4a6270;font-size:12px;margin-top:8px;">
          Expires in 5 minutes
        </div>
      </div>
      <p style="color:#4a6270;font-size:12px;line-height:1.6;">
        If you did not request this code, ignore this email.<br/>
        This code is valid for one use only.
      </p>
      <div style="border-top:1px solid #1e2d3d;margin-top:24px;padding-top:16px;">
        <p style="color:#4a6270;font-size:11px;margin:0;text-align:center;">
          RedTeam Simulation Platform · SIMULATION ONLY · Educational Use
        </p>
      </div>
    </div>
  `;
  await transporter.sendMail({
    from: `"RedTeam Platform" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
}
module.exports = { generateOtp, sendOtpEmail };
