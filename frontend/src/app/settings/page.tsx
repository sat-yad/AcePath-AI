'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/app-shell';
import { Card, Badge, Button, Input } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold font-outfit text-white">Settings</h1>
          <p className="text-slate-400">Manage your account, subscription, and notification preferences.</p>
        </header>

        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl w-fit border border-slate-800">
           {['profile', 'account', 'subscription', 'notifications'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                 activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>

        {activeTab === 'profile' && (
           <div className="space-y-8 animate-in slide-in-from-left-2 duration-500">
              <Card className="p-8">
                 <h2 className="text-xl font-bold font-outfit text-white mb-8">Personal Information</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                       <Input value={user?.full_name} readOnly />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                       <Input value={user?.email} readOnly />
                    </div>
                    <div className="lg:col-span-2 flex items-center gap-6 p-6 bg-slate-950 rounded-xl border border-slate-800">
                       <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-2xl">
                          {user?.full_name?.charAt(0)}
                       </div>
                       <div className="flex-1 space-y-1">
                          <h4 className="font-bold text-white">Profile Avatar</h4>
                          <p className="text-xs text-slate-500">Click to upload a custom avatar. Max 2MB.</p>
                       </div>
                       <Button variant="outline" size="sm">Change Photo</Button>
                    </div>
                 </div>
                 <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
                    <Button>Save Changes</Button>
                 </div>
              </Card>

              <Card className="p-8">
                 <h2 className="text-xl font-bold font-outfit text-white mb-8">Preparation Goals</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Intensity Level</label>
                       <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                          <option>Light (1-2 hrs/day)</option>
                          <option selected>Moderate (2-4 hrs/day)</option>
                          <option>Intense (4-6 hrs/day)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Timeline</label>
                       <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                          <option>3 Months</option>
                          <option selected>4 Months</option>
                          <option>6 Months</option>
                       </select>
                    </div>
                 </div>
              </Card>
           </div>
        )}

        {activeTab === 'subscription' && (
           <div className="space-y-8 animate-in slide-in-from-left-2 duration-500">
              <Card className="p-8 bg-indigo-600/10 border-indigo-500/30 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl -rotate-12 translate-x-4 -translate-y-4">⭐</div>
                 <div className="relative space-y-6">
                    <Badge variant="success">Current Plan: {user?.tier?.toUpperCase()}</Badge>
                    <h2 className="text-3xl font-bold text-white font-outfit">Unlock Elite Mentorship</h2>
                    <ul className="space-y-3">
                       <li className="flex items-center gap-3 text-slate-300">
                          <span className="text-indigo-400">✓</span> Unlimited AI Mock Interviews
                       </li>
                       <li className="flex items-center gap-3 text-slate-300">
                          <span className="text-indigo-400">✓</span> Advanced ATS Resume Scoring
                       </li>
                       <li className="flex items-center gap-3 text-slate-300">
                          <span className="text-indigo-400">✓</span> Personal Mentor Hot-path (24h response)
                       </li>
                    </ul>
                    <div className="pt-6">
                       {user?.tier === 'premium' ? (
                         <Button variant="outline">Manage Billing</Button>
                       ) : (
                         <Button size="lg" className="w-full sm:w-fit">Upgrade to Premium — $29/mo</Button>
                       )}
                    </div>
                 </div>
              </Card>
           </div>
        )}
      </div>
    </AppShell>
  );
}
