'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import {
  ShieldAlert,
  Loader2,
  AlertTriangle,
  Building,
  CheckCircle,
  Clock,
  Briefcase,
  UserCheck,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { Incident, Organization, IncidentStatus } from '@/types';

export default function AuthorityDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and actions states
  const [statusFilter, setStatusFilter] = useState<string>('Active'); // Active vs Resolved
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Redirect if not logged in as authority in production (we will allow testing in demo)
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch incidents
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setIncidents(data);

      // Fetch organizations
      const orgRes = await fetch('/api/incidents'); // We can fetch from local db helper
      const { fetchOrganizations } = await import('@/lib/db');
      const orgs = await fetchOrganizations();
      setOrganizations(orgs);
    } catch (err) {
      console.error('Error fetching authority data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (incidentId: string, status: IncidentStatus) => {
    setUpdatingId(incidentId);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Update local state
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: data.status } : inc));
    } catch (err: any) {
      alert(err.message || 'Failed to update incident status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOrgAssignment = async (incidentId: string, assignedOrgId: string) => {
    setUpdatingId(incidentId);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Investigating', // Auto set to investigating once assigned
          assignedOrgId: assignedOrgId || null
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setIncidents(prev => prev.map(inc => inc.id === incidentId ? { 
        ...inc, 
        assigned_org_id: data.assigned_org_id,
        assigned_org: data.assigned_org,
        status: data.status 
      } : inc));
    } catch (err: any) {
      alert(err.message || 'Failed to assign organization.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mr-2" />
        Syncing Command Grid...
      </div>
    );
  }

  // Filtered incidents queue: high-risk first
  const activeIncidents = incidents.filter(inc => statusFilter === 'Active' ? inc.status !== 'Resolved' : inc.status === 'Resolved');
  const sortedQueue = [...activeIncidents].sort((a, b) => b.risk_score - a.risk_score);

  // Recommended Resource mapping based on Category
  const getRecommendedResource = (category: string) => {
    switch (category) {
      case 'Hazardous Waste':
        return 'Deploy chemical containment barriers & soil sampling kits.';
      case 'Water Pollution':
        return 'Dispatch water analysis unit & install filter barriers.';
      case 'Deforestation':
        return 'Deploy boundary rangers & check flight/drone paths.';
      case 'Air Pollution':
        return 'Deploy air sampling station & alert emission auditor.';
      case 'Wildlife Threats':
        return 'Send conservation officer & clear physical log barricades.';
      case 'Illegal Dumping':
        return 'Send waste collection crews & set solar camera boxes.';
      default:
        return 'Dispatch field inspector to confirm environmental threat.';
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/25 rounded-2xl flex items-center justify-center text-cyan-400">
            <Building className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Authority Command Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
               NGO & Gov Agency Priority Dispatch and Resource Allocation Dashboard.
            </p>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-4 py-2 border border-border bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Sync Priority Queue
        </button>
      </div>

      {/* Demo helper banner if logged in as contributor */}
      {user && !user.org_id && (
        <div className="mb-6 p-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 flex items-start gap-2.5 text-xs text-cyan-400">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Demo Simulation Mode:</strong>
            You are logged in as a normal citizen contributor. We are showing you this Authority dashboard for evaluation convenience so you can verify the status routing and assignments of incidents!
          </div>
        </div>
      )}

      {/* Queue Filter */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <Filter className="w-4.5 h-4.5 text-muted-foreground" />
        <button
          onClick={() => setStatusFilter('Active')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'Active' ? 'bg-cyan-500/15 text-cyan-400' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Unresolved Priority Queue ({incidents.filter(i => i.status !== 'Resolved').length})
        </button>
        <button
          onClick={() => setStatusFilter('Resolved')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Resolved Archive ({incidents.filter(i => i.status === 'Resolved').length})
        </button>
      </div>

      {/* Prioritized Incidents Table list */}
      {sortedQueue.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-white/5 max-w-lg mx-auto p-4">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Queue Fully Cleared</h3>
          <p className="text-sm text-muted-foreground">
            No active incidents matching this status filter are currently assigned to your dashboard registry.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQueue.map((inc) => {
            const recommended = getRecommendedResource(inc.category);
            return (
              <div
                key={inc.id}
                className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-cyan-500/15 transition-all duration-300 grid grid-cols-1 lg:grid-cols-4 gap-6 relative overflow-hidden"
              >
                {/* Visual indicator line based on severity */}
                <div className={`absolute left-0 inset-y-0 w-1 ${
                  inc.severity === 'Critical' ? 'bg-rose-500' :
                  inc.severity === 'High' ? 'bg-orange-500' :
                  inc.severity === 'Moderate' ? 'bg-yellow-500' :
                  'bg-slate-500'
                }`} />

                {/* Col 1: Basic details and thumbnail */}
                <div className="lg:col-span-2 flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-border bg-black/40 flex-shrink-0">
                    <img
                      src={inc.image_url}
                      alt={inc.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        inc.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                        inc.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        inc.severity === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{inc.severity}</span>
                      <span className="text-[9px] text-muted-foreground font-semibold uppercase">{inc.category}</span>
                    </div>
                    
                    <h3 className="font-bold text-sm leading-tight text-foreground truncate hover:text-cyan-400">
                      <Link href={`/reports/${inc.id}`} className="flex items-center gap-1">
                        {inc.title}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-500/60" />
                      <span className="truncate">{inc.location_name}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1.5">
                      <span>Threat Risk Index: <strong className="text-foreground">{inc.risk_score}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Col 2: Resource recommendations & notes */}
                <div className="p-4 bg-white/5 border border-border rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Resource Recommendation
                    </span>
                    <p className="text-[11px] mt-1 text-foreground/80 leading-normal font-medium">{recommended}</p>
                  </div>
                  
                  {inc.additional_notes && (
                    <div className="mt-2 text-[9px] text-muted-foreground italic leading-normal truncate">
                      Notes: {inc.additional_notes}
                    </div>
                  )}
                </div>

                {/* Col 3: Controls (Status and Assignment) */}
                <div className="flex flex-col justify-center gap-3">
                  {/* Status update selector */}
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Dispatch Status
                    </label>
                    <select
                      value={inc.status}
                      disabled={updatingId === inc.id}
                      onChange={(e) => handleStatusChange(inc.id, e.target.value as IncidentStatus)}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Assignment selector */}
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Assign Commission
                    </label>
                    <select
                      value={inc.assigned_org_id || ''}
                      disabled={updatingId === inc.id}
                      onChange={(e) => handleOrgAssignment(inc.id, e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer text-muted-foreground"
                    >
                      <option value="">Unassigned</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
