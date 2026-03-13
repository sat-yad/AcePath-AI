'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Badge } from '@/components/ui';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    experience_years: 0,
    current_company: '',
    target_companies: [] as string[],
    tech_stack: [] as string[],
    weak_areas: [] as string[],
    daily_hours: 2,
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await api.post('/onboarding', formData);
      await refreshUser();
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12">
           {[1, 2, 3, 4, 5].map((s) => (
             <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {s}
                </div>
                {s < 5 && <div className={`w-12 h-1 mx-2 rounded ${step > s ? 'bg-indigo-600' : 'bg-slate-800'}`} />}
             </div>
           ))}
        </div>

        {step === 1 && (
          <Card className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-bold text-white font-outfit mb-2">Professional Experience</h2>
            <p className="text-slate-400 mb-8">Tell us about your current status so we can calibrate your path.</p>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Years of Experience</label>
                <Input 
                  type="number" 
                  value={formData.experience_years}
                  onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Current Company / Institution (Optional)</label>
                <Input 
                  placeholder="e.g. Amazon, MIT, or 'Self-employed'"
                  value={formData.current_company}
                  onChange={(e) => setFormData({...formData, current_company: e.target.value})}
                />
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-bold text-white font-outfit mb-2">Target Goals</h2>
            <p className="text-slate-400 mb-8">Where do you want to work? We'll prioritize their interview style.</p>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Target Companies (Comma separated)</label>
                <Input 
                  placeholder="Google, Meta, OpenAI, Stripe..."
                  onChange={(e) => setFormData({...formData, target_companies: e.target.value.split(',').map(s => s.trim())})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Daily Preparation Budget (Hours)</label>
                <Input 
                  type="number" 
                  value={formData.daily_hours}
                  onChange={(e) => setFormData({...formData, daily_hours: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-bold text-white font-outfit mb-2">Tech Stack</h2>
            <p className="text-slate-400 mb-8">Select the technologies you'll use in interviews.</p>
            <div className="space-y-4">
              <Input 
                placeholder="Typescript, React, Node.js, Python, AWS..."
                onChange={(e) => setFormData({...formData, tech_stack: e.target.value.split(',').map(s => s.trim())})}
              />
              <div className="flex flex-wrap gap-2">
                 {formData.tech_stack.map(s => s && <Badge key={s} variant="info">{s}</Badge>)}
              </div>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-bold text-white font-outfit mb-2">Weakness Identification</h2>
            <p className="text-slate-400 mb-8">Be honest. We'll focus your initial roadmap on these areas.</p>
            <div className="space-y-4">
              <Input 
                placeholder="Dynamic Programming, System Design, Concurrency..."
                onChange={(e) => setFormData({...formData, weak_areas: e.target.value.split(',').map(s => s.trim())})}
              />
              <div className="flex flex-wrap gap-2">
                 {formData.weak_areas.map(s => s && <Badge key={s} variant="danger">{s}</Badge>)}
              </div>
            </div>
          </Card>
        )}

        {step === 5 && (
          <Card className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto animate-bounce">✨</div>
              <h2 className="text-3xl font-bold text-white font-outfit">Ready to Generate</h2>
              <p className="text-slate-400">Our Career Analyst and Roadmap agents are standing by to build your personalized 3-6 month path.</p>
              
              <div className="bg-slate-950 p-6 rounded-xl text-left space-y-2 border border-slate-800">
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Summary</div>
                 <div className="text-white font-medium">{formData.experience_years} Years Exp • {formData.target_companies.slice(0, 3).join(', ')}...</div>
                 <div className="text-slate-400 text-sm">{formData.tech_stack.slice(0, 5).join(', ')}</div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-between gap-4">
          <Button variant="ghost" onClick={prevStep} disabled={step === 1 || isLoading}>Back</Button>
          {step < 5 ? (
            <Button onClick={nextStep} className="px-10">Continue</Button>
          ) : (
            <Button onClick={handleComplete} className="px-10" isLoading={isLoading}>Generate My Roadmap</Button>
          )}
        </div>
      </div>
    </div>
  );
}
