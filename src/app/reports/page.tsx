'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, AlertTriangle, Calendar, MapPin, CheckCircle2, ChevronRight, Award, Flame, RefreshCcw } from 'lucide-react';
import { Report, IncidentCategory, IncidentSeverity, IncidentStatus } from '@/types';

const CATEGORIES: (IncidentCategory | 'All')[] = [
  'All',
  'Illegal Dumping',
  'Water Pollution',
  'Deforestation',
  'Wildlife Threat',
  'Air Pollution',
  'Hazardous Waste',
];

const SEVERITIES: (IncidentSeverity | 'All')[] = ['All', 'Low', 'Medium', 'High', 'Critical'];
const STATUSES: (IncidentStatus | 'All')[] = ['All', 'Pending', 'Verified', 'Under Review', 'Resolved'];

export default function ReportsFeedPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<IncidentCategory | 'All'>('All');
  const [severity, setSeverity] = useState<IncidentSeverity | 'All'>('All');
  const [status, setStatus] = useState<IncidentStatus | 'All'>('All');

  // Trigger search fetch
  const fetchFilteredReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (severity !== 'All') params.append('severity', severity);
      if (status !== 'All') params.append('status', status);
      if (search.trim() !== '') params.append('search', search);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      setReports(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load environmental records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredReports();
  }, [category, severity, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredReports();
  };

  const getSeverityStyle = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'Critical': return 'severity-badge-critical';
      case 'High': return 'severity-badge-high';
      case 'Medium': return 'severity-badge-medium';
      case 'Low': return 'severity-badge-low';
    }
  };

  const getCategoryStyle = (cat: IncidentCategory) => {
    switch (cat) {
      case 'Illegal Dumping': return 'category-badge-dumping';
      case 'Water Pollution': return 'category-badge-water';
      case 'Deforestation': return 'category-badge-forestry';
      case 'Wildlife Threat': return 'category-badge-wildlife';
      case 'Air Pollution': return 'category-badge-air';
      case 'Hazardous Waste': return 'category-badge-hazardous';
    }
  };

  const getStatusStyle = (st: IncidentStatus) => {
    switch (st) {
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'Under Review': return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      case 'Verified': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      case 'Pending': return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Environmental Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Explore citizen-reported ecological incidents verified by AI and community votes.
          </p>
        </div>
        <button
          onClick={fetchFilteredReports}
          className="flex items-center gap-1.5 px-4 py-2 border border-border bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Refresh Registry
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-grow relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, location, or description..."
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition"
            />
            <button
              type="submit"
              className="absolute left-3.5 inset-y-0 text-muted-foreground hover:text-emerald-400 flex items-center"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Wrapper */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category Filter */}
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground pointer-events-none">
                <Filter className="w-4 h-4" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory | 'All')}
                className="w-full pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground pointer-events-none">
                <Flame className="w-4 h-4" />
              </span>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity | 'All')}
                className="w-full pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
              >
                <option value="All">All Severities</option>
                {SEVERITIES.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground pointer-events-none">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IncidentStatus | 'All')}
                className="w-full pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {STATUSES.filter(st => st !== 'All').map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="glass-panel h-96 rounded-3xl border border-white/5 animate-pulse flex flex-col p-5 gap-4">
              <div className="w-full h-44 bg-white/5 rounded-2xl" />
              <div className="h-6 bg-white/5 rounded w-3/4" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
              <div className="h-4 bg-white/5 rounded w-5/6 mt-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center glass-panel rounded-3xl border border-rose-500/20 text-rose-500 max-w-md mx-auto">
          <AlertTriangle className="w-10 h-10 mx-auto mb-4" />
          <h3 className="font-bold mb-2">Error Loading Registry</h3>
          <p className="text-xs text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchFilteredReports} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-3xl border border-white/5 max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Records Found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            There are no reported incidents matching the current search parameters. Change your filters or search terms.
          </p>
          <Link href="/report" className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition">
            Report New Incident
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Link
              href={`/reports/${report.id}`}
              key={report.id}
              className="glass-panel flex flex-col rounded-3xl border border-white/5 overflow-hidden group hover:border-emerald-500/25 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Image Banner */}
              <div className="h-44 w-full relative overflow-hidden bg-black/40">
                <img
                  src={report.image_url}
                  alt={report.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                />
                
                {/* Floating Severity & Status Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${getSeverityStyle(report.severity)}`}>
                    {report.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${getCategoryStyle(report.category)}`}>
                    {report.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${getStatusStyle(report.status)}`}>
                    {report.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-grow flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-base leading-tight group-hover:text-emerald-400 transition truncate">
                    {report.title}
                  </h3>
                  
                  {/* Meta items */}
                  <div className="flex flex-col gap-1.5 mt-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500/60" />
                      <span className="truncate">{report.location_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400/60" />
                      <span>{new Date(report.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>

                {/* Risk score bar */}
                <div className="pt-3 border-t border-border mt-auto">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-muted-foreground">Composite Risk Rating</span>
                    <span className={`font-bold ${
                      report.risk_score >= 80 ? 'text-rose-500' :
                      report.risk_score >= 60 ? 'text-orange-400' :
                      report.risk_score >= 35 ? 'text-yellow-500' :
                      'text-slate-400'
                    }`}>
                      {report.risk_score}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        report.risk_score >= 80 ? 'bg-rose-500' :
                        report.risk_score >= 60 ? 'bg-orange-500' :
                        report.risk_score >= 35 ? 'bg-yellow-500' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${report.risk_score}%` }}
                    />
                  </div>
                </div>

                {/* Voter statistics footer */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">
                    <Award className="w-3 h-3" />
                    Confirmed by {report.votes_count?.confirm || 0}
                  </span>
                  <span className="flex items-center gap-0.5 font-bold group-hover:translate-x-1 transition duration-200">
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
