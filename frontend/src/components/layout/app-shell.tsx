'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { label: 'Dashboard',     href: '/dashboard',   icon: '⬡',  emoji: '📊', color: 'indigo',  gradient: 'from-indigo-500 to-blue-500' },
  { label: 'Roadmap',       href: '/roadmap',     icon: '◈',  emoji: '🗺️', color: 'violet',  gradient: 'from-violet-500 to-purple-500' },
  { label: 'Daily Plan',    href: '/daily-plan',  icon: '◉',  emoji: '✅', color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
  { label: 'Mock Interview',href: '/interview',   icon: '◆',  emoji: '🤖', color: 'amber',   gradient: 'from-amber-500 to-orange-500' },
  { label: 'Resume Coach',  href: '/resume',      icon: '◇',  emoji: '📄', color: 'cyan',    gradient: 'from-cyan-500 to-sky-500' },
  { label: 'Analytics',     href: '/analytics',   icon: '◈',  emoji: '🔍', color: 'pink',    gradient: 'from-pink-500 to-rose-500' },
  { label: 'Leaderboard',   href: '/leaderboard', icon: '◉',  emoji: '🏆', color: 'yellow',  gradient: 'from-yellow-500 to-amber-500' },
];

const colorMap: Record<string, { active: string; glow: string; dot: string }> = {
  indigo:  { active: 'rgba(99,102,241,0.18)', glow: 'rgba(99,102,241,0.4)',  dot: 'bg-indigo-400' },
  violet:  { active: 'rgba(139,92,246,0.18)', glow: 'rgba(139,92,246,0.4)',  dot: 'bg-violet-400' },
  emerald: { active: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.4)',  dot: 'bg-emerald-400' },
  amber:   { active: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.4)',  dot: 'bg-amber-400' },
  cyan:    { active: 'rgba(6,182,212,0.15)',  glow: 'rgba(6,182,212,0.4)',   dot: 'bg-cyan-400' },
  pink:    { active: 'rgba(236,72,153,0.15)', glow: 'rgba(236,72,153,0.4)',  dot: 'bg-pink-400' },
  yellow:  { active: 'rgba(234,179,8,0.15)',  glow: 'rgba(234,179,8,0.4)',   dot: 'bg-yellow-400' },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen" style={{ background: '#02030f' }}>
      {/* ── AMBIENT ORBS ── */}
      <div className="bg-orb bg-orb-indigo w-[600px] h-[600px] top-[-100px] left-[-150px] opacity-50" />
      <div className="bg-orb bg-orb-purple w-[500px] h-[500px] bottom-0 right-0 opacity-35" />
      <div className="bg-orb bg-orb-cyan w-[300px] h-[300px] top-1/2 left-1/2 opacity-20" />

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className="sidebar-3d w-[72px] lg:w-[260px] hidden md:flex flex-col sticky top-0 h-screen z-30 overflow-hidden transition-all duration-300">
        
        {/* Decorative top gradient line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* Logo */}
        <div className="p-4 lg:p-6 pb-2">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {/* 3D Logo Icon */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg group-hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
                <span className="relative z-10 font-outfit">A</span>
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.5), inset 0 0 20px rgba(99,102,241,0.1)' }} />
            </div>
            <div className="hidden lg:block">
              <div className="text-[15px] font-black text-white font-outfit tracking-tight leading-none">
                AcePath
              </div>
              <div className="text-[11px] font-bold tracking-[0.15em] uppercase mt-0.5 text-gradient">AI Platform</div>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-4 lg:mx-5 my-3 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

        {/* Section label */}
        <div className="hidden lg:block px-5 mb-2">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Navigation</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 lg:px-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const colors = colorMap[item.color];
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className="relative flex items-center gap-3 px-2.5 lg:px-3.5 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden"
                style={{
                  background: isActive ? colors.active : hoveredItem === item.href ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: isActive ? `1px solid ${colors.glow.replace('0.4', '0.25')}` : '1px solid transparent',
                  boxShadow: isActive ? `0 0 20px ${colors.glow.replace('0.4', '0.08')}, inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
                }}
              >
                {/* Active left bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                    style={{ background: `linear-gradient(to bottom, ${colors.glow}, ${colors.glow.replace('0.4','0.8')})`, boxShadow: `0 0 8px ${colors.glow}` }}
                  />
                )}

                {/* Icon container */}
                <div className={`relative w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-base transition-all duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
                  style={{
                    background: isActive ? `${colors.active}` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? colors.glow.replace('0.4','0.2') : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <span>{item.emoji}</span>
                </div>

                <span className={`hidden lg:block text-[13px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}>{item.label}</span>

                {/* Active dot */}
                {isActive && (
                  <div className="hidden lg:block ml-auto">
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}
                      style={{ boxShadow: `0 0 6px ${colors.glow}` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-2 lg:p-3 space-y-2">
          {/* Divider */}
          <div className="mx-2 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* User card */}
          <div className="hidden lg:block p-3 rounded-xl overflow-hidden relative"
            style={{ background: 'rgba(8,10,28,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">Plan</span>
                {user?.tier === 'premium' ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
                    Premium
                  </span>
                ) : (
                  <Link href="/pricing" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Upgrade →
                  </Link>
                )}
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full relative overflow-hidden transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, Math.max(0, ((user?.interviews_taken || 0) / (user?.tier === 'premium' ? 30 : 5)) * 100))}%`, 
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ animation: 'shimmer-sweep 2.5s infinite' }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-slate-600 mt-1.5 font-medium">
                {Math.max(0, (user?.tier === 'premium' ? 30 : 5) - (user?.interviews_taken || 0))} / {user?.tier === 'premium' ? 30 : 5} interviews remaining
              </div>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={logout}
            className="flex items-center justify-center lg:justify-start gap-3 px-2.5 lg:px-3.5 py-2.5 w-full rounded-xl transition-all duration-200 group"
            style={{ color: 'rgba(100,116,139,1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(100,116,139,1)'; }}
          >
            <span className="text-base">🚪</span>
            <span className="hidden lg:block text-[13px] font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40"
          style={{
            background: 'rgba(2,3,15,0.7)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* Scan line decoration */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="flex items-center gap-4">
            {/* Mobile logo */}
            <div className="md:hidden text-base font-black font-outfit text-white">
              AcePath <span className="text-gradient">AI</span>
            </div>
            {/* Desktop welcome */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-slate-500">Welcome back,</span>
              <span className="text-white font-bold">{user?.full_name || 'User'}</span>
              <span className="text-lg">👋</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Status pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
              <span className="text-emerald-400">AI Online</span>
            </div>

            {/* Notification */}
            <Link href="/notifications" className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <span className="text-sm">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#02030f]" style={{ boxShadow: '0 0 6px rgba(99,102,241,0.8)' }} />
            </Link>

            {/* Settings */}
            <Link href="/settings"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <span className="text-sm">⚙️</span>
            </Link>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl overflow-hidden relative flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.08), 0 0 20px rgba(99,102,241,0.3)',
              }}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-sm text-white">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 lg:p-8 relative overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
