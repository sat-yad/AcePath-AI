'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/app-shell';
import { Card, Badge, Button, Progress } from '@/components/ui';
import api from '@/lib/api';

export default function ResumeCoachPage() {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/resume/analyze', { resumeText });
      setAnalysis(res.data.data);
    } catch (err) {
      console.error('Failed to analyze resume', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <Badge variant="info">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5" />
              AI-Powered Analysis
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit text-white tracking-tight">Resume Coach</h1>
            <p className="text-slate-500 text-sm font-medium">Optimize your resume for ATS and maximum impact using the STAR method.</p>
          </div>
          {analysis && (
            <Button variant="outline" onClick={() => setAnalysis(null)} className="rounded-xl border-white/[0.06]">
              ← New Analysis
            </Button>
          )}
        </header>

        {!analysis ? (
          <div className="space-y-6">
            {/* Paste Area */}
            <Card className="p-8 space-y-4 border-white/[0.05]" hoverable={false}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Paste your current resume text</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em]">Plain text only</span>
              </div>
              <div className="relative group">
                <textarea 
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your professional experience, education, and skills here..."
                  className="w-full h-80 bg-slate-950/60 border border-white/[0.06] rounded-xl p-5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all font-mono text-sm leading-relaxed resize-none backdrop-blur-sm hover:border-white/[0.1]"
                />
                {/* Empty state hint */}
                {!resumeText && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-4xl mb-3 opacity-20">📄</div>
                    <div className="text-slate-700 text-sm font-medium">Drop your resume text here</div>
                  </div>
                )}
              </div>
            </Card>
            <div className="flex justify-end">
              <Button size="lg" disabled={!resumeText.trim() || isLoading} isLoading={isLoading} onClick={handleAnalyze} className="rounded-xl glow px-10">
                Analyze & Optimize →
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Left: Analysis */}
            <div className="space-y-6">
              {/* ATS Score Card */}
              <Card className="p-7 border-indigo-500/10" hoverable={false}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/[0.04] to-purple-600/[0.04] pointer-events-none rounded-2xl" />
                <div className="flex items-start justify-between mb-5 relative">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">ATS Readiness</div>
                    <div className="flex items-center gap-3">
                      {/* Score ring */}
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="rgb(30,41,59)" strokeWidth="4" />
                          <circle cx="32" cy="32" r="26" fill="none" stroke="url(#atsGrad)" strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${(analysis.atsScore / 100) * 163.4} 163.4`}
                          />
                          <defs>
                            <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-black text-white font-outfit">{analysis.atsScore}%</span>
                        </div>
                      </div>
                      <div className="text-slate-500 text-lg font-bold">→</div>
                      {/* Improved ring */}
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="rgb(30,41,59)" strokeWidth="4" />
                          <circle cx="32" cy="32" r="26" fill="none" stroke="url(#atsGradImproved)" strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${(analysis.improvedAtsScore / 100) * 163.4} 163.4`}
                          />
                          <defs>
                            <linearGradient id="atsGradImproved" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-black text-emerald-400 font-outfit">{analysis.improvedAtsScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="success">+{analysis.improvedAtsScore - analysis.atsScore}% improvement</Badge>
                </div>
                <p className="text-sm text-slate-400 italic leading-relaxed relative">&quot;{analysis.overallFeedback}&quot;</p>
              </Card>

              {/* Suggestions */}
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] px-1">Key Improvements</h3>
              <div className="space-y-4">
                {analysis.suggestions.map((s: any, idx: number) => (
                  <Card key={idx} className="p-5 space-y-3 border-white/[0.04] hover:border-white/[0.08]" hoverable={true}>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.category === 'impact' ? 'success' : 'info'}>{s.category}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.12em]">Original</div>
                      <p className="text-sm text-slate-500 line-through italic">{s.original}</p>
                      <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.12em] pt-1">Improved (STAR/XYZ)</div>
                      <p className="text-sm text-white font-medium leading-relaxed">{s.improved}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 pt-2 border-t border-white/[0.04] leading-relaxed">{s.explanation}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right: Optimized text */}
            <div className="space-y-4">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.12em] px-1">Optimized Version</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(analysis.improvedText)} className="text-slate-500 hover:text-white">
                    📋 Copy
                  </Button>
                </div>
                <Card className="p-6 border-white/[0.04]" hoverable={false}>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-3">
                    {analysis.improvedText}
                  </pre>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
