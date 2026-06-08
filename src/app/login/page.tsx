'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Brain, Mail, Lock, Loader2, AlertCircle, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.org_id) {
        router.push('/dashboard/authority');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      // router handles redirect in useEffect
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center min-h-[85vh] px-4 py-12 relative">
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/5 relative">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 items-center justify-center mb-4 text-cyan-400">
            <Brain className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">SaaS Portal Login</h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Log in to monitor, verify, and resolve ecological hazards.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@terramind.ai"
                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || authLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:from-cyan-400 hover:to-teal-400 transition hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Enter Portal'
            )}
          </button>
        </form>

        {/* Demo Assistant Box */}
        <div className="mt-6 p-4 rounded-xl border border-cyan-500/15 bg-cyan-500/5 flex items-start gap-2.5 text-xs text-cyan-400">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Judging Note:</strong>
            To test the **Authority Dashboard / NGO Portal**, log in using email <code className="font-bold underline">inspector@terramind.ai</code> (password can be anything). Use any other email to log in as a normal citizen contributor.
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Need an account?{' '}
            <Link href="/signup" className="text-cyan-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
