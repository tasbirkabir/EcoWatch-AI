'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Calendar, MapPin, CheckCircle2, ChevronRight, Award, Flame, RefreshCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Incident, IncidentCategory, IncidentSeverity, IncidentStatus } from '@/types';

const CATEGORIES: (IncidentCategory | 'All')[] = [
  'All',
  'Illegal Dumping',
  'Water Pollution',
  'Air Pollution',
  'Deforestation',
  'Wildlife Threats',
  'Hazardous Waste',
];

const SEVERITIES: (IncidentSeverity | 'All')[] = ['All', 'Low', 'Moderate', 'High', 'Critical'];
const STATUSES: (IncidentStatus | 'All')[] = ['All', 'Pending', 'Verified', 'Under Review', 'Investigating', 'Resolved'];

export default function ReportsRegistryPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<IncidentCategory | 'All'>('All');
  const [severity, setSeverity] = useState<IncidentSeverity | 'All'>('All');
  const [status, setStatus] = useState<IncidentStatus | 'All'>('All');

  const fetchIncidentsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (severity !== 'All') params.append('severity', severity);
      if (status !== 'All') params.append('status', status);
      if (search.trim() !== '') params.append('search', search);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      setIncidents(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch incident registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentsData();
  }, [category, severity, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIncidentsData();
  };

  const getSeverityStyle = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'Critical': return 'severity-badge-critical';
      case 'High': return 'severity-badge-high';
      case 'Moderate': return 'severity-badge-moderate';
      case 'Low': return 'severity-badge-low';
    }
  };

  const getCategoryStyle = (cat: IncidentCategory) => {
    switch (cat) {
      case 'Illegal Dumping': return 'category-badge-dumping';
      case 'Water Pollution': return 'category-badge-water';
      case 'Air Pollution': return 'category-badge-air';
      case 'Deforestation': return 'category-badge-forestry';
      case 'Wildlife Threats': return 'category-badge-wildlife';
      case 'Hazardous Waste': return 'category-badge-hazardous';
    }
  };

  const getStatusStyle = (st: IncidentStatus) => {
    switch (st) {
      case 'Resolved': return 'status-badge-resolved';
      case 'Investigating': return 'status-badge-investigating';
      case 'Under Review': return 'status-badge-review';
      case 'Verified': return 'status-badge-verified';
      case 'Pending': return 'status-badge-pending';
    }
  };

  // Calculates community validation trust score using Laplace smoothing
  const calculateTrustScore = (votes?: { confirm: number; dispute: number }) => {
    const confirms = votes?.confirm || 0;
    const disputes = votes?.dispute || 0;
    
    // Laplace smoothing: (confirms + 1) / (total + 2)
    const rawRatio = (confirms + 1) / (confirms + disputes + 2);
    return Math.round(rawRatio * 100);
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Decentralized Incident Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit reported ecological hazards, check verification levels, and track remediation.
          </p>
        </div>
        <button
          onClick={fetchIncidentsData}
          className="flex items-center gap-1.5 px-4 py-2 border border-border bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Synchronize Nodes
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, location name, or description details..."
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
            />
            <button
              type="submit"
              className="absolute left-3.5 inset-y-0 text-muted-foreground hover:text-cyan-400 flex items-center"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category */}
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground pointer-events-none">
                <Filter className="w-4 h-4" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory | 'All')}
                className="w-full pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground pointer-events-none">
                <Flame className="w-4 h-4" />
              </span>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity | 'All')}
                className="w-full pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
              >
                <option value="All">All Severities</option>
                {SEVERITIES.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground pointer-events-none">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IncidentStatus | 'All')}
                className="w-full pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
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

      {/* Grid List */}
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
          <h3 className="font-bold mb-2">Sync Error</h3>
          <p className="text-xs text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchIncidentsData} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold">
            Retry Sync
          </button>
        </div>
      ) : incidents.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-3xl border border-white/5 max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Records Found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            There are no reported incidents matching the current search parameters. Change your filters or search terms.
          </p>
          <Link href="/report" className="px-5 py-2.5 bg-cyan-500 text-white rounded-xl text-xs font-semibold hover:bg-cyan-400 transition">
            Report New Incident
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incidents.map((incident) => {
            const trustScore = calculateTrustScore(incident.votes_count);
            return (
              <Link
                href={`/reports/${incident.id}`}
                key={incident.id}
                className="glass-panel flex flex-col rounded-3xl border border-white/5 overflow-hidden group hover:border-cyan-500/25 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Banner Image */}
                <div className="h-44 w-full relative overflow-hidden bg-black/40">
                  <img
                    src={incident.image_url}
                    alt={incident.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                  />
                  
                  {/* Absolute Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${getSeverityStyle(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${getCategoryStyle(incident.category)}`}>
                      {incident.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${getStatusStyle(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-grow flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-base leading-tight group-hover:text-cyan-400 transition truncate">
                      {incident.title}
                    </h3>
                    
                    <div className="flex flex-col gap-1.5 mt-2.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-500/60" />
                        <span className="truncate">{incident.location_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400/60" />
                        <span>{new Date(incident.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                    {incident.description}
                  </p>

                  {/* Composite Risk scoring progress bar */}
                  <div className="pt-3 border-t border-border mt-auto">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-muted-foreground">Composite Risk Rating</span>
                      <span className={`font-bold ${
                        incident.risk_score >= 80 ? 'text-rose-500' :
                        incident.risk_score >= 60 ? 'text-orange-400' :
                        incident.risk_score >= 35 ? 'text-yellow-500' :
                        'text-slate-400'
                      }`}>
                        {incident.risk_score}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          incident.risk_score >= 80 ? 'bg-rose-500' :
                          incident.risk_score >= 60 ? 'bg-orange-500' :
                          incident.risk_score >= 35 ? 'bg-yellow-500' :
                          'bg-slate-400'
                        }`}
                        style={{ width: `${incident.risk_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Laplace Trust Score indicators */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2">
                    <span className="flex items-center gap-1 text-cyan-400 font-semibold bg-cyan-500/5 px-2 py-0.5 rounded-md border border-cyan-500/10">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Trust Score: {trustScore}%
                    </span>
                    <span className="flex items-center gap-0.5 font-bold group-hover:translate-x-1 transition duration-200">
                      Explore Board
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
