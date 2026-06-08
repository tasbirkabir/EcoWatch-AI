'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import {
  Camera,
  MapPin,
  Compass,
  Brain,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  AlertTriangle,
  Sparkles,
  Loader2,
  Lock
} from 'lucide-react';
import { IncidentCategory, IncidentSeverity } from '@/types';

// Load Leaflet Map dynamically (client-side only)
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-white/5 border border-border rounded-2xl flex items-center justify-center text-muted-foreground animate-pulse">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mr-2" />
      Loading Map System...
    </div>
  ),
});

const CATEGORIES: IncidentCategory[] = [
  'Illegal Dumping',
  'Water Pollution',
  'Deforestation',
  'Wildlife Threat',
  'Air Pollution',
  'Hazardous Waste',
];

export default function ReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Steps: 1 = Details, 2 = Location & Photo, 3 = AI Diagnosis & Submit
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory | ''>('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // AI Diagnostic Results
  const [aiAnalysis, setAiAnalysis] = useState<{
    detected_issue: string;
    confidence: number;
    severity: IncidentSeverity;
    environmental_impact: string;
  } | null>(null);

  // ---------------------------------------------------------
  // LOCATION & GPS CAPTURE
  // ---------------------------------------------------------
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        // Fetch reverse geocode name using openstreetmap
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            // Shorten name for readability
            const parts = data.display_name.split(',');
            setLocationName(parts.slice(0, 3).join(','));
          } else {
            setLocationName(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } catch {
          setLocationName(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
        setLoading(false);
      },
      (error) => {
        console.error('GPS Error:', error);
        alert('Could not acquire GPS signal. Please select your location manually on the map.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMapSelect = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    
    // Reverse geocode manual click
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        setLocationName(parts.slice(0, 3).join(','));
      } else {
        setLocationName(`Manual Marker: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setLocationName(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  // ---------------------------------------------------------
  // PHOTO UPLOAD & BASE64 CONVERSION
  // ---------------------------------------------------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------------------------
  // TRIGGER GEMINI IMAGE DIAGNOSIS
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
      setStep(3); // Advance to AI Diagnosis slide
    } catch (err: any) {
      console.error(err);
      alert('AI analysis failed. You can still submit the report.');
      // Create fallback dummy analysis
      setAiAnalysis({
        detected_issue: `${category} Threat`,
        confidence: 85,
        severity: 'Medium',
        environmental_impact: 'General impact disruption. Prompt physical cleanup and site monitoring is recommended.',
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // SUBMIT COMPLETED REPORT
  // ---------------------------------------------------------
  const handleSubmitReport = async () => {
    if (!title || !description || !category || !latitude || !longitude || !imagePreview || !locationName) {
      alert('Please fill out all fields and select a location.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
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
          user_id: user?.id || null, // Associates report to logged in profile
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      router.push(`/reports/${data.report.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Submission failed. Please check your connection.');
      setSubmitting(false);
    }
  };

  // Form step navigation checks
  const canGoToStep2 = title.trim() !== '' && description.trim() !== '' && category !== '';
  const canGoToAI = latitude !== null && longitude !== null && imagePreview !== null;

  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else router.push('/dashboard');
          }}
          className="p-2.5 rounded-xl border border-border bg-white/5 hover:bg-white/10 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Report Incident</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Document and log an ecological threat to protect your local community.
          </p>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Details', icon: AlertTriangle },
          { label: 'Media & Location', icon: MapPin },
          { label: 'AI Diagnosis', icon: Brain },
        ].map((s, idx) => {
          const ActiveIcon = s.icon;
          const num = idx + 1;
          const isCompleted = step > num;
          const isActive = step === num;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 pb-3 border-b-2 transition ${
                isCompleted ? 'border-emerald-500 text-emerald-400' :
                isActive ? 'border-cyan-500 text-cyan-400 font-semibold' :
                'border-border text-muted-foreground'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                isCompleted ? 'bg-emerald-500/20' :
                isActive ? 'bg-cyan-500/20' :
                'bg-white/5 border border-border'
              }`}>
                {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : num}
              </div>
              <span className="hidden sm:inline text-xs uppercase tracking-wider">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: INCIDENT DETAILS */}
      {step === 1 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Incident Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Toxic barrels leaking near park shoreline"
              className="block w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide key details. Include estimated quantity, visual colors, smells, how long it has been there, and nearby water bodies or ecosystems."
              className="block w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
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
                      ? 'bg-emerald-500/25 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
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
              className="flex items-center gap-1.5 px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              Continue
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MEDIA UPLOAD & LOCATION SELECTION */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Photo Uploader */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Upload Photographic Evidence
            </label>
            
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-border max-h-80 w-full flex items-center justify-center bg-black/40 group">
                <img
                  src={imagePreview}
                  alt="Incident Preview"
                  className="object-contain max-h-80 w-full"
                />
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setAiAnalysis(null);
                  }}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-sm transition rounded-2xl cursor-pointer"
                >
                  Change Photo
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
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold mb-1">Click to select photo</span>
                <span className="text-xs text-muted-foreground">Supports PNG, JPG, or WEBP up to 5MB</span>
              </div>
            )}
          </div>

          {/* Location Picker */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Incident Location
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Point the exact spot on the map, or trigger automatic GPS locator.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoLocate}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Locating...
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 animate-pulse-slow" />
                    Auto-Detect Coordinates
                  </>
                )}
              </button>
            </div>

            {/* Selected Location text */}
            {latitude && longitude && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
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

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-5 py-3 border border-border bg-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition"
            >
              Back
            </button>
            <button
              onClick={runAIDiagnosis}
              disabled={!canGoToAI || loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  AI Analysing Photo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" />
                  Analyze Photo with Gemini AI
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI DIAGNOSIS PREVIEW & CONFIRM */}
      {step === 3 && aiAnalysis && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 relative overflow-hidden">
            {/* Holographic glowing scan line overlay */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent top-0 animate-bounce pointer-events-none" />

            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                Gemini Vision Diagnostics
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

              {/* AI Diagnostic details */}
              <div className="md:col-span-2 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Issue */}
                  <div className="p-4 bg-white/5 border border-border rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Detected Issue</span>
                    <p className="text-sm font-semibold mt-1 text-foreground leading-tight">{aiAnalysis.detected_issue}</p>
                  </div>
                  
                  {/* Confidence */}
                  <div className="p-4 bg-white/5 border border-border rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Confidence</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-bold text-emerald-400">{aiAnalysis.confidence}%</span>
                      {/* Gauge Bar */}
                      <div className="flex-grow h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${aiAnalysis.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="p-4 bg-white/5 border border-border rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Severity Classification</span>
                    <div className="mt-1">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase inline-block ${
                        aiAnalysis.severity === 'Critical' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' :
                        aiAnalysis.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        aiAnalysis.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {aiAnalysis.severity}
                      </span>
                    </div>
                  </div>

                  {/* Location display */}
                  <div className="p-4 bg-white/5 border border-border rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Incident Location</span>
                    <p className="text-xs font-semibold mt-1 text-foreground truncate">{locationName}</p>
                  </div>
                </div>

                {/* Impact Statement */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    Ecological Impact Analysis
                  </span>
                  <p className="text-xs mt-1.5 leading-relaxed text-foreground/80 font-medium">
                    {aiAnalysis.environmental_impact}
                  </p>
                </div>
              </div>
            </div>

            {/* Notice */}
            {!user && (
              <div className="mt-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2">
                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  You are not currently logged in. Submitting this incident will publish it anonymously. To link this to your dashboard history, please <strong>log in</strong> first.
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-3 border border-border bg-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition"
            >
              Back
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-400 hover:to-emerald-500 transition shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Publishing Incident...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4.5 h-4.5" />
                  Confirm & Publish Report
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
