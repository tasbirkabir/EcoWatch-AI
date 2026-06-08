import { createClient } from '@supabase/supabase-js';
import { Report, ReportVote, ReportUpdate, AIAnalysis, IncidentCategory, IncidentSeverity, IncidentStatus, VoteType } from '../types';

// Detect if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

// ---------------------------------------------------------
// SERVER-SIDE IN-MEMORY MOCK DATABASE
// ---------------------------------------------------------
// We use globalThis to persist the state across Hot Module Replacement (HMR) in development.
interface MockDatabase {
  reports: Report[];
  votes: ReportVote[];
  updates: ReportUpdate[];
  analyses: AIAnalysis[];
}

const SEED_REPORTS: Report[] = [
  {
    id: 'report-1',
    title: 'Industrial Chemical Dumping near Duwamish Riverbank',
    description: 'Multiple rusted metal drums containing suspected industrial solvents and paint waste have been abandoned on the steep bank. Several drums have leaked dark residues onto the soil, posing a direct threat to the river ecosystem and salmon spawning zones.',
    category: 'Illegal Dumping',
    latitude: 47.5385,
    longitude: -122.3275,
    location_name: 'Riverside Industrial Area, Seattle',
    image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&q=80&w=1200', // Dumped barrels
    severity: 'Critical',
    status: 'Under Review',
    risk_score: 92,
    user_id: 'mock-user-1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'report-2',
    title: 'Harmful Algal Bloom spreading in Green Lake cove',
    description: 'A thick, bright green cyanobacteria bloom has coated the entire northern swimming and boating inlet. Dead fish have been spotted floating near the reeds, and the water emits a strong musty odor. Pets and local wildlife are at immediate risk.',
    category: 'Water Pollution',
    latitude: 47.6798,
    longitude: -122.3275,
    location_name: 'Green Lake Northern Basin, Seattle',
    image_url: 'https://images.unsplash.com/photo-1505535745401-4475471d4715?auto=format&fit=crop&q=80&w=1200', // Algae green water
    severity: 'High',
    status: 'Verified',
    risk_score: 78,
    user_id: 'mock-user-2',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'report-3',
    title: 'Suspected Illegal Logging at Cougar Mountain Outskirts',
    description: 'Fresh tree felling and heavy equipment tracks have been found deep within the protected city forest zone. Several mature cedar and Douglas fir trees, estimated to be between 80 to 120 years old, have been harvested without permit badges visible.',
    category: 'Deforestation',
    latitude: 47.5458,
    longitude: -122.1121,
    location_name: 'Cougar Mountain Protected Reserve',
    image_url: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1200', // Cleared logs
    severity: 'High',
    status: 'Pending',
    risk_score: 72,
    user_id: 'mock-user-3',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  },
  {
    id: 'report-4',
    title: 'Plastic and Construction Waste in Discovery Park',
    description: 'Massive pile of discarded vinyl flooring, plastic pipes, roof tiling, and paint canisters left right beside the primary beach access trail. This creates physical barriers for wildlife and poses leaching threats during rainstorms.',
    category: 'Illegal Dumping',
    latitude: 47.6570,
    longitude: -122.4172,
    location_name: 'Discovery Park Loop Trail, Seattle',
    image_url: 'https://images.unsplash.com/photo-1605600611270-ac2243d19a41?auto=format&fit=crop&q=80&w=1200', // Plastic waste piles
    severity: 'Medium',
    status: 'Resolved',
    risk_score: 42,
    user_id: 'mock-user-4',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  },
  {
    id: 'report-5',
    title: 'Uncontrolled Gas Flare & Black Smoke at Refinery Outlet',
    description: 'The eastern flare stack has been venting large amounts of thick, black soot-filled smoke continuously for the past six hours. The air smells strongly of sulfur and burning rubber. Nearby residents report headaches and breathing irritation.',
    category: 'Air Pollution',
    latitude: 47.5682,
    longitude: -122.3421,
    location_name: 'Industrial Canal Eastern Refinery',
    image_url: 'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?auto=format&fit=crop&q=80&w=1200', // Smog chimney
    severity: 'High',
    status: 'Under Review',
    risk_score: 83,
    user_id: 'mock-user-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'report-6',
    title: 'Discarded Lead-Acid Batteries in Wetland Preserve',
    description: 'Around twelve heavy vehicle batteries have been dumped directly into the marshy reeds. Acid leakage is visible as a white crust on the soil, and a metallic sheen is spreading on the water surface where birds nest.',
    category: 'Hazardous Waste',
    latitude: 47.6042,
    longitude: -122.3015,
    location_name: 'Union Bay Natural Area, Seattle',
    image_url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=1200', // Trash dump
    severity: 'Critical',
    status: 'Verified',
    risk_score: 96,
    user_id: 'mock-user-5',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  }
];

const SEED_VOTES: ReportVote[] = [
  { id: 'v-1', report_id: 'report-1', user_id: 'mock-user-2', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-2', report_id: 'report-1', user_id: 'mock-user-3', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-3', report_id: 'report-1', user_id: 'mock-user-4', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-4', report_id: 'report-1', user_id: 'mock-user-5', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-5', report_id: 'report-1', user_id: 'mock-user-6', vote_type: 'dispute', created_at: new Date().toISOString() },
  { id: 'v-6', report_id: 'report-2', user_id: 'mock-user-1', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-7', report_id: 'report-2', user_id: 'mock-user-3', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-8', report_id: 'report-2', user_id: 'mock-user-4', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-9', report_id: 'report-3', user_id: 'mock-user-1', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-10', report_id: 'report-3', user_id: 'mock-user-2', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-11', report_id: 'report-5', user_id: 'mock-user-2', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-12', report_id: 'report-5', user_id: 'mock-user-3', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-13', report_id: 'report-5', user_id: 'mock-user-4', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-14', report_id: 'report-5', user_id: 'mock-user-5', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-15', report_id: 'report-6', user_id: 'mock-user-1', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-16', report_id: 'report-6', user_id: 'mock-user-2', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-17', report_id: 'report-6', user_id: 'mock-user-3', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-18', report_id: 'report-6', user_id: 'mock-user-4', vote_type: 'confirm', created_at: new Date().toISOString() },
  { id: 'v-19', report_id: 'report-6', user_id: 'mock-user-6', vote_type: 'confirm', created_at: new Date().toISOString() },
];

const SEED_UPDATES: ReportUpdate[] = [
  {
    id: 'update-1',
    report_id: 'report-4',
    user_id: 'mock-user-2',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200', // Clean forest path
    description: 'A community cleanup crew convened over the weekend. All bulk construction debris and plastics have been successfully cleared and transported to the local recycling depot. The pathway is fully restored.',
    improvement_pct: 100,
    pollution_reduced: 95,
    recovery_status: 'Recovered',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user_name: 'Jane Doe (Eco Ranger)',
  }
];

const SEED_ANALYSES: AIAnalysis[] = [
  {
    id: 'ai-1',
    report_id: 'report-1',
    detected_issue: 'Toxic Chemical Contamination & Illegal Waste Disposal',
    confidence: 94,
    severity: 'Critical',
    environmental_impact: 'High risk of soil contamination and chemical leaching into the river. Solvents can decimate local salmon eggs and lead to heavy metals poisoning in the aquatic food web.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ai-2',
    report_id: 'report-2',
    detected_issue: 'Toxic Cyanobacteria Bloom (Algal Bloom)',
    confidence: 89,
    severity: 'High',
    environmental_impact: 'Algal toxins pose severe neurological and liver dangers to pets and humans. Eutrophication leads to oxygen depletion, killing fish and aquatic plants.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ai-3',
    report_id: 'report-3',
    detected_issue: 'Unauthorized Forest Logging (Deforestation)',
    confidence: 82,
    severity: 'High',
    environmental_impact: 'Immediate loss of tree canopy disrupts local nesting species and triggers soil erosion. Clearing mature trees significantly reduces carbon sequestration capacity.',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ai-4',
    report_id: 'report-4',
    detected_issue: 'Non-Biodegradable Construction Waste Dumping',
    confidence: 96,
    severity: 'Medium',
    environmental_impact: 'Physical obstruction of wildlife movement. Microplastics breakdown risks contaminating nearby sands and soil over years.',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ai-5',
    report_id: 'report-5',
    detected_issue: 'Industrial Carbon Combustion Soot Emissary',
    confidence: 91,
    severity: 'High',
    environmental_impact: 'Particulate matter PM2.5 release, causing air quality degradation, acid rain precursors, and respiratory hazards for surrounding communities.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ai-6',
    report_id: 'report-6',
    detected_issue: 'Heavy Metal Lead-Acid Leakage',
    confidence: 95,
    severity: 'Critical',
    environmental_impact: 'Lead and sulfuric acid are extremely toxic. Direct runoff sterilizes water flora, inhibits avian reproduction, and contaminates deep aquifers.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Initialize the global mock database if it doesn't exist
const globalForMock = globalThis as any;
if (!globalForMock.mockDb) {
  globalForMock.mockDb = {
    reports: SEED_REPORTS,
    votes: SEED_VOTES,
    updates: SEED_UPDATES,
    analyses: SEED_ANALYSES,
  } as MockDatabase;
}

const mockDb: MockDatabase = globalForMock.mockDb;

// Helper to calculate risk score
import { calculateRiskScore } from './risk';

function getVotesCountForReport(reportId: string) {
  const votes = mockDb.votes.filter((v) => v.report_id === reportId);
  const confirm = votes.filter((v) => v.vote_type === 'confirm').length;
  const dispute = votes.filter((v) => v.vote_type === 'dispute').length;
  return { confirm, dispute };
}

// ---------------------------------------------------------
// DATABASE WRAPPER API FUNCTIONS
// ---------------------------------------------------------

export async function fetchReports(filters?: {
  category?: string;
  severity?: string;
  status?: string;
  search?: string;
}): Promise<Report[]> {
  if (isConfigured && supabase) {
    let query = supabase
      .from('reports')
      .select('*, users(full_name, email)');

    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters?.severity && filters.severity !== 'All') {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location_name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // Fetch votes for each
    const reports = data as any[];
    const reportsWithVotes = await Promise.all(
      reports.map(async (r) => {
        const { data: votes } = await supabase!
          .from('report_votes')
          .select('vote_type');
        
        const confirm = votes?.filter((v) => v.vote_type === 'confirm').length || 0;
        const dispute = votes?.filter((v) => v.vote_type === 'dispute').length || 0;
        
        return {
          ...r,
          votes_count: { confirm, dispute },
        };
      })
    );
    return reportsWithVotes;
  } else {
    // Mock database logic
    let result = [...mockDb.reports];

    if (filters?.category && filters.category !== 'All') {
      result = result.filter((r) => r.category === filters.category);
    }
    if (filters?.severity && filters.severity !== 'All') {
      result = result.filter((r) => r.severity === filters.severity);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((r) => r.status === filters.status);
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

    // Sort by created_at desc
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Map votes
    return result.map((r) => {
      const votes_count = getVotesCountForReport(r.id);
      const { score } = calculateRiskScore(r.severity, votes_count, r.category);
      return {
        ...r,
        votes_count,
        risk_score: score,
        users: r.users || { full_name: 'Eco Watcher', email: 'watcher@ecowatch.ai' }
      };
    });
  }
}

export async function fetchReportById(id: string, currentUserId?: string): Promise<Report | null> {
  if (isConfigured && supabase) {
    const { data: report, error } = await supabase
      .from('reports')
      .select('*, users(full_name, email)')
      .eq('id', id)
      .single();

    if (error || !report) return null;

    // Fetch votes
    const { data: votes } = await supabase
      .from('report_votes')
      .select('vote_type, user_id')
      .eq('report_id', id);

    const confirm = votes?.filter((v) => v.vote_type === 'confirm').length || 0;
    const dispute = votes?.filter((v) => v.vote_type === 'dispute').length || 0;

    let user_vote: VoteType | null = null;
    if (currentUserId && votes) {
      const match = votes.find((v) => v.user_id === currentUserId);
      if (match) user_vote = match.vote_type as VoteType;
    }

    return {
      ...report,
      votes_count: { confirm, dispute },
      user_vote,
    };
  } else {
    const report = mockDb.reports.find((r) => r.id === id);
    if (!report) return null;

    const votes_count = getVotesCountForReport(report.id);
    const { score } = calculateRiskScore(report.severity, votes_count, report.category);

    let user_vote: VoteType | null = null;
    if (currentUserId) {
      const match = mockDb.votes.find((v) => v.report_id === id && v.user_id === currentUserId);
      if (match) user_vote = match.vote_type;
    }

    return {
      ...report,
      votes_count,
      risk_score: score,
      user_vote,
      users: report.users || { full_name: 'Eco Watcher', email: 'watcher@ecowatch.ai' }
    };
  }
}

export async function insertReport(report: Omit<Report, 'id' | 'created_at' | 'risk_score' | 'status'>): Promise<Report> {
  if (isConfigured && supabase) {
    const initialRisk = calculateRiskScore(report.severity, { confirm: 0, dispute: 0 }, report.category).score;
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        ...report,
        status: 'Pending',
        risk_score: initialRisk,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const id = `report-${Date.now()}`;
    const newReport: Report = {
      ...report,
      id,
      status: 'Pending',
      risk_score: calculateRiskScore(report.severity, { confirm: 0, dispute: 0 }, report.category).score,
      created_at: new Date().toISOString(),
      users: { full_name: 'Logged In User', email: 'user@ecowatch.ai' }
    };
    mockDb.reports.push(newReport);
    return newReport;
  }
}

export async function castVote(reportId: string, userId: string, voteType: VoteType): Promise<Report> {
  if (isConfigured && supabase) {
    // UPSERT vote
    const { error: voteError } = await supabase
      .from('report_votes')
      .upsert({
        report_id: reportId,
        user_id: userId,
        vote_type: voteType,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'report_id,user_id'
      });

    if (voteError) throw voteError;

    // Recalculate status / risk
    const report = await fetchReportById(reportId, userId);
    if (!report) throw new Error('Report not found');

    const votes_count = report.votes_count || { confirm: 0, dispute: 0 };
    const { score } = calculateRiskScore(report.severity, votes_count, report.category);

    // If confirm votes exceed 5 and status is Pending, verify it
    let newStatus = report.status;
    if (report.status === 'Pending' && votes_count.confirm >= 5) {
      newStatus = 'Verified';
    }

    const { data: updatedReport, error: updateError } = await supabase
      .from('reports')
      .update({
        risk_score: score,
        status: newStatus,
      })
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) throw updateError;
    return {
      ...updatedReport,
      votes_count,
      user_vote: voteType,
    };
  } else {
    // Mock implementation
    const existingVoteIdx = mockDb.votes.findIndex((v) => v.report_id === reportId && v.user_id === userId);
    if (existingVoteIdx >= 0) {
      mockDb.votes[existingVoteIdx].vote_type = voteType;
    } else {
      mockDb.votes.push({
        id: `v-${Date.now()}`,
        report_id: reportId,
        user_id: userId,
        vote_type: voteType,
        created_at: new Date().toISOString()
      });
    }

    const report = mockDb.reports.find((r) => r.id === reportId);
    if (!report) throw new Error('Report not found');

    const votes_count = getVotesCountForReport(reportId);
    const { score } = calculateRiskScore(report.severity, votes_count, report.category);

    if (report.status === 'Pending' && votes_count.confirm >= 5) {
      report.status = 'Verified';
    }
    report.risk_score = score;

    return {
      ...report,
      votes_count,
      user_vote: voteType,
      users: report.users || { full_name: 'Eco Watcher', email: 'watcher@ecowatch.ai' }
    };
  }
}

export async function fetchReportUpdates(reportId: string): Promise<ReportUpdate[]> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('report_updates')
      .select('*, users(full_name)')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map((u: any) => ({
      ...u,
      user_name: u.users?.full_name || 'Eco Ranger'
    }));
  } else {
    return mockDb.updates
      .filter((u) => u.report_id === reportId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}

export async function insertReportUpdate(update: Omit<ReportUpdate, 'id' | 'created_at'>): Promise<ReportUpdate> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('report_updates')
      .insert([update])
      .select()
      .single();

    if (error) throw error;

    // If recovery_status is 'Recovered', mark report status as Resolved
    if (update.recovery_status === 'Recovered') {
      await supabase
        .from('reports')
        .update({ status: 'Resolved' })
        .eq('id', update.report_id);
    }

    return {
      ...data,
      user_name: 'Logged In User'
    };
  } else {
    const newUpdate: ReportUpdate = {
      ...update,
      id: `update-${Date.now()}`,
      created_at: new Date().toISOString(),
      user_name: 'Logged In User'
    };
    mockDb.updates.push(newUpdate);

    // Update report status if recovered
    const report = mockDb.reports.find((r) => r.id === update.report_id);
    if (report && update.recovery_status === 'Recovered') {
      report.status = 'Resolved';
    }

    return newUpdate;
  }
}

export async function fetchAIAnalysisByReportId(reportId: string): Promise<AIAnalysis | null> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('report_id', reportId)
      .maybeSingle();

    if (error) return null;
    return data;
  } else {
    return mockDb.analyses.find((a) => a.report_id === reportId) || null;
  }
}

export async function insertAIAnalysis(analysis: Omit<AIAnalysis, 'id' | 'created_at'>): Promise<AIAnalysis> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('ai_analysis')
      .insert([analysis])
      .select()
      .single();

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
