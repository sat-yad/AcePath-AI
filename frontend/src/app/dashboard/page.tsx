'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/app-shell';
import { Card, Badge, Button, Progress, AnimatedCounter } from '@/components/ui';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/progress');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <AppShell>
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-[3px] border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 border-[2px] border-purple-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-slate-600 text-sm font-medium animate-pulse">Syncing career intelligence...</p>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <Badge variant="info">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5 animate-pulse" />
              Phase 1: Foundation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black font-outfit text-white tracking-tight">
              Command <span className="text-gradient">Center</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">Welcome back. Your next milestone is 4 days away.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="md" className="rounded-xl border-white/[0.06] bg-white/[0.02]">
              Performance Report
            </Button>
            <Button size="md" className="rounded-xl glow">Resume Training</Button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          <StatCard 
            title="Readiness Score" 
            value={stats?.readinessScore || 0} 
            suffix="%" 
            detail="Overall interview fitness" 
            icon="🎯"
            trend="+5.2% this week"
            trendUp={true}
            iconBg="bg-indigo-500/10 border-indigo-500/15"
          />
          <StatCard 
            title="Active Streak" 
            value={stats?.currentStreak || 0} 
            suffix=" Days" 
            detail="Consistency index" 
            icon="🔥"
            trend="Keep it going!"
            trendUp={true}
            iconBg="bg-orange-500/10 border-orange-500/15"
          />
          <StatCard 
            title="Knowledge Coverage" 
            value={stats?.knowledgeCoverage || 0} 
            suffix="/150" 
            detail="Technical concepts mastered" 
            icon="🧠"
            trend="Needs consistent practice"
            trendUp={true}
            iconBg="bg-purple-500/10 border-purple-500/15"
          />
          <StatCard 
            title="Avg Rating" 
            value={stats?.avgRating || 0} 
            suffix="" 
            detail="Mock interview performance" 
            icon="⭐"
            trend="Keep practicing"
            trendUp={true}
            iconBg="bg-amber-500/10 border-amber-500/15"
          />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weekly Progress */}
          <Card className="lg:col-span-8 p-8 relative group" hoverable={false}>
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none">
              <span className="text-8xl">📈</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-outfit text-white">Weekly Focus: {stats?.weeklyFocus || 'System Design'}</h2>
                <p className="text-slate-600 text-sm font-medium">Targeting your personalized goals</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-gradient font-outfit">Based on roadmap</div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em]">Total Coverage</div>
              </div>
            </div>
            
            <div className="space-y-8">
              {(stats?.weeklyGoals || []).length > 0 ? stats.weeklyGoals.map((goal: any, idx: number) => (
                <ProgressItem 
                  key={idx}
                  title={goal.title} 
                  desc={goal.desc}
                  progress={goal.progress}
                  status={goal.status}
                  icon={goal.icon}
                />
              )) : (
                <>
                  <ProgressItem 
                    title="Complete Mock Interview" 
                    desc="Take your first interview to generate personalized goals."
                    progress={0}
                    status="Waiting"
                    icon="🎯"
                  />
                </>
              )}
            </div>
            
            <div className="mt-10 pt-6 border-t border-white/[0.04] flex justify-between items-center">
              <p className="text-xs text-slate-600 font-medium">Last synced: 2 hours ago</p>
              <Link href="/roadmap" className="text-indigo-400 hover:text-white transition-colors font-bold text-[11px] uppercase tracking-[0.12em] flex items-center gap-2 group">
                Review Roadmap <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Mentor */}
            <Card className="p-7 border-purple-500/10 relative overflow-hidden" hoverable={true}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/[0.06] to-purple-600/[0.06] pointer-events-none" />
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400 text-sm">✨</div>
                  <h3 className="font-bold text-white font-outfit text-xs uppercase tracking-[0.12em]">AI Mentor Hint</h3>
                </div>
                <p className="text-slate-400 italic text-sm leading-relaxed mb-6 font-medium" dangerouslySetInnerHTML={{ __html: (stats?.aiMentorHint || '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>') }}>
                </p>
                <Link href="/daily-plan">
                  <Button size="sm" className="w-full h-10 rounded-xl text-xs">Initialize Deep Dive →</Button>
                </Link>
              </div>
            </Card>

            {/* Skill Priority Matrix */}
            <Card className="p-7" hoverable={true}>
              <h3 className="text-lg font-bold text-white font-outfit mb-6">Skill Priority Matrix</h3>
              <div className="space-y-3">
                {(stats?.skillPriorityMatrix || []).map((skill: any, idx: number) => (
                  <PriorityItem 
                    key={idx} 
                    label={skill.label} 
                    level={skill.level} 
                    color={skill.color} 
                    bg={skill.bg} 
                  />
                ))}
              </div>
              <div className="mt-8">
                <Link href="/analytics" className="w-full flex items-center justify-center h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-500 font-bold text-[11px] uppercase tracking-[0.12em] hover:bg-white/[0.05] hover:text-white transition-all duration-300">
                  Detailed Analytics
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* ── Sub-components ── */

function StatCard({ title, value, suffix, detail, icon, trend, trendUp, iconBg }: any) {
  return (
    <Card className="p-6 border-white/[0.05] flex flex-col justify-between group animate-fade-in-up" hoverable={true}>
      <div className="flex justify-between items-start mb-5">
        <div className={`text-2xl w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} border group-hover:scale-110 transition-all duration-500`}>
          {icon}
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${trendUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
          {trend}
        </div>
      </div>
      <div>
        <div className="text-3xl font-black text-white font-outfit mb-0.5 tabular-nums tracking-tight">
          <AnimatedCounter target={typeof value === 'number' ? value : Number(value)} suffix={suffix} decimals={String(value).includes('.') ? 1 : 0} />
        </div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-3">{title}</div>
        <div className="text-[11px] font-medium text-slate-700">{detail}</div>
      </div>
    </Card>
  );
}

function ProgressItem({ title, desc, progress, status, icon }: any) {
  return (
    <div className="space-y-2.5 group/item">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900/80 border border-white/[0.06] rounded-xl flex items-center justify-center text-lg group-hover/item:scale-105 transition-transform duration-300">{icon}</div>
          <div>
            <div className="font-bold text-white text-sm">{title}</div>
            <div className="text-xs text-slate-600 font-medium">{desc}</div>
          </div>
        </div>
        <Badge variant={status === 'Mastered' ? 'success' : status === 'In Progress' ? 'info' : 'warning'}>
          {status}
        </Badge>
      </div>
      <div className="pl-[52px]">
        <Progress value={progress} size="sm" color={status === 'Mastered' ? 'emerald' : 'indigo'} />
      </div>
    </div>
  );
}

function PriorityItem({ label, level, color, bg }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group">
      <span className="text-sm font-semibold text-slate-400 group-hover:text-white transition-colors">{label}</span>
      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${bg} ${color}`}>
        {level}
      </span>
    </div>
  );
}
