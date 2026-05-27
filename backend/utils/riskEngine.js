// AI Risk Engine — rule-based analysis of attack state
// Returns: riskLevel (LOW | MEDIUM | HIGH | CRITICAL) + explanation

const store = require('./store');

function calculateRisk() {
  const devices = store.devices;
  const logs = store.logs;
  const stages = store.attackStages;

  const compromisedCount = devices.filter(d => d.compromised).length;
  const totalDevices = devices.length;

  const hasEscalation = stages.some(s => s.stage === 'escalate');
  const hasLateralMovement = stages.some(s => s.stage === 'move');
  const hasExfiltration = stages.some(s => s.stage === 'exfiltrate');
  const criticalLogs = logs.filter(l => l.type === 'CRITICAL').length;

  let riskLevel = 'LOW';
  let reasons = [];

  // Rule 1: Any compromise at all → at least LOW→MEDIUM
  if (compromisedCount >= 1) {
    riskLevel = 'MEDIUM';
    reasons.push(`${compromisedCount} device(s) compromised`);
  }

  // Rule 2: Escalation + lateral movement → HIGH
  if (hasEscalation && hasLateralMovement) {
    riskLevel = 'HIGH';
    reasons.push('Privilege escalation combined with lateral movement detected');
  }

  // Rule 3: More than half the fleet compromised → HIGH
  if (compromisedCount > totalDevices / 2) {
    riskLevel = 'HIGH';
    reasons.push(`${compromisedCount}/${totalDevices} devices compromised (>50% of fleet)`);
  }

  // Rule 4: Data exfiltration → CRITICAL regardless
  if (hasExfiltration) {
    riskLevel = 'CRITICAL';
    reasons.push('Active data exfiltration in progress — immediate containment required');
  }

  // Rule 5: Multiple critical log entries → escalate risk
  if (criticalLogs >= 3 && riskLevel === 'HIGH') {
    riskLevel = 'CRITICAL';
    reasons.push(`${criticalLogs} critical security events logged`);
  }

  const explanation = reasons.length > 0
    ? reasons.join('. ') + '.'
    : 'No active threats. All systems operating normally.';

  // Persist to store
  store.riskLevel = riskLevel;
  store.riskExplanation = explanation;

  return { riskLevel, explanation, compromisedCount, totalDevices };
}

module.exports = { calculateRisk };
