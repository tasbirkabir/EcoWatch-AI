// TerraMind AI TypeScript Types

export type IncidentCategory =
  | 'Illegal Dumping'
  | 'Water Pollution'
  | 'Air Pollution'
  | 'Deforestation'
  | 'Wildlife Threats'
  | 'Hazardous Waste';

export type IncidentSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';

export type IncidentStatus = 'Pending' | 'Verified' | 'Under Review' | 'Investigating' | 'Resolved';

export type RecoveryStatus = 'Improving' | 'Recovered' | 'Unchanged';

export type VoteType = 'confirm' | 'dispute';

export type OrgType = 'NGO' | 'Government Agency' | 'Research Institution' | 'Community Coalition';

export interface Organization {
  id: string;
  name: string;
  org_type: OrgType;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  org_id?: string | null;
  created_at: string;
  organization?: Organization | null;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  latitude: number;
  longitude: number;
  location_name: string;
  image_url: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  risk_score: number;
  user_id: string | null;
  assigned_org_id: string | null;
  additional_notes?: string | null;
  created_at: string;
  
  // Joined/Ui fields
  users?: {
    full_name: string;
    email: string;
    org_id?: string | null;
  };
  assigned_org?: Organization | null;
  votes_count?: {
    confirm: number;
    dispute: number;
  };
  user_vote?: VoteType | null;
  risk_breakdown?: RiskScoreBreakdown | null;
}

export interface Vote {
  id: string;
  incident_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  user_id: string | null;
  image_url?: string | null;
  description: string;
  update_type: 'cleanup' | 'investigation' | 'comment';
  improvement_pct: number;
  waste_removed_kg: number;
  created_at: string;
  user_name?: string;
  user_org?: string | null;
}

export interface AIAnalysis {
  id: string;
  incident_id: string;
  detected_issue: string;
  confidence: number;
  severity: IncidentSeverity;
  environmental_impact: string;
  recommended_action: string;
  raw_response?: any;
  created_at: string;
}

export interface RiskScoreBreakdown {
  id: string;
  incident_id: string;
  base_severity: number;      // 1-10
  validation_factor: number;  // Confirm - Dispute
  population_density: number; // 1-10
  env_sensitivity: number;    // 1-10
  frequency_index: number;    // 1-10
  composite_score: number;    // 0-100
  created_at: string;
}

export interface ImpactMetrics {
  id: string;
  total_resolved: number;
  waste_removed_kg: number;
  area_restored_sqm: number;
  average_risk_reduction_pct: number;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface IncidentFilter {
  category: IncidentCategory | 'All';
  severity: IncidentSeverity | 'All';
  status: IncidentStatus | 'All';
  searchQuery: string;
}
