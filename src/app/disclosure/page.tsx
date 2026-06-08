'use client';

import React from 'react';
import { Brain, Cpu, Sparkles, ShieldAlert, Image, Layers, Code, Award, Target, Landmark } from 'lucide-react';

export default function AIDisclosurePage() {
  const aiModules = [
    {
      icon: Image,
      title: 'Incident Visual Diagnosis',
      model: 'Gemini 1.5 Flash (Vision)',
      description: 'Triggered instantly upon photo upload. The model inspects the base64 image data and returns a structured JSON containing the detected ecological hazard class, confidence index, severity classification, and a 2-sentence localized threat summary and recommended action.',
      prompt: `Analyze this image of an environmental incident... return JSON format:
{
  "detected_issue": "Short descriptive title",
  "confidence": 95, // Integer 0-100
  "severity": "Low" | "Moderate" | "High" | "Critical",
  "environmental_impact": "Detailed explanation (1-2 sentences)",
  "recommended_action": "Precise recommended mitigation/cleanup action (1-2 sentences)"
}`
    },
    {
      icon: Layers,
      title: 'Before & After Recovery Monitor',
      model: 'Gemini 1.5 Flash (Vision)',
      description: 'Triggered when citizens submit progress reports with cleanup photos. The model accepts two image files (Image 1 = original hazard, Image 2 = current cleanup status) to calculate the physical recovery progress percentage, estimate pollution reduction, and log an ecosystem timeline description.',
      prompt: `Compare these two images of the same location... return JSON:
{
  "improvement_pct": 75, // 0-100
  "pollution_reduced": 80, // 0-100
  "recovery_status": "Improving" | "Recovered" | "Unchanged",
  "description": "Short explanation of changes"
}`
    },
    {
      icon: Brain,
      title: 'Regional Climate Synthesis',
      model: 'Deterministic Aggregation Engine',
      description: 'Generates weekly summaries based on local registry databases. Integrates SQL record frequencies, top categorizations, and coordinate hazard maps to output an overview of regional hotspots and community resolution rates.',
      prompt: 'Heuristic aggregation of reports table: Counts frequencies, calculates resolved ratios, extracts coordinates, and outputs formatted markdown summaries for public dashboards.'
    }
  ];

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Glow overlays */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 items-center justify-center mb-4 text-cyan-400">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">AI Systems & Tech Specification</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-2 leading-relaxed">
          Consistent with **Dev Season of Code (DSOC) 2026** guidelines, this page discloses our integration of AI models, prompt specifications, and mathematical calculations.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: System Specifications (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Architectures & Prompt Schemes
          </h2>

          <div className="space-y-6">
            {aiModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-cyan-500/15 text-cyan-400 rounded-xl">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base">{mod.title}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 font-mono">
                      {mod.model}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {mod.description}
                  </p>

                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">
                      <Code className="w-3.5 h-3.5 text-cyan-400" />
                      Prompt / Algorithm Spec
                    </div>
                    <pre className="text-[10px] text-emerald-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {mod.prompt}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Risk math + Impact details (1 col) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Analytical Core
          </h2>

          {/* Risk Engine Block */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-sm">5-Factor Environmental Risk Engine</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To prioritize incidents, we designed a composite risk engine combining AI insights, user validation, and local density vectors:
            </p>

            <div className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">Mathematical Model</span>
              <div className="text-xs font-mono text-foreground leading-snug break-all font-bold">
                Risk = clip(3.5*S + 1.5*V + 2.0*P + 2.0*E + 1.0*F, 0, 100)
              </div>
            </div>

            <div className="space-y-2.5 text-[11px] text-muted-foreground pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span>1. AI Severity Factor (S)</span>
                <span className="font-semibold text-foreground">[2, 10]</span>
              </div>
              <div className="flex justify-between">
                <span>2. Consensus Validation (V)</span>
                <span className="font-semibold text-foreground">[-5, 10]</span>
              </div>
              <div className="flex justify-between">
                <span>3. Population Proximity (P)</span>
                <span className="font-semibold text-foreground">[1, 10]</span>
              </div>
              <div className="flex justify-between">
                <span>4. Env Sensitivity (E)</span>
                <span className="font-semibold text-foreground">[1, 10]</span>
              </div>
              <div className="flex justify-between">
                <span>5. Cluster Frequency (F)</span>
                <span className="font-semibold text-foreground">[1, 10]</span>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground italic leading-relaxed pt-2">
              *The final score is bounded between 0% and 100%, and maps directly to visual badges: Low, Moderate, High, or Critical.
            </p>
          </div>

          {/* Laplace Consensus Trust Score */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <Target className="w-4.5 h-4.5 text-cyan-400" />
              Laplace Trust Model
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prevents manipulation on new incidents with low vote counts and eliminates division-by-zero risks:
            </p>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Laplace Smoothing Formula</span>
              <code className="text-xs font-bold text-foreground font-mono leading-snug">
                Trust = (C + 1) / (C + D + 2) * 100
              </code>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
              Where **C** is confirms, and **D** is disputes. This guarantees an initial neutral baseline of **50%** for new submissions, preventing visual anomalies.
            </p>
          </div>

          {/* Environmental Value Proposition */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <Landmark className="w-4.5 h-4.5 text-cyan-400" />
              DSOC Summer Edition Value
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                <strong>Startup-Grade Scale</strong>: Bridges the gaps in municipal reporting networks by enabling automated routing, structured database auditing, and priority queue dispatching.
              </p>
              <p>
                <strong>Predictive Remediation</strong>: Provides 3-month composed line forecasts and coordinate hotspot identification, shifting agencies from a reactive posture to a proactive posture.
              </p>
              <p>
                <strong>Verified Outcomes</strong>: Tracks outcomes in physical metrics (e.g. kilograms of trash removed, square meters of area restored), creating transparent, measurable impact data.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
