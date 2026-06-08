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
  History
} from 'lucide-react';
import { Report, AIAnalysis, ReportUpdate, VoteType, RecoveryStatus, IncidentSeverity } from '@/types';

// Load Leaflet Map dynamically (client-side only)
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">Loading Map View...</div>
});

export default function ReportDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [id, setId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [updates, setUpdates] = useState<ReportUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voting state
  const [voting, setVoting] = useState(false);

  // Follow-up Update form state
  const [updateImage, setUpdateImage] = useState<string | null>(null);
  const [updateDescription, setUpdateDescription] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Resolve params promise
  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const fetchReportData = async () => {
    if (!id) return;
    try {
      const userParam = user ? `?userId=${user.id}` : '';
      const res = await fetch(`/api/reports/${id}${userParam}`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setReport(data.report);
      setAiAnalysis(data.analysis);

      // Fetch timeline updates
      const updatesRes = await fetch(`/api/reports/${id}/updates`);
      const updatesData = await updatesRes.json();
      setUpdates(updatesData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReportData();
    }
  }, [id, user]);

  // Handle Casting a Community Vote
  const handleVote = async (type: VoteType) => {
    if (!report || !id) return;
    if (!user) {
      alert('Please log in or sign up to cast verification votes.');
      router.push('/login');
      return;
    }

    setVoting(true);
    try {
      const res = await fetch(`/api/reports/${id}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          voteType: type
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Update local report votes state
      setReport(prev => prev ? {
        ...prev,
        votes_count: data.votes_count,
        risk_score: data.risk_score,
        user_vote: data.user_vote,
        status: data.status
      } : null);
    } catch (err: any) {
      alert(err.message || 'Failed to cast vote.');
    } finally {
      setVoting(false);
    }
  };

  // Handle Uploading Follow-Up Update Picture
  const handleUpdateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUpdateImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Follow-Up Recovery Update
  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !updateImage || !updateDescription) return;

    setSubmittingUpdate(true);
    try {
      const res = await fetch(`/api/reports/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          image_url: updateImage,
          description: updateDescription
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Append update to local array and trigger fresh report detail fetch
      setUpdates(prev => [...prev, data]);
      setUpdateSuccess(true);
      setUpdateImage(null);
      setUpdateDescription('');
      
      // Reload report details (status might have changed to Resolved)
      fetchReportData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish progress update.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mr-2" />
        Retrieving Incident File...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-16 text-center glass-panel p-8 rounded-3xl border border-rose-500/20 text-rose-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-4" />
        <h3 className="font-bold mb-2">Record Not Found</h3>
        <p className="text-xs text-muted-foreground mb-4">{error || 'This report does not exist or has been archived.'}</p>
        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Risk calculation styling variables
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
    if (score >= 60) return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    if (score >= 35) return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
    return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Critical Risk';
    if (score >= 60) return 'High Risk';
    if (score >= 35) return 'Medium Risk';
    return 'Low Risk';
  };

  const getStatusStyle = (st: string) => {
    switch (st) {
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'Under Review': return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      case 'Verified': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      case 'Pending': return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
      default: return 'bg-white/5 border border-border text-muted-foreground';
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Breadcrumb nav */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 px-4 py-2 border border-border bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </button>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER PANEL: Incident Card + AI + Updates (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Incident Card */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
            {/* Image display */}
            <div className="h-96 w-full relative bg-black/40">
              <img
                src={report.image_url}
                alt={report.title}
                className="object-cover w-full h-full"
              />
              
              {/* Category / Status absolute tags */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[10px] font-extrabold uppercase rounded-lg border border-white/10 text-white">
                  {report.category}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${getStatusStyle(report.status)}`}>
                  {report.status}
                </span>
              </div>
            </div>

            {/* Details body */}
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  {report.title}
                </h1>
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <strong>{report.location_name}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    {new Date(report.created_at).toLocaleDateString(undefined, { dateStyle: 'full' })}
                  </span>
                  {report.users && (
                    <span className="flex items-center gap-1">
                      Reported by <strong className="text-foreground">{report.users.full_name}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</h3>
                <p className="text-sm leading-relaxed text-foreground/80 font-medium whitespace-pre-line">
                  {report.description}
                </p>
              </div>
            </div>
          </div>

          {/* AI DIAGNOSTICS CARD */}
          {aiAnalysis && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/5 blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold">AI Diagnostic Assessment</h2>
                </div>
                <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  Gemini-V1.5
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div className="p-4 bg-white/5 border border-border rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Classified Hazard</span>
                  <p className="text-sm font-semibold mt-1 text-foreground leading-snug">{aiAnalysis.detected_issue}</p>
                </div>

                <div className="p-4 bg-white/5 border border-border rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Confidence Level</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-bold text-emerald-400">{aiAnalysis.confidence}%</span>
                    <div className="flex-grow h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${aiAnalysis.confidence}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-border rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Severity</span>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded-md text-2xs font-extrabold uppercase inline-block border ${
                      aiAnalysis.severity === 'Critical' ? 'bg-rose-500/15 text-rose-500 border-rose-500/30' :
                      aiAnalysis.severity === 'High' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                      aiAnalysis.severity === 'Medium' ? 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30' :
                      'bg-slate-500/15 text-slate-400 border-slate-500/30'
                    }`}>
                      {aiAnalysis.severity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Impact Paragraph */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse-slow" />
                  Ecosystem Risk Evaluation
                </span>
                <p className="text-xs mt-1.5 leading-relaxed text-foreground/85 font-medium">
                  {aiAnalysis.environmental_impact}
                </p>
              </div>
            </div>
          )}

          {/* MONITORING & RECOVERY TIMELINE */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Recovery Timeline & Monitoring Logs</h2>
            </div>

            {/* Updates list */}
            {updates.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-2xl bg-white/5 text-muted-foreground flex flex-col items-center justify-center p-4">
                <Clock className="w-8 h-8 text-muted-foreground/60 mb-2" />
                <span className="text-xs font-semibold">No monitoring updates logged yet.</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Use the upload panel on the right to document cleanup progress.</span>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-border space-y-8">
                {updates.map((update, idx) => (
                  <div key={update.id} className="relative">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 border-card bg-emerald-500 flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 hover:border-emerald-500/20 transition-all duration-300">
                      
                      {/* Image Thumbnail */}
                      <div className="rounded-xl overflow-hidden border border-border h-24 bg-black/40">
                        <img
                          src={update.image_url}
                          alt="Progress log"
                          className="object-cover w-full h-full"
                        />
                      </div>

                      {/* Info & Description */}
                      <div className="md:col-span-3 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Logged: {new Date(update.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            update.recovery_status === 'Recovered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {update.recovery_status}
                          </span>
                        </div>
                        
                        <p className="text-xs leading-relaxed text-foreground/80 font-medium">
                          {update.description}
                        </p>

                        {/* Progress Stats Gauges */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-muted-foreground">
                              Improvement: <strong className="text-foreground">{update.improvement_pct}%</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[10px] text-muted-foreground">
                              Pollution Reduced: <strong className="text-foreground">{update.pollution_reduced}%</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE PANEL: Voting, Risk Score, Map & Follow-up upload (1 col) */}
        <div className="space-y-6">
          
          {/* COMPOSITE RISK ENGINE METER */}
          <div className={`glass-panel p-6 rounded-3xl border border-white/5 ${getRiskColor(report.risk_score || 0)}`}>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Risk Classification</span>
            <div className="flex items-baseline justify-between mt-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{getRiskLabel(report.risk_score || 0)}</h2>
              <span className="text-2xl font-extrabold text-foreground">{report.risk_score}%</span>
            </div>
            
            {/* Risk bar */}
            <div className="w-full h-3 bg-black/15 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  (report.risk_score || 0) >= 80 ? 'bg-rose-500' :
                  (report.risk_score || 0) >= 60 ? 'bg-orange-500' :
                  (report.risk_score || 0) >= 35 ? 'bg-yellow-500' :
                  'bg-slate-400'
                }`}
                style={{ width: `${report.risk_score}%` }}
              />
            </div>
            
            <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
              Composite score calculated via AI severity weights, incident categories, and community verification votes.
            </p>
          </div>

          {/* COMMUNITY VERIFICATION (VOTING) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold">Community Verification</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Have you witnessed this incident? Confirm this report to help alert officials, or dispute it if the coordinates/details are incorrect.
            </p>

            {/* Voting buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVote('confirm')}
                disabled={voting}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  report.user_vote === 'confirm'
                    ? 'bg-emerald-500/25 border-emerald-500 text-emerald-400'
                    : 'bg-white/5 border-border hover:bg-white/10 hover:text-emerald-400'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Confirm ({report.votes_count?.confirm || 0})
              </button>

              <button
                onClick={() => handleVote('dispute')}
                disabled={voting}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  report.user_vote === 'dispute'
                    ? 'bg-rose-500/25 border-rose-500 text-rose-500'
                    : 'bg-white/5 border-border hover:bg-white/10 hover:text-rose-500'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                Dispute ({report.votes_count?.dispute || 0})
              </button>
            </div>

            {/* Total confirms note */}
            <div className="flex items-center gap-1.5 p-3 bg-emerald-500/5 rounded-xl text-xs text-emerald-400 border border-emerald-500/10">
              <Award className="w-4 h-4" />
              <span>Confirmed by <strong>{report.votes_count?.confirm || 0}</strong> people</span>
            </div>
          </div>

          {/* GEOLOCATION MAP DETAIL */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-1">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Incident Coordinates
            </h3>
            <div className="h-44 w-full rounded-xl overflow-hidden border border-border">
              <LeafletMap
                center={[report.latitude, report.longitude]}
                zoom={14}
                markers={[{
                  id: report.id,
                  title: report.title,
                  latitude: report.latitude,
                  longitude: report.longitude,
                  category: report.category,
                  severity: report.severity,
                  risk_score: report.risk_score
                }]}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>LAT: {report.latitude.toFixed(5)}</span>
              <span>LNG: {report.longitude.toFixed(5)}</span>
            </div>
          </div>

          {/* FOLLOW-UP SUBMISSION FORM */}
          {report.status !== 'Resolved' && (
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-500" />
                Log Cleanup Progress
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Has there been a cleanup or recovery effort at this site? Upload a photo to estimate recovery progress.
              </p>

              <form onSubmit={handleSubmitUpdate} className="space-y-4">
                {/* Image selection */}
                {updateImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-border h-36 bg-black/40 group">
                    <img
                      src={updateImage}
                      alt="Follow up preview"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => setUpdateImage(null)}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
                    >
                      Remove Photo
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
                    <span className="text-xs font-bold block">Select Recovery Photo</span>
                  </div>
                )}

                {/* Description */}
                <div>
                  <textarea
                    required
                    rows={3}
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    placeholder="Describe the cleanup action... (e.g. Volunteer groups collected 12 bags of litter.)"
                    className="block w-full px-3 py-2 bg-white/5 border border-border rounded-xl text-xs placeholder-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingUpdate || !updateImage || !updateDescription}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-xs font-bold hover:from-emerald-400 hover:to-emerald-500 transition disabled:opacity-50"
                >
                  {submittingUpdate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Comparing Images...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit & Analyze Recovery
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
