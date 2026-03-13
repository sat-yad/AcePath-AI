'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/app-shell';
import { Card, Badge, Button } from '@/components/ui';
import api from '@/lib/api';

export default function DailyPlanPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError(null);
        const res = await api.get('/tasks/today');
        setData(res.data.data);
      } catch (err: any) {
        console.error('Failed to fetch tasks', err);
        setError(err.response?.data?.message || 'Failed to generate your daily plan. Please check your AI provider configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const toggleTask = async (index: number) => {
    // Optimistic UI
    const newTasks = [...data.tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setData({ ...data, tasks: newTasks });

    try {
      await api.patch(`/tasks/${data.id}/complete`, { 
        taskIndex: index,
        timeSpentMins: newTasks[index].estimatedMins,
        score: 10
      });
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-full">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    </AppShell>
  );

  if (error) return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="space-y-4">
          <Badge variant="danger">Error</Badge>
          <h1 className="text-4xl font-bold font-outfit text-white">Daily Preparation Plan</h1>
        </header>
        <Card className="p-8 border-red-500/20 bg-red-500/5 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-white font-outfit">Plan Generation Failed</h2>
          <p className="text-slate-400 max-w-lg mx-auto">{error}</p>
          <p className="text-sm text-slate-500">If you are the developer, please ensure OPENAI_API_KEY is properly set in your backend environment variables.</p>
        </Card>
      </div>
    </AppShell>
  );

  const tasks = data?.tasks || [];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="space-y-4">
          <Badge>
            {new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).format(new Date())}
          </Badge>
          <h1 className="text-4xl font-bold font-outfit text-white">Daily Preparation Plan</h1>
          <p className="text-slate-400 leading-relaxed max-w-2xl">
            {data?.motivationalNote || "Your daily tasks are dynamically adjusted based on your performance and goals."}
          </p>
        </header>

        <Card className="p-8 border-indigo-500/20 bg-indigo-500/5">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <span className="text-2xl">🎯</span>
                 <h2 className="text-xl font-bold text-white font-outfit">Today's Goal: {data?.dailyGoal || 'Preparation'}</h2>
              </div>
              <div className="text-sm font-medium text-slate-400">
                {tasks.filter((t: any) => t.completed).length} / {tasks.length} Complete
              </div>
           </div>
           
           <div className="w-full bg-slate-800 h-2 rounded-full mb-2">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: tasks.length > 0 ? `${(tasks.filter((t: any) => t.completed).length / tasks.length) * 100}%` : '0%' }}
              />
           </div>
        </Card>

        <div className="space-y-4">
           {tasks.map((task: any, idx: number) => (
             <div 
               key={idx} 
               onClick={() => toggleTask(idx)}
               className={`group flex items-start gap-6 p-6 rounded-2xl border transition-all cursor-pointer ${
                 task.completed 
                   ? 'bg-slate-900/30 border-slate-800 opacity-60' 
                   : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
               }`}
             >
               <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                 task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 group-hover:border-indigo-500'
               }`}>
                 {task.completed && <span className="text-white text-[10px]">L</span>}
               </div>

               <div className="flex-1 space-y-1">
                 <div className="flex items-center justify-between">
                    <h3 className={`font-bold transition-all ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <Badge variant={task.difficulty === 'hard' ? 'danger' : task.difficulty === 'medium' ? 'warning' : 'success'}>
                      {task.difficulty}
                    </Badge>
                 </div>
                 <p className="text-sm text-slate-400">{task.description}</p>
                 <div className="flex items-center gap-4 pt-3">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      ⏱️ {task.estimatedMins} Mins
                    </span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      🏷️ {task.type}
                    </span>
                    {task.resourceLink && (
                      <a href={task.resourceLink} target="_blank" className="text-xs text-indigo-400 font-bold uppercase tracking-widest hover:underline">
                        Docs →
                      </a>
                    )}
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </AppShell>
  );
}
