// EcoWatch AI TypeScript Types

export type IncidentCategory =
  | 'Illegal Dumping'
  | 'Water Pollution'
  | 'Deforestation'
  | 'Wildlife Threat'
  | 'Air Pollution'
  | 'Hazardous Waste';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus = 'Pending' | 'Verified' | 'Under Review' | 'Resolved';

export type VoteType = 'confirm' | 'dispute';

export type RecoveryStatus = 'Improving' | 'Recovered' | 'Unchanged';

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Report {
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
  created_at: string;
  
  // Joined or calculated fields (optional in db table, populated for UI convenience)
  users?: {
    full_name: string;
    email: string;
  };
  votes_count?: {
    confirm: number;
    dispute: number;
  };
  user_vote?: VoteType | null; // Vote cast by current user, if any
}

export interface ReportVote {
  id: string;
  report_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface ReportUpdate {
  id: string;
  report_id: string;
  user_id: string | null;
  image_url: string;
  description: string;
  improvement_pct: number;
  pollution_reduced: number;
  recovery_status: RecoveryStatus;
  created_at: string;
  user_name?: string;
}

export interface AIAnalysis {
  id: string;
  report_id: string;
  detected_issue: string;
  confidence: number;
  severity: IncidentSeverity;
  environmental_impact: string;
  raw_response?: any;
  created_at: string;
}

export interface ReportFilter {
  category: IncidentCategory | 'All';
  severity: IncidentSeverity | 'All';
  status: IncidentStatus | 'All';
  searchQuery: string;
}
