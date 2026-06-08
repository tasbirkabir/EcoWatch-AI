// EcoWatch AI Risk Scoring Engine
import { IncidentSeverity, RiskLevel } from '../types';

export function calculateRiskScore(
  severity: IncidentSeverity,
  votesCount: { confirm: number; dispute: number },
  category: string
): { score: number; level: RiskLevel } {
  // Severity weight (1-10)
  const severityWeights: Record<IncidentSeverity, number> = {
    Low: 2,
    Medium: 5,
    High: 8,
    Critical: 10
  };
  const baseSeverity = severityWeights[severity] || 5;

  // Category impact weights (1-10)
  const categoryWeights: Record<string, number> = {
    'Hazardous Waste': 10,
    'Water Pollution': 9,
    'Deforestation': 8,
    'Wildlife Threat': 7,
    'Air Pollution': 6,
    'Illegal Dumping': 5,
  };
  const categoryWeight = categoryWeights[category] || 5;

  // Community validation influence
  const netVotes = votesCount.confirm - votesCount.dispute;
  // Confirms increase risk (validate urgency), disputes decrease risk
  const validationFactor = Math.max(-5, Math.min(10, netVotes * 0.8));

  // Compute composite score (capped at 0 - 100)
  // Base maximum score without votes: 10 * 5 + 10 * 4 = 90
  const rawScore = (baseSeverity * 5) + (categoryWeight * 4) + (validationFactor * 1.5);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let level: RiskLevel = 'Low';
  if (score >= 80) {
    level = 'Critical';
  } else if (score >= 60) {
    level = 'High';
  } else if (score >= 35) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  return { score, level };
}
export type { RiskLevel };
