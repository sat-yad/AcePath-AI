'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/app-shell';
import { Card, Badge, Button } from '@/components/ui';
import api from '@/lib/api';
import Link from 'next/link';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get('/roadmap');
        setRoadmap(res.data.data);
      } catch (err) {
        console.error('Failed to fetch roadmap', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-full">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    </AppShell>
  );

  if (!roadmap) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in-up max-w-lg mx-auto">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-3xl font-bold font-outfit text-white">No Roadmap Found</h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            You haven't generated your personalized interview roadmap yet. Complete the onboarding process to get a tailored plan based on your target companies and skill gaps.
          </p>
          <Link href="/onboarding" className="mt-4">
            <Button size="lg" className="rounded-xl glow">Generate My Roadmap</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-outfit text-white">{roadmap?.title || 'Your Career Roadmap'}</h1>
            <p className="text-slate-400">Personalized for Google, Meta and Stripe prep</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</span>
                <span className="text-white font-bold">{roadmap?.duration_months || 3} Months</span>
             </div>
             <div className="w-[1px] h-8 bg-slate-800" />
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Goals</span>
                <span className="text-indigo-400 font-bold">{roadmap?.milestones?.length || 0} Weeks</span>
             </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-600 before:via-purple-600 before:to-slate-900">
          
          {(roadmap?.milestones || []).map((milestone: any, idx: number) => (
            <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${idx > 3 ? 'opacity-40 grayscale' : ''}`}>
              {/* Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-950 text-white font-bold shadow-xl shadow-indigo-500/20 z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {milestone.week}
              </div>

              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl md:order-2">
                <Card className={`p-6 transition-all group-hover:border-indigo-500/50 ${idx === 3 ? 'border-indigo-500 bg-indigo-500/5' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Week {milestone.week}</span>
                     {milestone.mockInterviewScheduled && <Badge variant="warning">Mock Interview</Badge>}
                  </div>
                  <h3 className="text-xl font-bold text-white font-outfit mb-3">{milestone.title}</h3>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">{milestone.focusArea}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {(milestone.skills || []).map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 font-medium">#{skill}</span>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
