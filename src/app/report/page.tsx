'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import {
  Brain,
  MapPin,
  Compass,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  AlertTriangle,
  Sparkles,
  Loader2,
  Lock,
  FileText
} from 'lucide-react';
import { IncidentCategory, IncidentSeverity } from '@/types';

// Load Leaflet Map dynamically
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-white/5 border border-border rounded-2xl flex items-center justify-center text-muted-foreground animate-pulse">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mr-2" />
      Loading Spatial Map Engine...
    </div>
  ),
});

const CATEGORIES: IncidentCategory[] = [
  'Illegal Dumping',
  'Water Pollution',
  'Air Pollution',
  'Deforestation',
  'Wildlife Threats',
  'Hazardous Waste',
];

export default function ReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Step manager
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory | ''>('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // AI Response
  const [aiAnalysis, setAiAnalysis] = useState<{
    detected_issue: string;
    confidence: number;
    severity: IncidentSeverity;
    environmental_impact: string;
    recommended_action: string;
  } | null>(null);

  // ---------------------------------------------------------
  // SPATIAL GEOLOCATION
  // ---------------------------------------------------------
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      alert('GPS is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            setLocationName(parts.slice(0, 3).join(','));
          } else {
            setLocationName(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } catch {
          setLocationName(`GPS Node: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
        setLoading(false);
      },
      (err) => {
        console.error('GPS failure:', err);
        alert('Could not acquire GPS coordinates. Please select manually on the map.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMapSelect = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        setLocationName(parts.slice(0, 3).join(','));
      } else {
        setLocationName(`Manual Node: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setLocationName(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  // ---------------------------------------------------------
  // FILE STAGING
  // ---------------------------------------------------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------------------------
  // TRIGGER DRAFT DIAGNOSTIC RUN
  // ---------------------------------------------------------
  const runAIDiagnosis = async () => {
    if (!imagePreview || !category) return;
    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imagePreview,
          category,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAiAnalysis(data);
      setStep(3); // Go to diagnostics slide
    } catch (err: any) {
      console.error(err);
      alert('AI visual audit failed. Falling back to simulated diagnostics.');
      setAiAnalysis({
        detected_issue: `${category} Incident`,
        confidence: 85,
        severity: 'Moderate',
        environmental_impact: 'Ecosystem diagnostics under-represented. Immediate physical evaluation recommended.',
        recommended_action: 'Notify local environmental protection commission and deploy inspection units.'
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // SUBMIT COMPLETED RECORD
  // ---------------------------------------------------------
  const handleSubmitIncident = async () => {
    if (!title || !description || !category || !latitude || !longitude || !imagePreview || !locationName) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          latitude,
          longitude,
          location_name: locationName,
          image_url: imagePreview,
          user_id: user?.id || null,
          additional_notes: additionalNotes
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      router.push(`/reports/${data.incident.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit incident. Please check database permissions.');
      setSubmitting(false);
    }
  };

  const canGoToStep2 = title.trim() !== '' && description.trim() !== '' && category !== '';
  const canGoToAI = latitude !== null && longitude !== null && imagePreview !== null;

  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Title */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else router.push('/dashboard');
          }}
          className="p-2.5 rounded-xl border border-border bg-white/5 hover:bg-white/10 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Report Incident</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submit photographic evidence to audit environmental hazards.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Details', icon: AlertTriangle },
          { label: 'Evidence & Location', icon: MapPin },
          { label: 'AI Audit Preview', icon: Brain },
        ].map((s, idx) => {
          const num = idx + 1;
          const isCompleted = step > num;
          const isActive = step === num;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 pb-3 border-b-2 transition ${
                isCompleted ? 'border-cyan-500 text-cyan-400' :
                isActive ? 'border-emerald-500 text-emerald-400 font-semibold' :
                'border-border text-muted-foreground'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                isCompleted ? 'bg-cyan-500/20' :
                isActive ? 'bg-emerald-500/20' :
                'bg-white/5 border border-border'
              }`}>
                {isCompleted ? <CheckCircle className="w-4 h-4 text-cyan-400" /> : num}
              </div>
              <span className="hidden sm:inline text-xs uppercase tracking-wider">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: DETAILS */}
      {step === 1 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Incident Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acid barrel leakage observed near Cascade reserve boundary"
              className="block w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Incident Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the incident details. Include colors of residues, odors, estimated quantities, and proximity to watersheds or community zones."
              className="block w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Incident Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-3 text-xs font-semibold rounded-xl border transition text-center cursor-pointer ${
                    category === cat
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'bg-white/5 border-border hover:bg-white/10 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={() => setStep(2)}
              disabled={!canGoToStep2}
              className="flex items-center gap-1.5 px-6 py-3 bg-cyan-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              Continue
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: EVIDENCE & GPS */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Photo upload */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Upload Photographic Evidence
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-border max-h-80 w-full flex items-center justify-center bg-black/40 group">
                <img
                  src={imagePreview}
                  alt="Incident scan preview"
                  className="object-contain max-h-80 w-full"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setAiAnalysis(null);
                  }}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-sm transition cursor-pointer"
                >
                  Replace Photo
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold mb-1">Upload Incident Photo</span>
                <span className="text-xs text-muted-foreground">Supports PNG, JPG, or WEBP up to 5MB</span>
              </div>
            )}
          </div>

          {/* Location details */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Incident Coordinates
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pin the exact location on the map canvas, or trigger GPS auto-locate.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoLocate}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-xl hover:bg-cyan-500/20 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Locating Node...
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 animate-pulse-slow" />
                    Auto-Acquire Coordinates
                  </>
                )}
              </button>
            </div>

            {latitude && longitude && (
              <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl flex items-center gap-2 text-xs text-cyan-400">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{locationName}</span>
                <span className="text-muted-foreground ml-auto">
                  ({latitude.toFixed(5)}, {longitude.toFixed(5)})
                </span>
              </div>
            )}

            {/* Map Canvas */}
            <div className="h-80 w-full rounded-2xl overflow-hidden border border-border">
              <LeafletMap
                selectable
                selectedLocation={latitude && longitude ? [latitude, longitude] : null}
                onLocationSelect={handleMapSelect}
              />
            </div>
          </div>

          {/* Additional Notes Field */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Additional Inspector Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Record any details for investigative agencies... (e.g. Gate codes, land owner details, immediate hazards to local streams)."
              className="block w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-5 py-3 border border-border bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition"
            >
              Back
            </button>
            <button
              onClick={runAIDiagnosis}
              disabled={!canGoToAI || loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  AI Auditing Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" />
                  Analyze with Gemini Vision
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI DIAGNOSIS PREVIEW */}
      {step === 3 && aiAnalysis && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/20 relative overflow-hidden">
            {/* laser scan animation overlay */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent top-0 animate-laser-scan pointer-events-none" />

            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
                Gemini Visual Diagnostics Audit
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Display */}
              <div className="rounded-2xl overflow-hidden border border-border bg-black/40">
                <img
                  src={imagePreview || ''}
                  alt="Incident Scan"
                  className="object-cover w-full h-48 md:h-full"
                />
              </div>

              {/* Details grid */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Issue */}
                  <div className="p-4 bg-white/5 border border-border rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detected Incident</span>
                    <p className="text-sm font-bold mt-1 text-foreground leading-tight">{aiAnalysis.detected_issue}</p>
                  </div>

                  {/* Confidence */}
                  <div className="p-4 bg-white/5 border border-border rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diagnostic Confidence</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-bold text-cyan-400">{aiAnalysis.confidence}%</span>
                      <div className="flex-grow h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${aiAnalysis.confidence}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="p-4 bg-white/5 border border-border rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Severity Class</span>
                    <div className="mt-1">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase inline-block border ${
                        aiAnalysis.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' :
                        aiAnalysis.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        aiAnalysis.severity === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }`}>
                        {aiAnalysis.severity}
                      </span>
                    </div>
                  </div>

                  {/* Location display */}
                  <div className="p-4 bg-white/5 border border-border rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location Node</span>
                    <p className="text-xs font-bold mt-1 text-foreground truncate">{locationName}</p>
                  </div>
                </div>

                {/* Impact Statement */}
                <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    Ecological Risk Analysis
                  </span>
                  <p className="text-xs mt-1.5 leading-relaxed text-foreground/80 font-medium">
                    {aiAnalysis.environmental_impact}
                  </p>
                </div>

                {/* Recommended action - NEW */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl border-l-4 border-l-emerald-500">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Recommended Authority Action
                  </span>
                  <p className="text-xs mt-1.5 leading-relaxed text-foreground/85 font-semibold">
                    {aiAnalysis.recommended_action}
                  </p>
                </div>
              </div>
            </div>

            {/* Notice */}
            {!user && (
              <div className="mt-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2">
                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  You are not logged in. Submitting this incident will publish it anonymously. To link this to your dashboard history and claim contributor points, please <strong>log in</strong> first.
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-3 border border-border bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition"
            >
              Back
            </button>
            <button
              onClick={handleSubmitIncident}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:from-cyan-400 hover:to-teal-400 transition shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Publishing Record...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4.5 h-4.5" />
                  Confirm & Publish Incident
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
