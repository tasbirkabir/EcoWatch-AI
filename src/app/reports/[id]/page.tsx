'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Flame,
  Award,
  AlertCircle,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Camera,
  Upload,
  CheckCircle,
  Clock,
  Loader2,
  TrendingUp,
  Activity,
  History,
  Building,
  Scale
} from 'lucide-react';
import { Incident, AIAnalysis, IncidentUpdate, VoteType, RecoveryStatus, IncidentSeverity } from '@/types';

// Load Leaflet Map dynamically
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">Loading Geospatial Engine...</div>
});

export default function IncidentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [id, setId] = useState<string | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voting
  const [voting, setVoting] = useState(false);

  // Follow-up Update form
  const [updateImage, setUpdateImage] = useState<string | null>(null);
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateType, setUpdateType] = useState<'cleanup' | 'comment'>('cleanup');
  const [wasteRemovedKg, setWasteRemovedKg] = useState('0');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const fetchIncidentData = async () => {
    if (!id) return;
    try {
      const userParam = user ? `?userId=${user.id}` : '';
      const res = await fetch(`/api/incidents/${id}${userParam}`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setIncident(data.incident);
      setAiAnalysis(data.analysis);

      // Fetch updates
      const updatesRes = await fetch(`/api/incidents/${id}/updates`);
      const updatesData = await updatesRes.json();
      setUpdates(updatesData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load incident record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchIncidentData();
    }
  }, [id, user]);

  const handleVote = async (type: VoteType) => {
    if (!incident || !id) return;
    if (!user) {
      alert('Please log in or sign up to cast validation votes.');
      router.push('/login');
      return;
    }

    setVoting(true);
    try {
      const res = await fetch(`/api/incidents/${id}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          voteType: type
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setIncident(prev => prev ? {
        ...prev,
        votes_count: data.votes_count,
        risk_score: data.risk_score,
        user_vote: data.user_vote,
        status: data.status,
        risk_breakdown: data.risk_breakdown
      } : null);
    } catch (err: any) {
      alert(err.message || 'Failed to cast vote.');
    } finally {
      setVoting(false);
    }
  };

  const handleUpdateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUpdateImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !updateDescription) return;

    setSubmittingUpdate(true);
    try {
      const res = await fetch(`/api/incidents/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          image_url: updateImage,
          description: updateDescription,
          update_type: updateType,
          waste_removed_kg: Number(wasteRemovedKg || 0)
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setUpdates(prev => [...prev, data]);
      setUpdateImage(null);
      setUpdateDescription('');
      setWasteRemovedKg('0');
      
      fetchIncidentData(); // Reload details (e.g. resolved status check)
    } catch (err: any) {
      alert(err.message || 'Failed to publish progress update.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mr-2" />
        Syncing Geolocation Node...
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-md mx-auto my-16 text-center glass-panel p-8 rounded-3xl border border-rose-500/20 text-rose-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-4" />
        <h3 className="font-bold mb-2">Record Offline</h3>
        <p className="text-xs text-muted-foreground mb-4">{error || 'This incident record does not exist or has been resolved.'}</p>
        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-xs font-semibold">
          Dashboard Control
        </button>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
    if (score >= 60) return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    if (score >= 35) return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
    return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Critical Threat';
    if (score >= 60) return 'High Threat';
    if (score >= 35) return 'Moderate Threat';
    return 'Low Threat';
  };

  const getStatusStyle = (st: string) => {
    switch (st) {
      case 'Resolved': return 'status-badge-resolved';
      case 'Investigating': return 'status-badge-investigating';
      case 'Under Review': return 'status-badge-review';
      case 'Verified': return 'status-badge-verified';
      case 'Pending': return 'status-badge-pending';
      default: return 'bg-white/5 border border-border text-muted-foreground';
    }
  };

  const calculateTrustScore = () => {
    const confirms = incident.votes_count?.confirm || 0;
    const disputes = incident.votes_count?.dispute || 0;
    const rawRatio = (confirms + 1) / (confirms + disputes + 2);
    return Math.round(rawRatio * 100);
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 px-4 py-2 border border-border bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Registry Directory
      </button>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left / Center */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
            <div className="h-96 w-full relative bg-black/40">
              <img
                src={incident.image_url}
                alt={incident.title}
                className="object-cover w-full h-full"
              />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[10px] font-extrabold uppercase rounded-lg border border-white/10 text-white">
                  {incident.category}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${getStatusStyle(incident.status)}`}>
                  {incident.status}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  {incident.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <strong>{incident.location_name}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    {new Date(incident.created_at).toLocaleDateString(undefined, { dateStyle: 'full' })}
                  </span>
                  {incident.users && (
                    <span className="flex items-center gap-1">
                      Logged by <strong className="text-foreground">{incident.users.full_name}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</h3>
                <p className="text-sm leading-relaxed text-foreground/80 font-medium whitespace-pre-line">
                  {incident.description}
                </p>
              </div>

              {incident.additional_notes && (
                <div className="p-4 bg-white/5 border border-border rounded-2xl space-y-1">
                  <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Inspector Field Notes</h4>
                  <p className="text-xs text-foreground/80 leading-relaxed font-medium">{incident.additional_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI DIAGNOSTICS */}
          {aiAnalysis && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/5 blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold">AI Diagnostics & Action Directives</h2>
                </div>
                <span className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest bg-cyan-500/5 px-2.5 py-0.5 rounded border border-cyan-500/10">
                  Gemini API Core
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div className="p-4 bg-white/5 border border-border rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Identified Threat</span>
                  <p className="text-sm font-semibold mt-1 text-foreground leading-snug">{aiAnalysis.detected_issue}</p>
                </div>

                <div className="p-4 bg-white/5 border border-border rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scan Confidence</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-bold text-cyan-400">{aiAnalysis.confidence}%</span>
                    <div className="flex-grow h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${aiAnalysis.confidence}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-border rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Severity Rating</span>
                  <div className="mt-1">
                    <span className={`px-2.5 py-0.5 rounded-lg text-2xs font-extrabold uppercase inline-block border ${
                      aiAnalysis.severity === 'Critical' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                      aiAnalysis.severity === 'High' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                      aiAnalysis.severity === 'Moderate' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                      'bg-slate-500/15 text-slate-400 border-slate-500/30'
                    }`}>
                      {aiAnalysis.severity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Impact */}
                <div className="p-4 bg-white/5 border border-border rounded-2xl">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">Ecological Impact</span>
                  <p className="text-xs leading-relaxed text-foreground/80 font-medium">
                    {aiAnalysis.environmental_impact}
                  </p>
                </div>

                {/* Recommended action */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl border-l-4 border-l-emerald-500">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Recommended Response Action</span>
                  <p className="text-xs leading-relaxed text-foreground/85 font-semibold">
                    {aiAnalysis.recommended_action}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TIMELINE */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold">Investigation & Remediation logs</h2>
            </div>

            {updates.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-2xl bg-white/5 text-muted-foreground flex flex-col items-center justify-center p-4">
                <Clock className="w-8 h-8 text-muted-foreground/60 mb-2" />
                <span className="text-xs font-semibold">No remediation records filed yet.</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">NGOs and Agencies can log action updates using the side form.</span>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-border space-y-6">
                {updates.map((update) => (
                  <div key={update.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 border-card bg-cyan-400 flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 hover:border-cyan-500/20 transition-all duration-300">
                      
                      {update.image_url && (
                        <div className="rounded-xl overflow-hidden border border-border h-24 bg-black/40">
                          <img
                            src={update.image_url}
                            alt="Progress scan"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}

                      <div className={update.image_url ? 'md:col-span-3 space-y-2.5' : 'md:col-span-4 space-y-2.5'}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Filed: {new Date(update.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            update.update_type === 'cleanup' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {update.update_type}
                          </span>
                        </div>
                        
                        <p className="text-xs leading-relaxed text-foreground/80 font-medium">
                          {update.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border text-[10px] text-muted-foreground">
                          {update.user_name && (
                            <span>
                              Logged by: <strong className="text-foreground">{update.user_name}</strong> 
                              {update.user_org && ` (${update.user_org})`}
                            </span>
                          )}
                          {update.waste_removed_kg > 0 && (
                            <span className="text-emerald-400 font-bold">
                              Waste Removed: {update.waste_removed_kg} kg
                            </span>
                          )}
                          {update.improvement_pct > 0 && (
                            <span className="text-cyan-400 font-bold">
                              Improvement: {update.improvement_pct}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          
          {/* COMPOSITE RISK ENGINE */}
          <div className={`glass-panel p-6 rounded-3xl border border-white/5 ${getRiskColor(incident.risk_score || 0)}`}>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Ecosystem Risk score</span>
            <div className="flex items-baseline justify-between mt-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{getRiskLabel(incident.risk_score || 0)}</h2>
              <span className="text-2xl font-extrabold text-foreground">{incident.risk_score}%</span>
            </div>
            
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  (incident.risk_score || 0) >= 80 ? 'bg-rose-500' :
                  (incident.risk_score || 0) >= 60 ? 'bg-orange-500' :
                  (incident.risk_score || 0) >= 35 ? 'bg-yellow-500' :
                  'bg-slate-400'
                }`}
                style={{ width: `${incident.risk_score}%` }}
              />
            </div>
            
            {/* Expanded 5-factor display */}
            {incident.risk_breakdown && (
              <div className="mt-4 pt-4 border-t border-black/10 text-[10px] space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>AI Severity (S * 3.5):</span>
                  <span className="font-semibold text-foreground">{incident.risk_breakdown.base_severity * 3.5}</span>
                </div>
                <div className="flex justify-between">
                  <span>Validation Bias (V * 1.5):</span>
                  <span className="font-semibold text-foreground">{incident.risk_breakdown.validation_factor * 1.5}</span>
                </div>
                <div className="flex justify-between">
                  <span>Population Density (P * 2.0):</span>
                  <span className="font-semibold text-foreground">{incident.risk_breakdown.population_density * 2.0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ecosystem Sensitivity (E * 2.0):</span>
                  <span className="font-semibold text-foreground">{incident.risk_breakdown.env_sensitivity * 2.0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proximity Frequency (F * 1.0):</span>
                  <span className="font-semibold text-foreground">{incident.risk_breakdown.frequency_index * 1.0}</span>
                </div>
              </div>
            )}
          </div>

          {/* TRUST SCORE & VOTING */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold">Community Consensus Validation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify this reported incident. Confirm if you have witnessed this issue, or dispute it if details are incorrect.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVote('confirm')}
                disabled={voting}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  incident.user_vote === 'confirm'
                    ? 'bg-cyan-500/25 border-cyan-500 text-cyan-400'
                    : 'bg-white/5 border-border hover:bg-white/10 hover:text-cyan-400'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Confirm ({incident.votes_count?.confirm || 0})
              </button>

              <button
                onClick={() => handleVote('dispute')}
                disabled={voting}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  incident.user_vote === 'dispute'
                    ? 'bg-rose-500/25 border-rose-500 text-rose-500'
                    : 'bg-white/5 border-border hover:bg-white/10 hover:text-rose-500'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                Dispute ({incident.votes_count?.dispute || 0})
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-cyan-500/5 rounded-xl text-xs text-cyan-400 border border-cyan-500/10">
              <span className="font-semibold">Laplace Consensus Trust:</span>
              <span className="font-black text-sm">{calculateTrustScore()}%</span>
            </div>
          </div>

          {/* GEOLOCATION */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-500" />
              Spatial Node Coordinates
            </h3>
            <div className="h-44 w-full rounded-xl overflow-hidden border border-border">
              <LeafletMap
                center={[incident.latitude, incident.longitude]}
                zoom={14}
                markers={[{
                  id: incident.id,
                  title: incident.title,
                  latitude: incident.latitude,
                  longitude: incident.longitude,
                  category: incident.category,
                  severity: incident.severity,
                  risk_score: incident.risk_score
                }]}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 font-mono">
              <span>LAT: {incident.latitude.toFixed(5)}</span>
              <span>LNG: {incident.longitude.toFixed(5)}</span>
            </div>
          </div>

          {/* PROGRESS SUBMISSION PANEL */}
          {incident.status !== 'Resolved' && (
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                Log Response Action
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Log cleanup progress or field comments. Cleanups with follow-up photos trigger Gemini comparisons to estimate resolution.
              </p>

              <form onSubmit={handleSubmitUpdate} className="space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUpdateType('cleanup')}
                    className={`py-2 rounded-xl text-2xs font-bold border transition ${
                      updateType === 'cleanup' ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400' : 'bg-white/5 border-border hover:bg-white/10 text-muted-foreground'
                    }`}
                  >
                    Cleanup Action
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateType('comment')}
                    className={`py-2 rounded-xl text-2xs font-bold border transition ${
                      updateType === 'comment' ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400' : 'bg-white/5 border-border hover:bg-white/10 text-muted-foreground'
                    }`}
                  >
                    General Comment
                  </button>
                </div>

                {/* Cleanup fields */}
                {updateType === 'cleanup' && (
                  <>
                    {/* Image */}
                    {updateImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-border h-36 bg-black/40 group">
                        <img
                          src={updateImage}
                          alt="Progress scan preview"
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => setUpdateImage(null)}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
                        >
                          Change Photo
                        </button>
                      </div>
                    ) : (
                      <div className="border border-dashed border-border rounded-xl p-5 text-center bg-white/5 hover:bg-white/10 transition relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUpdateImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                        <span className="text-2xs font-bold block">Upload Remediation Photo</span>
                      </div>
                    )}

                    {/* Waste weight */}
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                        Waste Removed (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={wasteRemovedKg}
                        onChange={(e) => setWasteRemovedKg(e.target.value)}
                        placeholder="e.g. 150"
                        className="block w-full px-3 py-2.5 bg-white/5 border border-border rounded-xl text-xs placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 transition"
                      />
                    </div>
                  </>
                )}

                {/* Description */}
                <div>
                  <textarea
                    required
                    rows={3}
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    placeholder={updateType === 'cleanup' ? 'Describe cleanup details... (e.g. Removed 4 chemical drums)' : 'Record incident remarks...'}
                    className="block w-full px-3 py-2 bg-white/5 border border-border rounded-xl text-xs placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingUpdate || (updateType === 'cleanup' && !updateImage) || !updateDescription}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50"
                >
                  {submittingUpdate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving action...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Publish update log
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
