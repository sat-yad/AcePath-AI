'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/app-shell';
import { Card, Badge, Button } from '@/components/ui';
import api from '@/lib/api';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/skill-gaps');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-full">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    </AppShell>
  );

  if (!data) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in-up max-w-lg mx-auto">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold font-outfit text-white">No Analytics Yet</h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Your skill gap report is generated automatically after you complete your first Mock Interview. Complete a session to see your readiness score, strengths, and weaknesses.
          </p>
          <Link href="/interview" className="mt-4">
            <Button size="lg" className="rounded-xl glow">Start Mock Interview</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-12 animate-in fade-in duration-700">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold font-outfit text-white">Skill Analysis & Gaps</h1>
          <p className="text-slate-400">Deep dive into your performance metrics and identified improvement areas.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Skill Radar / Stats Area */}
           <Card className="lg:col-span-2 p-8 border-indigo-500/20">
              <h2 className="text-xl font-bold font-outfit text-white mb-8 uppercase tracking-widest text-xs">Skill Matrix</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                 <SkillRadarItem label="DSA" score={82} color="indigo" />
                 <SkillRadarItem label="System Design" score={45} color="red" />
                 <SkillRadarItem label="Behavioral" score={78} color="emerald" />
                 <SkillRadarItem label="Concurrency" score={30} color="red" />
                 <SkillRadarItem label="Scalability" score={55} color="amber" />
                 <SkillRadarItem label="Communication" score={90} color="emerald" />
              </div>
              
              <div className="mt-12 p-6 bg-slate-950 rounded-xl border border-slate-800">
                 <h3 className="text-sm font-bold text-white mb-4">Overall Readiness Score</h3>
                 <div className="flex items-end gap-3">
                    <span className="text-6xl font-bold text-indigo-400 font-outfit">{data?.readinessScore || 0}%</span>
                 </div>
                 <div className="w-full bg-slate-800 h-3 rounded-full mt-4 overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: '64%' }} />
                 </div>
              </div>
           </Card>

           {/* Recommendations */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold font-outfit text-white uppercase tracking-widest text-xs px-2">AI Recommendations</h2>
              {(data?.recommendations || [
                { area: 'System Design', action: 'Deep dive into Master-Slave vs Peer-to-Peer replication', resources: ['Grokking SD'], estimatedWeeks: 1 },
                { area: 'Concurrency', action: 'Practice Semaphore and Mutex problems in Java/Go', resources: ['LeetCode Multi-threading'], estimatedWeeks: 2 }
              ]).map((rec: any, idx: number) => (
                <Card key={idx} className="p-6 space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{rec.area}</span>
                      <Badge variant="warning">{rec.estimatedWeeks} Week Plan</Badge>
                   </div>
                   <p className="text-sm text-slate-400">{rec.action}</p>
                   <div className="flex gap-2">
                      {rec.resources.map((res: string) => <Badge key={res} variant="info">{res}</Badge>)}
                   </div>
                </Card>
              ))}
           </div>
        </div>

        {/* Gaps List */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold font-outfit text-white uppercase tracking-widest text-xs px-2">Identified Gaps</h2>
           <Card className="overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-slate-900/80 border-b border-slate-800">
                    <tr>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Skill Area</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Current Level</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Target Level</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {(data?.gaps || []).map((gap: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                         <td className="px-6 py-4 font-medium text-white">{gap.skill}</td>
                         <td className="px-6 py-4">
                            <div className="flex gap-1">
                               {[...Array(10)].map((_, i) => (
                                 <div key={i} className={`w-2 h-2 rounded-sm ${i < gap.currentLevel ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                               ))}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="text-xs font-bold text-slate-400">{gap.targetLevel}/10</div>
                         </td>
                         <td className="px-6 py-4">
                            <Badge variant={gap.priority === 'high' ? 'danger' : 'warning'}>{gap.priority}</Badge>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </Card>
        </div>
      </div>
    </AppShell>
  );
}

function SkillRadarItem({ label, score, color }: any) {
  const colorMap: any = {
    indigo: 'bg-indigo-500',
    red: 'bg-red-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="flex flex-col items-center gap-4 group">
       <div className="relative w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle 
               cx="40" cy="40" r="36" 
               className="stroke-indigo-500/10 fill-none" 
               strokeWidth="4" 
             />
             <circle 
               cx="40" cy="40" r="36" 
               className={`${colorMap[color]} fill-none transition-all duration-1000 ease-out`} 
               strokeWidth="4" 
               strokeDasharray={`${(score / 100) * 226} 226`}
               stroke="currentColor"
               style={{ stroke: 'white' }}
             />
          </svg>
          <span className="text-lg font-bold text-white font-outfit">{score}%</span>
       </div>
       <span className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}
