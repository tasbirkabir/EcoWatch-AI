import { createClient } from '@supabase/supabase-js';
import { Incident, Vote, IncidentUpdate, AIAnalysis, Organization, ImpactMetrics, Notification, RiskScoreBreakdown, VoteType, IncidentCategory, IncidentSeverity, IncidentStatus } from '../types';
import { calculateRiskScore } from './risk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

// ---------------------------------------------------------
// SERVER-SIDE IN-MEMORY SEED DATA
// ---------------------------------------------------------
interface MockDatabase {
  organizations: Organization[];
  incidents: Incident[];
  votes: Vote[];
  updates: IncidentUpdate[];
  analyses: AIAnalysis[];
  riskScores: RiskScoreBreakdown[];
  impactMetrics: ImpactMetrics;
  notifications: Notification[];
}

const SEED_ORGS: Organization[] = [
  { id: 'org-1', name: 'Ecology Threat Response Commission', org_type: 'Government Agency', created_at: new Date().toISOString() },
  { id: 'org-2', name: 'Cascade Environmental Protection', org_type: 'NGO', created_at: new Date().toISOString() },
  { id: 'org-3', name: 'Pacific Rim Water Research Institute', org_type: 'Research Institution', created_at: new Date().toISOString() },
  { id: 'org-4', name: 'Green Watershed Coalition', org_type: 'Community Coalition', created_at: new Date().toISOString() }
];

const SEED_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Industrial Chemical Leaks near Duwamish Riverbank',
    description: 'Rusted steel barrels containing suspected industrial chemical solvents and corrosive chemicals have been abandoned. Leaking residues are visible on surrounding soils, posing a severe groundwater toxicity threat.',
    category: 'Hazardous Waste',
    latitude: 47.5385,
    longitude: -122.3275,
    location_name: 'Riverside Industrial Area, Seattle',
    image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&q=80&w=1200',
    severity: 'Critical',
    status: 'Investigating',
    risk_score: 93,
    user_id: 'mock-user-1',
    assigned_org_id: 'org-1',
    additional_notes: 'Chemical runoff is approaching the salmon migration bypass canal. Urgent containment required.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inc-2',
    title: 'Microcystin Cyanobacteria Bloom in Green Lake Basin',
    description: 'Thick, bright green harmful algal bloom (HAB) coating the northern swimming inlet. Multiple dead fish have washed ashore. The water gives off a distinct hydrogen sulfide odor.',
    category: 'Water Pollution',
    latitude: 47.6798,
    longitude: -122.3275,
    location_name: 'Green Lake Northern Basin, Seattle',
    image_url: 'https://images.unsplash.com/photo-1505535745401-4475471d4715?auto=format&fit=crop&q=80&w=1200',
    severity: 'Critical',
    status: 'Verified',
    risk_score: 86,
    user_id: 'mock-user-2',
    assigned_org_id: 'org-3',
    additional_notes: 'Warning signs posted by community, but dog owners are still walking pets nearby.',
    created_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inc-3',
    title: 'Unpermitted Forest Felling in Cascade Foothills',
    description: 'Fresh commercial tree harvesting and bulldozer tracks spotted inside protected boundary zones. Dozens of mature cedars estimated over 80 years old have been cut down without logs showing tags.',
    category: 'Deforestation',
    latitude: 47.5458,
    longitude: -122.1121,
    location_name: 'Cougar Mountain Buffer Reserve',
    image_url: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1200',
    severity: 'High',
    status: 'Pending',
    risk_score: 74,
    user_id: 'mock-user-3',
    assigned_org_id: 'org-2',
    additional_notes: 'Felling seems to have occurred under the cover of night. Neighbors heard chainsaws.',
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inc-4',
    title: 'Commercial Vinyl and Plastic Waste Pile in Wildlife Sanctuary',
    description: 'Massive volume of commercial roof tiles, plastic pipes, and flooring materials left at beach access trailhead. Obstructs trails and leaches chemicals.',
    category: 'Illegal Dumping',
    latitude: 47.6570,
    longitude: -122.4172,
    location_name: 'Discovery Park Trailhead, Seattle',
    image_url: 'https://images.unsplash.com/photo-1605600611270-ac2243d19a41?auto=format&fit=crop&q=80&w=1200',
    severity: 'Moderate',
    status: 'Resolved',
    risk_score: 45,
    user_id: 'mock-user-4',
    assigned_org_id: 'org-4',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inc-5',
    title: 'Ref refinery Venting Black Soot and SO2 Smog',
    description: 'Eastern stacks have been venting thick black soot plumes for over six hours. Heavy sulfur chemical smells reported in surrounding residential streets.',
    category: 'Air Pollution',
    latitude: 47.5682,
    longitude: -122.3421,
    location_name: 'Industrial Canal Refinery Outlet',
    image_url: 'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?auto=format&fit=crop&q=80&w=1200',
    severity: 'High',
    status: 'Under Review',
    risk_score: 78,
    user_id: 'mock-user-1',
    assigned_org_id: 'org-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inc-6',
    title: 'Salmon Stream Obstruction in Bear Creek Basin',
    description: 'Fallen sheet metal walls and vinyl tarps blocking water flow. Wild spawning salmon are blocked from traveling upstream, collecting below the blockage.',
    category: 'Wildlife Threats',
    latitude: 47.6740,
    longitude: -122.1215,
    location_name: 'Bear Creek Salmon Bypass Stream',
    image_url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=1200',
    severity: 'Moderate',
    status: 'Resolved',
    risk_score: 38,
    user_id: 'mock-user-5',
    assigned_org_id: 'org-4',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_VOTES: Vote[] = [
  { id: 'v-1', incident_id: 'inc-1', user_id: 'mock-user-2', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-2', incident_id: 'inc-1', user_id: 'mock-user-3', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-3', incident_id: 'inc-1', user_id: 'mock-user-4', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-4', incident_id: 'inc-1', user_id: 'mock-user-5', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-5', incident_id: 'inc-1', user_id: 'mock-user-6', vote_type: 'confirm', created_at: new Date().toISOString() },
  
  { id: 'v-6', incident_id: 'inc-2', user_id: 'mock-user-1', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-7', incident_id: 'inc-2', user_id: 'mock-user-3', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-8', incident_id: 'inc-2', user_id: 'mock-user-4', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-9', incident_id: 'inc-2', user_id: 'mock-user-5', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-10', incident_id: 'inc-2', user_id: 'mock-user-6', vote_type: 'dispute', created_at: new Date().toISOString() },
  
  { id: 'v-11', incident_id: 'inc-3', user_id: 'mock-user-1', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-12', incident_id: 'inc-3', user_id: 'mock-user-2', vote_type: 'confirm', created_at: new Date().toISOString() },
  
  { id: 'v-13', incident_id: 'inc-5', user_id: 'mock-user-2', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-14', incident_id: 'inc-5', user_id: 'mock-user-3', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-15', incident_id: 'inc-5', user_id: 'mock-user-4', vote_type: 'confirm', created_at: new Date().toISOString() },
];

const SEED_UPDATES: IncidentUpdate[] = [
  {
    id: 'up-1',
    incident_id: 'inc-4',
    user_id: 'mock-user-2',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200',
    description: 'Green Watershed crew assembled 14 volunteers. Cleared all vinyl floor tiles and plastic pipes, recovering 480kg of waste and restoring a 120sqm trailhead zone.',
    update_type: 'cleanup',
    improvement_pct: 100,
    waste_removed_kg: 480,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    user_name: 'Sarah Connor',
    user_org: 'Green Watershed Coalition'
  },
  {
    id: 'up-2',
    incident_id: 'inc-6',
    user_id: 'mock-user-5',
    image_url: null,
    description: 'Rangers manual removal of fallen sheet metal walls completed. Clear water flow restored, spawning salmon are successfully passing upstream.',
    update_type: 'cleanup',
    improvement_pct: 100,
    waste_removed_kg: 120,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    user_name: 'Mark Miller',
    user_org: 'Ecology Threat Response Commission'
  },
  {
    id: 'up-3',
    incident_id: 'inc-1',
    user_id: 'mock-user-6',
    image_url: null,
    description: 'Initial site investigation complete. Solvents have leached into soil, but aquifer barrier is intact. Allocated containment booms and soil excavation rigs.',
    update_type: 'investigation',
    improvement_pct: 20,
    waste_removed_kg: 0,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user_name: 'Inspector Jenkins',
    user_org: 'Ecology Threat Response Commission'
  }
];

const SEED_ANALYSES: AIAnalysis[] = [
  {
    id: 'ai-1',
    incident_id: 'inc-1',
    detected_issue: 'Hazardous Chemical Battery & Acid Leakage',
    confidence: 94,
    severity: 'Critical',
    environmental_impact: 'High risk of toxic metal infiltration (lead, cadmium) and sulfuric acid leaching into soil and Duwamish riverbed, causing salmon bypass mortality.',
    recommended_action: 'Cordon off the site immediately, deploy EPA-equivalent chemical absorbent booms, and begin deep-core soil extraction testing.',
    created_at: new Date().toISOString()
  },
  {
    id: 'ai-2',
    incident_id: 'inc-2',
    detected_issue: 'Toxic Cyanobacteria Bloom (HAB)',
    confidence: 91,
    severity: 'Critical',
    environmental_impact: 'Rapid cyanobacteria cell division releases hepatotoxins fatal to canine species and causes absolute dissolved oxygen depletion, suffocating local fish.',
    recommended_action: 'Advise closure of northern lake access points, deploy ultrasonic algae management nodes, and warning flags.',
    created_at: new Date().toISOString()
  },
  {
    id: 'ai-3',
    incident_id: 'inc-3',
    detected_issue: 'Protected Logging & Deforestation',
    confidence: 88,
    severity: 'High',
    environmental_impact: 'Clear felling of mature Douglas fir canopy triggers severe topsoil vulnerability, leading to erosion under precipitation, and destroys nesting spots.',
    recommended_action: 'Notify Forestry Warden Office, execute boundary mapping drone patrols, and identify vehicle registration matches.',
    created_at: new Date().toISOString()
  },
  {
    id: 'ai-4',
    incident_id: 'inc-4',
    detected_issue: 'Commercial Construction Plastic Dump',
    confidence: 92,
    severity: 'Moderate',
    environmental_impact: 'Leaching plastic vinyl phthalates disrupts native plant structures and causes visual blockages in protected wildlife pathways.',
    recommended_action: 'Deploy community waste volunteer teams, install barrier warning fences, and schedule waste collection trucks.',
    created_at: new Date().toISOString()
  },
  {
    id: 'ai-5',
    incident_id: 'inc-5',
    detected_issue: 'Soot Exhaust & SO2 Industrial Venting',
    confidence: 89,
    severity: 'High',
    environmental_impact: 'Sulfur dioxide emissions form acid rain precursors, causing rapid local PM2.5 indexes to climb to unhealthy levels for public neighborhoods.',
    recommended_action: 'Alert Air Control Board, launch emission volume audit on the refinery stacks, and advise local residents to stay indoors.',
    created_at: new Date().toISOString()
  },
  {
    id: 'ai-6',
    incident_id: 'inc-6',
    detected_issue: 'Stream Obstruction / Salmon Migration Obstacle',
    confidence: 87,
    severity: 'Moderate',
    environmental_impact: 'Sheet metal restricts flow, lowering oxygen levels downstream and causing salmon congestion, inviting predator species.',
    recommended_action: 'Deploy park cleanup rangers to manual haul sheet metals and clear plastic logs out of the stream channel.',
    created_at: new Date().toISOString()
  }
];

const SEED_RISK_SCORES: RiskScoreBreakdown[] = [
  { id: 'rs-1', incident_id: 'inc-1', base_severity: 10, validation_factor: 5, population_density: 7, env_sensitivity: 9, frequency_index: 3, composite_score: 93, created_at: new Date().toISOString() },
  { id: 'rs-2', incident_id: 'inc-2', base_severity: 10, validation_factor: 3, population_density: 8, env_sensitivity: 8, frequency_index: 2, composite_score: 86, created_at: new Date().toISOString() },
  { id: 'rs-3', incident_id: 'inc-3', base_severity: 8, validation_factor: 2, population_density: 3, env_sensitivity: 10, frequency_index: 4, composite_score: 74, created_at: new Date().toISOString() },
  { id: 'rs-4', incident_id: 'inc-4', base_severity: 5, validation_factor: 0, population_density: 4, env_sensitivity: 7, frequency_index: 5, composite_score: 45, created_at: new Date().toISOString() },
  { id: 'rs-5', incident_id: 'inc-5', base_severity: 8, validation_factor: 3, population_density: 9, env_sensitivity: 5, frequency_index: 6, composite_score: 78, created_at: new Date().toISOString() },
  { id: 'rs-6', incident_id: 'inc-6', base_severity: 5, validation_factor: 2, population_density: 2, env_sensitivity: 9, frequency_index: 1, composite_score: 38, created_at: new Date().toISOString() }
];

const SEED_NOTIFS: Notification[] = [
  { id: 'n-1', user_id: 'org-user', title: 'New High-Risk Alert', message: 'A Critical Hazardous Waste incident has been verified at Riverside Industrial Area.', read: false, created_at: new Date().toISOString() },
  { id: 'n-2', user_id: 'org-user', title: 'Incident Assigned', message: 'Cascade foothills Deforestation report assigned to Cascade Environmental Protection.', read: true, created_at: new Date().toISOString() }
];

const SEED_METRICS: ImpactMetrics = {
  id: 'global-impact',
  total_resolved: 142,
  waste_removed_kg: 4890,
  area_restored_sqm: 28400,
  average_risk_reduction_pct: 84,
  updated_at: new Date().toISOString()
};

const globalForMock = globalThis as any;
if (!globalForMock.mockDb) {
  globalForMock.mockDb = {
    organizations: SEED_ORGS,
    incidents: SEED_INCIDENTS,
    votes: SEED_VOTES,
    updates: SEED_UPDATES,
    analyses: SEED_ANALYSES,
    riskScores: SEED_RISK_SCORES,
    impactMetrics: SEED_METRICS,
    notifications: SEED_NOTIFS
  } as MockDatabase;
}

const mockDb: MockDatabase = globalForMock.mockDb;

// ---------------------------------------------------------
// DATABASE WRAPPER API FUNCTIONS
// ---------------------------------------------------------

function getVotesCountForIncident(incidentId: string) {
  const votes = mockDb.votes.filter((v) => v.incident_id === incidentId);
  const confirm = votes.filter((v) => v.vote_type === 'confirm').length;
  const dispute = votes.filter((v) => v.vote_type === 'dispute').length;
  return { confirm, dispute };
}

export async function fetchOrganizations(): Promise<Organization[]> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase.from('organizations').select('*');
    if (error) throw error;
    return data;
  }
  return mockDb.organizations;
}

export async function fetchIncidents(filters?: {
  category?: string;
  severity?: string;
  status?: string;
  search?: string;
  assignedOrgId?: string;
}): Promise<Incident[]> {
  if (isConfigured && supabase) {
    let query = supabase.from('incidents').select('*, users(full_name, email), assigned_org:organizations(*)');

    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters?.severity && filters.severity !== 'All') {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedOrgId) {
      query = query.eq('assigned_org_id', filters.assignedOrgId);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location_name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const incidents = data as any[];
    return Promise.all(
      incidents.map(async (inc) => {
        const { data: votes } = await supabase!.from('votes').select('vote_type').eq('incident_id', inc.id);
        const confirm = votes?.filter((v) => v.vote_type === 'confirm').length || 0;
        const dispute = votes?.filter((v) => v.vote_type === 'dispute').length || 0;
        
        return {
          ...inc,
          votes_count: { confirm, dispute }
        };
      })
    );
  } else {
    // Mock Database Logic
    let result = [...mockDb.incidents];

    if (filters?.category && filters.category !== 'All') {
      result = result.filter((r) => r.category === filters.category);
    }
    if (filters?.severity && filters.severity !== 'All') {
      result = result.filter((r) => r.severity === filters.severity);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters?.assignedOrgId) {
      result = result.filter((r) => r.assigned_org_id === filters.assignedOrgId);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.location_name.toLowerCase().includes(searchLower)
      );
    }

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result.map((inc) => {
      const votes_count = getVotesCountForIncident(inc.id);
      const org = mockDb.organizations.find((o) => o.id === inc.assigned_org_id) || null;
      const riskBreakdown = mockDb.riskScores.find((r) => r.incident_id === inc.id) || null;
      
      return {
        ...inc,
        votes_count,
        assigned_org: org,
        users: inc.users || { full_name: 'TerraMind Watcher', email: 'watcher@terramind.ai' },
        risk_breakdown: riskBreakdown
      };
    });
  }
}

export async function fetchIncidentById(id: string, currentUserId?: string): Promise<Incident | null> {
  if (isConfigured && supabase) {
    const { data: incident, error } = await supabase
      .from('incidents')
      .select('*, users(full_name, email, org_id), assigned_org:organizations(*)')
      .eq('id', id)
      .single();

    if (error || !incident) return null;

    // Fetch votes
    const { data: votes } = await supabase.from('votes').select('vote_type, user_id').eq('incident_id', id);
    const confirm = votes?.filter((v) => v.vote_type === 'confirm').length || 0;
    const dispute = votes?.filter((v) => v.vote_type === 'dispute').length || 0;

    let user_vote: VoteType | null = null;
    if (currentUserId && votes) {
      const match = votes.find((v) => v.user_id === currentUserId);
      if (match) user_vote = match.vote_type as VoteType;
    }

    // Fetch risk breakdown
    const { data: risk } = await supabase.from('risk_scores').select('*').eq('incident_id', id).maybeSingle();

    return {
      ...incident,
      votes_count: { confirm, dispute },
      user_vote,
      risk_breakdown: risk
    };
  } else {
    const incident = mockDb.incidents.find((r) => r.id === id);
    if (!incident) return null;

    const votes_count = getVotesCountForIncident(incident.id);
    const org = mockDb.organizations.find((o) => o.id === incident.assigned_org_id) || null;
    const riskBreakdown = mockDb.riskScores.find((r) => r.incident_id === id) || null;

    let user_vote: VoteType | null = null;
    if (currentUserId) {
      const match = mockDb.votes.find((v) => v.incident_id === id && v.user_id === currentUserId);
      if (match) user_vote = match.vote_type;
    }

    return {
      ...incident,
      votes_count,
      user_vote,
      assigned_org: org,
      users: incident.users || { full_name: 'TerraMind Watcher', email: 'watcher@terramind.ai', org_id: 'org-1' },
      risk_breakdown: riskBreakdown
    };
  }
}

export async function insertIncident(incident: Omit<Incident, 'id' | 'created_at' | 'risk_score' | 'status' | 'assigned_org_id'>): Promise<Incident> {
  const initialRisk = calculateRiskScore(incident.severity, { confirm: 0, dispute: 0 }, incident.category, 5, 5, 2);

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('incidents')
      .insert([{
        ...incident,
        status: 'Pending',
        risk_score: initialRisk.score,
        assigned_org_id: 'org-2' // Auto assign to local NGO for demo
      }])
      .select()
      .single();

    if (error) throw error;

    // Create risk breakdown in db
    await supabase.from('risk_scores').insert([{
      incident_id: data.id,
      base_severity: incident.severity === 'Critical' ? 10 : incident.severity === 'High' ? 8 : incident.severity === 'Moderate' ? 5 : 2,
      validation_factor: 0,
      population_density: 5,
      env_sensitivity: 5,
      frequency_index: 2,
      composite_score: initialRisk.score
    }]);

    return data;
  } else {
    const id = `inc-${Date.now()}`;
    const newIncident: Incident = {
      ...incident,
      id,
      status: 'Pending',
      risk_score: initialRisk.score,
      assigned_org_id: 'org-2',
      created_at: new Date().toISOString(),
      users: { full_name: 'Logged In User', email: 'user@terramind.ai' }
    };
    mockDb.incidents.push(newIncident);

    mockDb.riskScores.push({
      id: `rs-${Date.now()}`,
      incident_id: id,
      base_severity: incident.severity === 'Critical' ? 10 : incident.severity === 'High' ? 8 : incident.severity === 'Moderate' ? 5 : 2,
      validation_factor: 0,
      population_density: 5,
      env_sensitivity: 5,
      frequency_index: 2,
      composite_score: initialRisk.score,
      created_at: new Date().toISOString()
    });

    return newIncident;
  }
}

export async function castVote(incidentId: string, userId: string, voteType: VoteType): Promise<Incident> {
  if (isConfigured && supabase) {
    const { error } = await supabase.from('votes').upsert({
      incident_id: incidentId,
      user_id: userId,
      vote_type: voteType,
      created_at: new Date().toISOString()
    }, { onConflict: 'incident_id,user_id' });

    if (error) throw error;

    const incident = await fetchIncidentById(incidentId, userId);
    if (!incident) throw new Error('Incident not found');

    const votes_count = incident.votes_count || { confirm: 0, dispute: 0 };
    const breakdown = incident.risk_breakdown || { population_density: 5, env_sensitivity: 5, frequency_index: 2 };
    
    const { score } = calculateRiskScore(
      incident.severity, 
      votes_count, 
      incident.category,
      breakdown.population_density,
      breakdown.env_sensitivity,
      breakdown.frequency_index
    );

    let newStatus = incident.status;
    if (incident.status === 'Pending' && votes_count.confirm >= 5) {
      newStatus = 'Verified';
    }

    const { data: updated, error: uError } = await supabase
      .from('incidents')
      .update({ risk_score: score, status: newStatus })
      .eq('id', incidentId)
      .select()
      .single();

    if (uError) throw uError;

    // Update risk breakdown score
    await supabase.from('risk_scores').update({
      validation_factor: votes_count.confirm - votes_count.dispute,
      composite_score: score
    }).eq('incident_id', incidentId);

    return {
      ...updated,
      votes_count,
      user_vote: voteType
    };
  } else {
    // Mock
    const existing = mockDb.votes.findIndex((v) => v.incident_id === incidentId && v.user_id === userId);
    if (existing >= 0) {
      mockDb.votes[existing].vote_type = voteType;
    } else {
      mockDb.votes.push({
        id: `v-${Date.now()}`,
        incident_id: incidentId,
        user_id: userId,
        vote_type: voteType,
        created_at: new Date().toISOString()
      });
    }

    const incident = mockDb.incidents.find((r) => r.id === incidentId);
    if (!incident) throw new Error('Incident not found');

    const votes_count = getVotesCountForIncident(incidentId);
    const breakdown = mockDb.riskScores.find((r) => r.incident_id === incidentId) || { population_density: 5, env_sensitivity: 5, frequency_index: 2 };

    const { score } = calculateRiskScore(
      incident.severity, 
      votes_count, 
      incident.category,
      breakdown.population_density,
      breakdown.env_sensitivity,
      breakdown.frequency_index
    );

    if (incident.status === 'Pending' && votes_count.confirm >= 3) {
      incident.status = 'Verified';
    }
    incident.risk_score = score;

    // Update mock breakdown
    const dbBreakdown = mockDb.riskScores.find((r) => r.incident_id === incidentId);
    if (dbBreakdown) {
      dbBreakdown.validation_factor = votes_count.confirm - votes_count.dispute;
      dbBreakdown.composite_score = score;
    }

    return {
      ...incident,
      votes_count,
      user_vote: voteType,
      users: incident.users || { full_name: 'TerraMind Watcher', email: 'watcher@terramind.ai' }
    };
  }
}

export async function fetchIncidentUpdates(incidentId: string): Promise<IncidentUpdate[]> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('incident_updates')
      .select('*, users(full_name, org_id)')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return Promise.all(data.map(async (u: any) => {
      let orgName = null;
      if (u.users?.org_id) {
        const { data: o } = await supabase!.from('organizations').select('name').eq('id', u.users.org_id).single();
        orgName = o?.name || null;
      }
      return {
        ...u,
        user_name: u.users?.full_name || 'Inspector',
        user_org: orgName
      };
    }));
  } else {
    return mockDb.updates
      .filter((u) => u.incident_id === incidentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}

export async function insertIncidentUpdate(update: Omit<IncidentUpdate, 'id' | 'created_at'>): Promise<IncidentUpdate> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase.from('incident_updates').insert([update]).select().single();
    if (error) throw error;

    if (update.update_type === 'cleanup' && update.improvement_pct === 100) {
      await supabase.from('incidents').update({ status: 'Resolved' }).eq('id', update.incident_id);
      
      // Update impact metrics
      const { data: met } = await supabase.from('impact_metrics').select('*').single();
      if (met) {
        await supabase.from('impact_metrics').update({
          total_resolved: met.total_resolved + 1,
          waste_removed_kg: met.waste_removed_kg + update.waste_removed_kg,
          area_restored_sqm: met.area_restored_sqm + (update.waste_removed_kg * 5)
        }).eq('id', met.id);
      }
    }

    return {
      ...data,
      user_name: 'Logged In Inspector',
      user_org: 'Ecology Threat Response Commission'
    };
  } else {
    const newUpdate: IncidentUpdate = {
      ...update,
      id: `up-${Date.now()}`,
      created_at: new Date().toISOString(),
      user_name: 'Sarah Connor',
      user_org: 'Cascade Environmental Protection'
    };
    mockDb.updates.push(newUpdate);

    // Update status to Resolved if 100% clean
    const incident = mockDb.incidents.find((r) => r.id === update.incident_id);
    if (incident) {
      if (update.update_type === 'cleanup' && update.improvement_pct === 100) {
        incident.status = 'Resolved';
        // Bump global mock metrics
        mockDb.impactMetrics.total_resolved += 1;
        mockDb.impactMetrics.waste_removed_kg += update.waste_removed_kg;
        mockDb.impactMetrics.area_restored_sqm += (update.waste_removed_kg * 4); // Simulated sqm restored
      } else if (incident.status === 'Pending') {
        incident.status = 'Investigating'; // Mark active once authority takes action
      }
    }

    return newUpdate;
  }
}

export async function fetchAIAnalysisByIncidentId(incidentId: string): Promise<AIAnalysis | null> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase.from('ai_analysis').select('*').eq('incident_id', incidentId).maybeSingle();
    if (error) return null;
    return data;
  }
  return mockDb.analyses.find((a) => a.incident_id === incidentId) || null;
}

export async function insertAIAnalysis(analysis: Omit<AIAnalysis, 'id' | 'created_at'>): Promise<AIAnalysis> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase.from('ai_analysis').insert([analysis]).select().single();
    if (error) throw error;
    return data;
  } else {
    const newAnalysis: AIAnalysis = {
      ...analysis,
      id: `ai-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    mockDb.analyses.push(newAnalysis);
    return newAnalysis;
  }
}

export async function fetchImpactMetrics(): Promise<ImpactMetrics> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase.from('impact_metrics').select('*').single();
    if (error) throw error;
    return data;
  }
  return mockDb.impactMetrics;
}

export async function updateIncidentStatus(incidentId: string, status: IncidentStatus, orgId?: string): Promise<Incident> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('incidents')
      .update({ status, assigned_org_id: orgId || null })
      .eq('id', incidentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const incident = mockDb.incidents.find((r) => r.id === incidentId);
    if (!incident) throw new Error('Incident not found');
    incident.status = status;
    if (orgId) {
      incident.assigned_org_id = orgId;
    }
    return incident;
  }
}

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
  }
  return mockDb.notifications;
}
