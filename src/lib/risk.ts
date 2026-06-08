// TerraMind AI Risk Scoring Engine
import { IncidentSeverity } from '../types';

export function calculateRiskScore(
  severity: IncidentSeverity,
  votesCount: { confirm: number; dispute: number },
  category: string,
  populationDensity: number = 5,
  envSensitivity: number = 5,
  incidentFrequency: number = 2
): { score: number; level: IncidentSeverity } {
  
  // 1. Severity weight (2 to 10)
  const severityWeights: Record<IncidentSeverity, number> = {
    Low: 2,
    Moderate: 5,
    High: 8,
    Critical: 10
  };
  const S = severityWeights[severity] || 5;

  // 2. Community validation factor (-5 to 10)
  const netVotes = votesCount.confirm - votesCount.dispute;
  const V = Math.max(-5, Math.min(10, netVotes));

  // 3. Population Density (1-10)
  const P = Math.max(1, Math.min(10, populationDensity));

  // 4. Environmental Sensitivity (1-10)
  const E = Math.max(1, Math.min(10, envSensitivity));

  // 5. Incident Frequency (1-10)
  const F = Math.max(1, Math.min(10, incidentFrequency));

  // Composite calculation: Max potential score: 35 + 15 + 20 + 20 + 10 = 100
  const rawScore = (S * 3.5) + (V * 1.5) + (P * 2.0) + (E * 2.0) + (F * 1.0);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Risk Classification levels mapping
  let level: IncidentSeverity = 'Low';
  if (score >= 80) {
    level = 'Critical';
  } else if (score >= 60) {
    level = 'High';
  } else if (score >= 35) {
    level = 'Moderate';
  } else {
    level = 'Low';
  }

  return { score, level };
}
