import Link from 'next/link';
import { Brain, Cpu, ShieldAlert, BarChart3, ArrowRight, Eye, AlertTriangle, ShieldCheck, Globe, Activity } from 'lucide-react';

export default function Home() {
  const problems = [
    {
      title: 'Delayed Response',
      desc: 'Pollution, illegal dumping, and hazardous leaks are discovered too late, leading to irreparable aquifer and ecosystem damage.'
    },
    {
      title: 'Fragmented Systems',
      desc: 'Reports are distributed across disconnected paper workflows, emails, and phone logs, leaving authorities blind to trends.'
    },
    {
      title: 'Manual Diagnostics',
      desc: 'Assessing severity levels and deciding which threats need immediate response is slow, subjective, and resource-heavy.'
    }
  ];

  const solutions = [
    {
      icon: Cpu,
      title: 'Gemini Computer Vision',
      desc: 'Automates photo auditing to classify threats, measure severities, and generate immediate recommended actions.',
      color: 'text-cyan-400 bg-cyan-500/10'
    },
    {
      icon: Globe,
      title: 'Geospatial Intelligence',
      desc: 'Maps active hazards on interactive layers, revealing hotspot clusters and population density coordinates.',
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      icon: ShieldCheck,
      title: 'Validated Action Networks',
      desc: 'Empowers citizens to confirm issues, while giving NGOs and agencies dedicated boards to track outcomes.',
      color: 'text-violet-400 bg-violet-500/10'
    }
  ];

  const stats = [
    { value: '1,482', label: 'Incidents Analyzed', icon: AlertTriangle, color: 'text-amber-400 border-amber-500/15 bg-amber-500/5' },
    { value: '34', label: 'Regions Covered', icon: Globe, color: 'text-cyan-400 border-cyan-500/15 bg-cyan-500/5' },
    { value: '418', label: 'Risks Identified', icon: Activity, color: 'text-rose-400 border-rose-500/15 bg-rose-500/5' },
    { value: '1,208', label: 'Contributors', icon: ShieldCheck, color: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5' },
  ];

  return (
    <div className="relative overflow-hidden flex flex-col items-center">
      {/* Mesh Background Blurs */}
      <div className="absolute top-[-15%] left-[-20%] w-[700px] h-[700px] rounded-full bg-cyan-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-36 md:pb-28 flex flex-col items-center text-center">
        {/* Rebrand badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in-up">
          <Brain className="w-3.5 h-3.5" />
          Dev Season of Code 2026
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 animate-fade-in-up">
          AI-Powered{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400">
            Environmental Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10 [animation-delay:200ms] animate-fade-in-up">
          Transform environmental reporting into actionable intelligence. Leverage computer vision, predictive threat maps, and validation networks to coordinate ecological response.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto [animation-delay:400ms] animate-fade-in-up">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:-translate-y-0.5 transition duration-300 group"
          >
            Launch Platform
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/reports"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 glass-panel border border-white/10 hover:border-white/20 hover:bg-white/5 font-bold rounded-2xl hover:-translate-y-0.5 transition duration-300"
          >
            Explore Registry
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </Link>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">The Challenge</span>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Fragmented Environmental Monitoring</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Current ecological reporting is reactive, heavily manual, and localized. Hazardous incidents are discovered long after contamination cycles begin, and authorities struggle to prioritize dispatch.
            </p>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {problems.map((prob, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <span className="text-xs font-black text-rose-500/80">0{idx + 1}.</span>
                <h3 className="font-bold text-sm text-foreground">{prob.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{prob.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Overview Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">The Solution</span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Unified Ecosystem Intelligence</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            TerraMind AI merges computer vision, spatial calculations, and priority routing to build a startup-grade response network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((sol, idx) => {
            const Icon = sol.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300 hover:shadow-2xl"
              >
                <div className={`w-12 h-12 rounded-xl ${sol.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-3">{sol.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{sol.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5 mb-16">
        <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
          
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Measurable Societal Impact</h2>
            <p className="text-muted-foreground text-xs max-w-md mx-auto">
              Real-time monitoring counts verified dynamically across our active regional nodes.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`p-3 rounded-2xl border mb-4 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
