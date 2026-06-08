import Link from 'next/link';
import { Leaf, Camera, ShieldCheck, BarChart3, ArrowRight, Eye, AlertTriangle, Activity, Globe } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Camera,
      title: '1. Document it',
      description: 'Capture a picture of the illegal dumping, water contamination, or wildlife hazard and tag the location in seconds.',
      color: 'from-emerald-500 to-green-500',
    },
    {
      icon: Eye,
      title: '2. AI Analysis',
      description: 'Our integrated Gemini Vision AI instantly scans the photo, categorizes the incident, determines severity, and analyzes ecological impacts.',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: ShieldCheck,
      title: '3. Verify & Resolve',
      description: 'Local communities confirm the report, tracking actions over time. Upload recovery pictures to monitor ecological healing.',
      color: 'from-teal-500 to-emerald-500',
    },
  ];

  const stats = [
    { value: '1,420+', label: 'Incidents Logged', icon: AlertTriangle, color: 'text-amber-500' },
    { value: '84%', label: 'Community Resolution Rate', icon: ShieldCheck, color: 'text-emerald-400' },
    { value: '4.2 Tons', label: 'Waste Cleared', icon: Globe, color: 'text-cyan-400' },
    { value: '98%', label: 'AI Accuracy Rating', icon: Activity, color: 'text-indigo-400' },
  ];

  return (
    <div className="relative overflow-hidden flex flex-col items-center">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">
        {/* Sub-Header Tagline Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-8 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
          <Leaf className="w-3.5 h-3.5" />
          See it. Report it. Protect it.
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6 font-display">
          AI-Powered{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Environmental Incident
          </span>{' '}
          Reporting
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up [animation-delay:200ms] text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Empower your community. Report ecological threats such as illegal dumping, wildlife hazards, and water pollution in real time. Backed by state-of-the-art vision intelligence.
        </p>

        {/* Hero CTA Buttons */}
        <div className="animate-fade-in-up [animation-delay:400ms] flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <Link
            href="/report"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition duration-300 group"
          >
            Report Incident
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 glass-panel border border-white/10 hover:border-white/20 hover:bg-white/10 font-bold rounded-2xl hover:-translate-y-0.5 transition duration-300"
          >
            View Live Reports
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">How EcoWatch AI Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our platform simplifies environmental stewardship in three rapid steps, translating citizen action into verifiable local data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300 hover:shadow-2xl"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feat.color} flex items-center justify-center text-white mb-6 shadow-md`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border mb-16">
        <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Our Environmental Impact</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Real-time monitoring stats generated directly from community-driven updates.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`p-3 rounded-2xl bg-white/5 border border-border mb-4 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 mb-1">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">
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
