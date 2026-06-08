'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';
import { useTheme } from './theme-provider';
import { ShieldAlert, BarChart3, List, LogOut, Sun, Moon, User, Menu, X, PlusCircle, Brain, Eye } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/reports', label: 'Incidents Feed', icon: List },
    { href: '/dashboard/authority', label: 'Authority Board', icon: ShieldAlert },
    { href: '/disclosure', label: 'AI Tech Specification', icon: Brain },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/25 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400">
                TerraMind <span className="text-foreground/80 font-normal text-xs uppercase tracking-widest pl-1">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-1.5 items-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive(link.href)
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-border bg-white/5 hover:bg-white/10 hover:text-cyan-400 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* CTA Report */}
            <Link
              href="/report"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-xs font-bold hover:from-cyan-400 hover:to-teal-400 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              Report incident
            </Link>

            {/* Auth section */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-border">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-foreground/80 max-w-[120px] truncate leading-tight">{user.full_name}</span>
                  <span className="text-[10px] text-muted-foreground max-w-[120px] truncate">
                    {user.org_id ? '🚨 Authority' : 'Contributor'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <Link
                  href="/login"
                  className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-2 text-xs font-bold bg-white/10 border border-border hover:bg-white/15 rounded-xl transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-white/5 text-foreground"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-border bg-white/5 text-foreground hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-white/5 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium transition ${
                  isActive(link.href)
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold transition"
          >
            <PlusCircle className="w-5 h-5" />
            Report Incident
          </Link>

          {user ? (
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{user.full_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.org_id ? 'NGO Authority' : 'Contributor'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-sm font-semibold hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold border border-border hover:bg-white/5 rounded-xl transition"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold bg-cyan-500 text-white rounded-xl transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
