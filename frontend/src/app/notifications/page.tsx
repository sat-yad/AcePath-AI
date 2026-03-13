'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/app-shell';
import { Card, Badge, Button } from '@/components/ui';
import api from '@/lib/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock notifications for now as the backend endpoint might not have data yet
    setNotifications([
      { id: 1, title: 'Mock Interview Evaluation', message: 'Your latest system design mock has been analyzed. Score: 8.2/10.', type: 'info', read: false, time: '2 hours ago' },
      { id: 2, title: 'Achievement Unlocked', message: '7 Day Streak! You are now in the top 10% of consistent performers.', type: 'success', read: false, time: '5 hours ago' },
      { id: 3, title: 'Roadmap Adjusted', message: 'AI Mentor has adjusted your Week 5 plan to include "Advanced Graph Algorithms".', type: 'warning', read: true, time: 'Yesterday' },
      { id: 4, title: 'Resume Feedback', message: 'Resume coach suggests improving the impact metrics on your Amazon internship entry.', type: 'info', read: true, time: '2 days ago' },
    ]);
    setLoading(false);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-full">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <header className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold font-outfit text-white">Notifications</h1>
            <p className="text-slate-400">Stay updated on your AI coaching and community feedback.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all as read</Button>
        </header>

        <div className="space-y-4">
           {notifications.length > 0 ? (
             notifications.map((notif) => (
               <Card key={notif.id} className={`p-6 transition-all border-slate-800 hover:border-slate-700 ${!notif.read ? 'bg-indigo-600/5' : ''}`}>
                  <div className="flex items-start gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                       notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                       notif.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                       'bg-indigo-500/10 text-indigo-400'
                     }`}>
                        {notif.type === 'success' ? '🏆' : notif.type === 'warning' ? '⚡' : '🤖'}
                     </div>
                     <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                           <h3 className="font-bold text-white">{notif.title}</h3>
                           <span className="text-xs text-slate-500">{notif.time}</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{notif.message}</p>
                        {!notif.read && <Badge variant="info">New</Badge>}
                     </div>
                  </div>
               </Card>
             ))
           ) : (
             <div className="py-20 text-center space-y-4">
                <div className="text-6xl text-slate-800">📭</div>
                <h3 className="text-xl font-bold text-white">No notifications yet</h3>
                <p className="text-slate-500">We'll alert you when there's progress in your coaching.</p>
             </div>
           )}
        </div>
      </div>
    </AppShell>
  );
}
