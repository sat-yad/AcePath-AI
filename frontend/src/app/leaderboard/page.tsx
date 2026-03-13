'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/app-shell';
import { Card, Badge, Button } from '@/components/ui';
import api from '@/lib/api';

export default function LeaderboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/streak/leaderboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
        <header className="text-center space-y-4">
          <Badge>Global Community</Badge>
          <h1 className="text-5xl font-bold font-outfit text-white">Elite Preparedness Leaderboard</h1>
          <p className="text-slate-400 max-w-xl mx-auto">Top performers smashing their career goals through consistency and grit.</p>
        </header>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12">
          {data.length > 1 ? (
             <PodiumItem rank={2} name={data[1]?.full_name || 'Anonymous'} streak={data[1]?.current_streak || 0} avatar={data[1]?.full_name?.charAt(0) || '?'} height="h-48" />
          ) : <div />}
          {data.length > 0 ? (
             <PodiumItem rank={1} name={data[0]?.full_name || 'Anonymous'} streak={data[0]?.current_streak || 0} avatar={data[0]?.full_name?.charAt(0) || '?'} height="h-64" isMain />
          ) : <div className="h-64 flex items-center justify-center text-slate-500 font-bold">No Data</div>}
          {data.length > 2 ? (
             <PodiumItem rank={3} name={data[2]?.full_name || 'Anonymous'} streak={data[2]?.current_streak || 0} avatar={data[2]?.full_name?.charAt(0) || '?'} height="h-40" />
          ) : <div />}
        </div>

        <Card className="overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-900 border-b border-slate-800">
                 <tr>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Rank</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Current Streak</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Longest Streak</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {data.map((user, idx) => (
                   <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                         <span className={`text-lg font-bold font-outfit ${idx < 3 ? 'text-indigo-400' : 'text-slate-500'}`}>#{idx + 1}</span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700 group-hover:border-indigo-500/50 transition-all">
                              {user.full_name?.charAt(0)}
                            </div>
                            <div>
                               <div className="font-bold text-white">{user.full_name}</div>
                               <div className="text-xs text-slate-500 uppercase tracking-widest">Sr. Engineer @ Netflix Prep</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">{user.current_streak}</span>
                            <span className="text-sm">🔥</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-slate-400 font-medium">{user.longest_streak} Days</span>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </Card>
      </div>
    </AppShell>
  );
}

function PodiumItem({ rank, name, streak, avatar, height, isMain }: any) {
  return (
    <div className="flex flex-col items-center space-y-6">
       <div className={`relative ${isMain ? 'w-24 h-24' : 'w-20 h-20'} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-2xl shadow-indigo-500/30`}>
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-2xl font-bold font-outfit text-white">
             {avatar}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400">
             #{rank}
          </div>
       </div>
       <div className={`w-full ${height} bg-gradient-to-t from-indigo-600/20 to-indigo-600/5 border border-indigo-500/20 rounded-t-3xl flex flex-col items-center justify-center p-6 text-center space-y-1`}>
          <div className="font-bold text-white truncate w-full">{name}</div>
          <div className="text-2xl font-black text-indigo-400 font-outfit">{streak} 🔥</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Day Streak</div>
       </div>
    </div>
  );
}
