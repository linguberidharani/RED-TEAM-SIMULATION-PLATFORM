import { jsPDF } from 'jspdf';

// Color palette for PDF
const C = {
  bg: [8, 12, 16],
  surface: [13, 17, 23],
  accent: [0, 255, 136],
  red: [255, 59, 59],
  yellow: [255, 214, 10],
  white: [201, 209, 217],
  muted: [74, 98, 112],
  border: [30, 45, 61],
};

function riskColor(level) {
  if (level === 'CRITICAL') return C.red;
  if (level === 'HIGH')     return [255, 120, 0];
  if (level === 'MEDIUM')   return C.yellow;
  return C.accent;
}

function logColor(type) {
  if (type === 'CRITICAL') return C.red;
  if (type === 'WARNING')  return C.yellow;
  if (type === 'SUCCESS')  return C.accent;
  return C.white;
}

export function generateReport({ devices, logs, risk, summary }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 0;

  // ── helpers ──────────────────────────────────────
  const fill = (r, g, b) => doc.setFillColor(r, g, b);
  const stroke = (r, g, b) => doc.setDrawColor(r, g, b);
  const textC = (r, g, b) => doc.setTextColor(r, g, b);
  const rect = (x, ry, w, h, style = 'F') => doc.rect(x, ry, w, h, style);
  const line = (x1, y1, x2, y2) => doc.line(x1, y1, x2, y2);

  const newPage = () => {
    doc.addPage();
    // dark bg for new pages
    fill(...C.bg); rect(0, 0, W, H);
    y = 20;
  };

  const checkPage = (needed = 20) => {
    if (y + needed > H - 15) newPage();
  };

  // ── Page 1 — Cover ───────────────────────────────
  fill(...C.bg);    rect(0, 0, W, H);
  fill(...C.surface); rect(0, 0, W, 60);

  // Accent top bar
  fill(...C.accent); rect(0, 0, W, 3);

  textC(...C.accent);
  doc.setFontSize(22); doc.setFont('helvetica', 'bold');
  doc.text('RED TEAM SIMULATION REPORT', W / 2, 22, { align: 'center' });

  textC(...C.muted);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('AI-Assisted Red Team Simulation Platform — CONFIDENTIAL', W / 2, 30, { align: 'center' });

  textC(...C.white);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, W / 2, 38, { align: 'center' });
  doc.text(`Classification: INTERNAL USE ONLY`, W / 2, 45, { align: 'center' });

  // Risk badge
  const rc = riskColor(risk?.riskLevel || 'LOW');
  fill(...rc);
  doc.roundedRect(W / 2 - 28, 52, 56, 12, 2, 2, 'F');
  textC(...C.bg);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text(`RISK: ${risk?.riskLevel || 'UNKNOWN'}`, W / 2, 60, { align: 'center' });

  // Stats row
  y = 82;
  const stats = [
    { label: 'Total Devices', value: devices?.length || 0 },
    { label: 'Compromised', value: devices?.filter(d => d.compromised).length || 0 },
    { label: 'Attack Stages', value: summary?.attackStagesExecuted || 0 },
    { label: 'Critical Events', value: summary?.criticalEvents || 0 },
  ];

  const boxW = (W - 30) / 4;
  stats.forEach((s, i) => {
    const bx = 15 + i * (boxW + 2);
    fill(...C.surface); stroke(...C.border);
    doc.roundedRect(bx, y, boxW, 22, 2, 2, 'FD');

    textC(...rc);
    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text(String(s.value), bx + boxW / 2, y + 12, { align: 'center' });

    textC(...C.muted);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(s.label, bx + boxW / 2, y + 19, { align: 'center' });
  });

  // ── Section: Risk Analysis ───────────────────────
  y = 118;
  textC(...C.accent);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('01. RISK ANALYSIS', 15, y);
  fill(...C.border); rect(15, y + 2, W - 30, 0.5);
  y += 10;

  fill(...C.surface); stroke(...C.border);
  doc.roundedRect(15, y, W - 30, 22, 2, 2, 'FD');
  textC(...C.white);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  const explanation = risk?.explanation || 'No risk data available.';
  const lines = doc.splitTextToSize(explanation, W - 42);
  doc.text(lines, 21, y + 8);
  y += 30;

  // ── Section: Affected Devices ────────────────────
  checkPage(60);
  textC(...C.accent);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('02. AFFECTED DEVICES', 15, y);
  fill(...C.border); rect(15, y + 2, W - 30, 0.5);
  y += 8;

  // Table header
  fill(...C.surface);
  rect(15, y, W - 30, 8);
  textC(...C.muted);
  doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('DEVICE NAME', 18, y + 5.5);
  doc.text('TYPE', 75, y + 5.5);
  doc.text('IP ADDRESS', 105, y + 5.5);
  doc.text('STATUS', 145, y + 5.5);
  doc.text('STAGES', 170, y + 5.5);
  y += 10;

  (devices || []).forEach((device, idx) => {
    checkPage(10);
    if (idx % 2 === 0) { fill(15, 22, 30); rect(15, y - 1, W - 30, 8); }

    const statusColor = device.compromised ? C.red : C.accent;
    textC(...C.white);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(device.name, 18, y + 4.5);
    doc.text(device.type, 75, y + 4.5);
    doc.text(device.ip || '—', 105, y + 4.5);

    textC(...statusColor);
    doc.text(device.status?.toUpperCase() || 'UNKNOWN', 145, y + 4.5);

    textC(...C.muted);
    doc.text((device.attackStages || []).join(' → ') || 'None', 170, y + 4.5);
    y += 8;
  });

  // ── Section: Attack Timeline ─────────────────────
  y += 8;
  checkPage(50);
  textC(...C.accent);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('03. ATTACK STAGE BREAKDOWN', 15, y);
  fill(...C.border); rect(15, y + 2, W - 30, 0.5);
  y += 10;

  const stageNames = {
    start: 'Initial Access',
    escalate: 'Privilege Escalation',
    move: 'Lateral Movement',
    exfiltrate: 'Data Exfiltration',
  };

  const breakdown = summary?.stageBreakdown || {};
  Object.entries(stageNames).forEach(([key, label]) => {
    checkPage(10);
    const count = breakdown[key] || 0;
    const barW = Math.min((count / Math.max(devices?.length || 1, 1)) * 80, 80);

    textC(...C.white);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(label, 18, y + 4);

    fill(...C.border); rect(90, y, 80, 6);
    fill(...(count > 0 ? riskColor(risk?.riskLevel) : C.muted));
    rect(90, y, barW || 0.5, 6);

    textC(...C.muted);
    doc.text(`${count}x`, 175, y + 4.5);
    y += 10;
  });

  // ── Section: Logs ───────────────────────────────
  newPage();
  textC(...C.accent);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('04. SECURITY EVENT LOG', 15, y);
  fill(...C.border); rect(15, y + 2, W - 30, 0.5);
  y += 10;

  const recentLogs = (logs || []).slice(-40).reverse();

  recentLogs.forEach((log) => {
    checkPage(14);
    const lc = logColor(log.type);

    fill(...C.surface); stroke(...C.border);
    rect(15, y, W - 30, 12, 'FD');

    // Type badge
    fill(...lc);
    doc.roundedRect(18, y + 2, 18, 7, 1, 1, 'F');
    textC(...C.bg);
    doc.setFontSize(6); doc.setFont('helvetica', 'bold');
    doc.text(log.type, 27, y + 7, { align: 'center' });

    // Timestamp
    textC(...C.muted);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    const ts = new Date(log.timestamp).toLocaleTimeString();
    doc.text(ts, 40, y + 7);

    // Message
    textC(...C.white);
    doc.setFontSize(7.5);
    const msg = doc.splitTextToSize(log.message, W - 80);
    doc.text(msg[0], 68, y + 7);
    y += 14;
  });

  // ── Footer on every page ─────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    fill(...C.surface); rect(0, H - 12, W, 12);
    fill(...C.accent); rect(0, H - 12, W, 1);
    textC(...C.muted);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text('RedTeam Simulation Platform — SIMULATION ONLY — NOT FOR REAL DEPLOYMENT', 15, H - 4);
    doc.text(`Page ${p} / ${totalPages}`, W - 15, H - 4, { align: 'right' });
  }

  return doc;
}

export function downloadReport(data) {
  const doc = generateReport(data);
  doc.save(`redteam-report-${Date.now()}.pdf`);
}

// Sends the PDF to dlinguberi@gmail.com via the backend /report/send endpoint
export async function sendReport(data) {
  const doc = generateReport(data);

  // Convert PDF to base64 string (strip the data URI prefix)
  const pdfBase64 = doc.output('datauristring').split(',')[1];

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/report/send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdfBase64 }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.detail || err.error || `Server error: ${response.status}`);
  }

  return response.json();
}