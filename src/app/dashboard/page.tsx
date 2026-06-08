'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle,
  MapPin,
  TrendingUp,
  Brain,
  PlusCircle,
  Activity,
  List,
  Flame,
  Shield,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Report } from '@/types';

// Load Leaflet Map dynamically (client-side only)
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-white/5 border border-border rounded-3xl flex items-center justify-center text-muted-foreground animate-pulse">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mr-2" />
      Loading Map System...
    </div>
  ),
});

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard reports:', err);
        setLoading(false);
      });
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex-grow flex items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mr-2" />
        Synchronizing Environmental Registry...
      </div>
    );
  }

  // ---------------------------------------------------------
  // STATS CALCULATIONS & AGGREGATIONS
  // ---------------------------------------------------------
  const totalReports = reports.length;
  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;
  const pendingReports = reports.filter((r) => r.status === 'Pending').length;
  const activeReports = totalReports - resolvedReports;
  const avgRisk = totalReports > 0
    ? Math.round(reports.reduce((acc, curr) => acc + curr.risk_score, 0) / totalReports)
    : 0;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  reports.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    count: categoryCounts[cat],
  }));

  // Severity counts
  const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  reports.forEach((r) => {
    if (r.severity in severityCounts) {
      severityCounts[r.severity as keyof typeof severityCounts]++;
    }
  });
  const severityData = Object.keys(severityCounts).map((sev) => ({
    name: sev,
    value: severityCounts[sev as keyof typeof severityCounts],
  }));

  const SEVERITY_COLORS = {
    Critical: '#f43f5e', // rose-500
    High: '#f97316',     // orange-500
    Medium: '#eab308',   // yellow-500
    Low: '#64748b',      // slate-500
  };

  // Mock Monthly trends data (seeding based on current database counts)
  const trendData = [
    { month: 'Jan', reports: Math.round(totalReports * 0.15) || 2 },
    { month: 'Feb', reports: Math.round(totalReports * 0.3) || 4 },
    { month: 'Mar', reports: Math.round(totalReports * 0.45) || 6 },
    { month: 'Apr', reports: Math.round(totalReports * 0.7) || 8 },
    { month: 'May', reports: Math.round(totalReports * 0.9) || 12 },
    { month: 'Jun', reports: totalReports },
  ];

  // High Risk areas calculation (locations with highest risk scores)
  const highRiskAreas = [...reports]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 4)
    .map((r) => ({
      title: r.title,
      location: r.location_name,
      risk: r.risk_score,
      category: r.category,
      id: r.id
    }));

  // ---------------------------------------------------------
  // GENERATE DYNAMIC WEEKLY AI SUMMARY
  // ---------------------------------------------------------
  const generateAISummary = () => {
    if (totalReports === 0) {
      return "No incident reports logged. The registry is empty. Clean green environments detected.";
    }

    // Find top category
    let topCategory = 'None';
    let maxCount = 0;
    Object.keys(categoryCounts).forEach((c) => {
      if (categoryCounts[c] > maxCount) {
        maxCount = categoryCounts[c];
        topCategory = c;
      }
    });

    const topCategoryPct = Math.round((maxCount / totalReports) * 100);

    // Find highest risk report
    const highestRiskReport = [...reports].sort((a, b) => b.risk_score - a.risk_score)[0];
    const riskArea = highestRiskReport ? highestRiskReport.location_name : 'Unknown';

    return `This week, ${totalReports} environmental incidents were logged in the regional registry. ${topCategory} accounted for ${topCategoryPct}% of total submissions, representing the leading ecological threat. The highest-risk area identified is ${riskArea} with a composite hazard score of ${highestRiskReport?.risk_score || 0}%. Community resolution is steady at ${Math.round((resolvedReports / (totalReports || 1)) * 100)}%.`;
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time analytics, intelligence summaries, and spatial incident maps.
          </p>
        </div>
        <Link
          href="/report"
          className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl text-sm font-bold hover:from-emerald-400 hover:to-emerald-500 transition shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          Log Incident
        </Link>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Incidents */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Reports</span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">{totalReports}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 text-emerald-400 border border-border">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Resolved rate */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Resolved Rate</span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">
              {totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0}%
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 text-cyan-400 border border-border">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Active Hazards */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Hazards</span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">{activeReports}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 text-orange-400 border border-border">
            <Flame className="w-5 h-5 animate-pulse-slow" />
          </div>
        </div>

        {/* Avg Risk Index */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Risk Score</span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">{avgRisk}%</h3>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 text-indigo-400 border border-border">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AI Environmental Summary Section */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 mb-8 relative overflow-hidden flex flex-col md:flex-row gap-5 items-start">
        <div className="absolute top-0 right-0 w-80 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex-shrink-0">
          <Brain className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-sm flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            AI Environmental Weekly Synthesis
          </h3>
          <p className="text-xs leading-relaxed text-foreground/90 font-medium">
            {generateAISummary()}
          </p>
        </div>
      </div>

      {/* Grid: Map + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Spatial Map (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-white/5 flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Incident Geolocation Mapping
            </h3>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Plotting {reports.length} Active Records
            </span>
          </div>

          <div className="flex-grow w-full rounded-2xl overflow-hidden">
            <LeafletMap
              markers={reports.map((r) => ({
                id: r.id,
                title: r.title,
                latitude: r.latitude,
                longitude: r.longitude,
                category: r.category,
                severity: r.severity,
                risk_score: r.risk_score
              }))}
              onMarkerClick={(id) => {
                // Clicking custom markers is handled by leaflet binding redirects
              }}
            />
          </div>
        </div>

        {/* Severity Distribution Pie (1 col) */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col h-[480px]">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            Incidents by Severity
          </h3>

          <div className="flex-grow relative flex items-center justify-center">
            {totalReports === 0 ? (
              <span className="text-xs text-muted-foreground">No data available</span>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={severityData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Custom Central Text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Reports Logged</span>
              <span className="text-2xl font-black">{totalReports}</span>
            </div>
          </div>

          {/* Legends */}
          <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-border mt-auto">
            {Object.keys(SEVERITY_COLORS).map((sev) => {
              const val = severityCounts[sev as keyof typeof severityCounts] || 0;
              return (
                <div key={sev} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: SEVERITY_COLORS[sev as keyof typeof SEVERITY_COLORS] }}
                  />
                  <span className="text-xs font-semibold text-muted-foreground flex-grow truncate">{sev}</span>
                  <span className="text-xs font-bold text-foreground">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Category counts + Trends + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Bar chart */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col h-96">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5">
            <List className="w-4 h-4 text-emerald-500" />
            Classification Breakdown
          </h3>
          <div className="flex-grow w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No reports logged</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={10}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly trends area chart */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col h-96">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Monthly Growth Trends
          </h3>
          <div className="flex-grow w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: -15, right: 5, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Area type="monotone" dataKey="reports" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Risk areas list */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col h-96">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-rose-500" />
            High-Risk Hotspots
          </h3>
          
          {highRiskAreas.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-muted-foreground">No high-risk zones detected</div>
          ) : (
            <div className="flex-grow flex flex-col gap-3 justify-center">
              {highRiskAreas.map((area, index) => (
                <Link
                  href={`/reports/${area.id}`}
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                    area.risk >= 80 ? 'bg-rose-500/20 text-rose-500' :
                    area.risk >= 60 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {area.risk}%
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate leading-tight">{area.title}</h4>
                    <span className="text-[10px] text-muted-foreground truncate block mt-0.5">{area.location}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
