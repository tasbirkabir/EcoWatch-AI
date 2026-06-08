'use client';

import React from 'react';
import { Brain, Cpu, Sparkles, Database, ShieldAlert, Image, Layers, Code, Award } from 'lucide-react';

export default function AIDisclosurePage() {
  const aiModules = [
    {
      icon: Image,
      title: 'Incident Visual Diagnosis',
      model: 'Gemini 1.5 Flash (Vision)',
      description: 'Triggered instantly upon photo upload. The model inspects the base64 image data and returns a structured JSON containing the detected ecological hazard class, confidence index, severity classification, and a 2-sentence localized threat summary.',
      prompt: `Analyze this image of an environmental incident... return JSON format:
{
  "detected_issue": "Short descriptive title",
  "confidence": 95, // Integer 0-100
  "severity": "Low" | "Medium" | "High" | "Critical",
  "environmental_impact": "Detailed explanation"
}`
    },
    {
      icon: Layers,
      title: 'Before & After Recovery Monitor',
      model: 'Gemini 1.5 Flash (Vision)',
      description: 'Triggered when follow-up recovery photos are uploaded. The model accepts two image files (Image 1 = original hazard, Image 2 = cleanup status) to calculate the physical recovery progress percentage, estimate chemical/debris reduction, and log an ecosystem timeline description.',
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
    <div className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Glow overlays */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center mb-4 text-emerald-500">
          <Cpu className="w-6 h-6 animate-pulse-slow" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">AI Systems & Tech Disclosure</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-2 leading-relaxed">
          Consistent with GENIUS Olympiad Hackathon guidelines, this document outlines our integration of AI models, prompt specifications, and risk calculations.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: System Specifications (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            AI Architectures & Prompt Schemes
          </h2>

          <div className="space-y-6">
            {aiModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base">{mod.title}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/5 px-2.5 py-1 rounded-lg border border-cyan-500/10">
                      {mod.model}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {mod.description}
                  </p>

                  <div className="p-4 bg-black/40 rounded-2xl border border-border">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">
                      <Code className="w-3.5 h-3.5 text-emerald-400" />
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
            <h3 className="font-bold text-sm">Composite Risk Rating Model</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To prioritize incidents, we designed a composite risk engine combining AI insights with public consensus:
            </p>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Mathematical Formula</span>
              <code className="text-xs font-bold text-foreground font-mono leading-snug">
                Risk = (Sev * 5) + (Cat * 4) + (Votes * 1.5)
              </code>
            </div>

            <div className="space-y-2.5 text-2xs text-muted-foreground pt-2 border-t border-border">
              <div className="flex justify-between">
                <span>1. Severity Weight (Sev)</span>
                <span className="font-semibold text-foreground">Low (2) to Critical (10)</span>
              </div>
              <div className="flex justify-between">
                <span>2. Category Impact (Cat)</span>
                <span className="font-semibold text-foreground">Dumping (5) to Toxins (10)</span>
              </div>
              <div className="flex justify-between">
                <span>3. Consensus Bias (Votes)</span>
                <span className="font-semibold text-foreground">Confirms (+0.8) vs Disputes (-0.8)</span>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground italic leading-relaxed pt-2">
              *The final score is normalized between 0% and 100%, classifying results into Low, Medium, High, or Critical badges.
            </p>
          </div>

          {/* Environmental Value Proposition */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-emerald-400" />
              GENIUS Olympiad Impact
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                <strong>Community Stewardship</strong>: Bridges the gap between citizens who witness pollution and the agencies responsible for remediation.
              </p>
              <p>
                <strong>Scientific Rigor</strong>: Replaces slow, manual inspection with instant visual AI diagnostics, speeding up the alert timeline by up to 90%.
              </p>
              <p>
                <strong>Data Transparency</strong>: Provides public maps and open analytics grids so local organizations can trace environmental hot spots.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
