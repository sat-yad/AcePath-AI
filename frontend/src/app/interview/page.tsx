'use client';

import { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/layout/app-shell';
import { Card, Badge, Button } from '@/components/ui';
import api from '@/lib/api';

export default function MockInterviewPage() {
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startInterview = async (type: string) => {
    try {
      const res = await api.post('/interview/start', { type });
      const data = res.data.data;
      setInterview(data);
      setMessages([{
        role: 'ai',
        content: data.interviewerIntro || "Welcome to your mock interview. Let's begin.",
        type: 'intro'
      }, {
        role: 'ai',
        content: data.questions[0].question,
        type: 'question'
      }]);
    } catch (err) {
      console.error('Failed to start interview', err);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isEvaluating) return;

    const currentAnswer = answer;
    setAnswer('');
    const userMsg = { role: 'user', content: currentAnswer };
    setMessages(prev => [...prev, userMsg]);
    setIsEvaluating(true);

    try {
      const isLast = currentQuestionIdx === interview.questions.length - 1;
      const res = await api.post(`/interview/${interview.interviewId}/answer`, {
        question: interview.questions[currentQuestionIdx].question,
        answer: currentAnswer,
        questionIndex: currentQuestionIdx,
        isLast
      });

      const { evaluation, finalResult: fr } = res.data.data;
      
      setMessages(prev => [...prev, {
        role: 'ai',
        content: evaluation.feedback,
        score: evaluation.score,
        type: 'feedback'
      }]);

      if (!isLast) {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: interview.questions[currentQuestionIdx + 1].question,
          type: 'question'
        }]);
        setCurrentQuestionIdx(prev => prev + 1);
      } else {
        setFinalResult(fr);
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── SESSION TYPE SELECTION ── */
  if (!interview) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] max-w-2xl mx-auto space-y-8 animate-fade-in-up">
          <div className="text-center space-y-3">
            <div className="text-5xl mb-4">🤖</div>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit text-white tracking-tight">Start a Mock Interview</h1>
            <p className="text-slate-500 text-sm font-medium max-w-md mx-auto leading-relaxed">
              Choose a focused session to test your knowledge. AI will evaluate your communication, depth, and correctness.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <InterviewTypeCard title="System Design" icon="🧱" desc="Architecture & Scalability" color="indigo" onClick={() => startInterview('system_design')} />
            <InterviewTypeCard title="DSA & Algorithms" icon="💻" desc="Data Structures & Coding" color="purple" onClick={() => startInterview('dsa')} />
            <InterviewTypeCard title="Behavioral (STAR)" icon="🤝" desc="Leadership & Teamwork" color="emerald" onClick={() => startInterview('behavioral')} />
            <InterviewTypeCard title="HR / Culture" icon="✨" desc="Values & Motivation" color="amber" onClick={() => startInterview('hr')} />
          </div>
        </div>
      </AppShell>
    );
  }

  /* ── FINAL RESULT ── */
  if (finalResult) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
          <Card className="p-10 md:p-14 text-center space-y-6 border-indigo-500/10" hoverable={false}>
            <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🏆</div>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit text-white tracking-tight">Session Complete!</h1>
            
            <div className="flex justify-center gap-12 py-6">
              {/* Score ring */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="rgb(30,41,59)" strokeWidth="6" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke="url(#scoreGrad)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(finalResult.overallScore / 100) * 251.3} 251.3`}
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-white font-outfit">{finalResult.overallScore}%</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Overall Score</div>
              </div>
              
              <div className="text-center flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-white uppercase tracking-wider font-outfit">{finalResult.readinessLevel.replace('_', ' ')}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mt-1">Readiness</div>
              </div>
            </div>
            
            <p className="text-slate-400 italic text-sm max-w-lg mx-auto leading-relaxed">&quot;{finalResult.overallComment}&quot;</p>
            
            <div className="flex gap-3 justify-center pt-6">
              <Button onClick={() => setInterview(null)} className="rounded-xl">Back to Hub</Button>
              <Button variant="outline" onClick={() => window.location.href='/analytics'} className="rounded-xl">Full Analysis</Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  /* ── CHAT INTERFACE ── */
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <Badge variant="info">Mock Interview: {interview?.type?.replace('_', ' ') || 'Session'}</Badge>
            <span className="text-xs text-slate-600 font-medium">
              Question {currentQuestionIdx + 1} of {interview?.questions?.length || 0}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setInterview(null)} className="text-slate-500 hover:text-red-400">
            End Session
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-5">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[80%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {m.role === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0 shadow-lg shadow-indigo-500/20">
                    🤖
                  </div>
                )}
                
                <div className={`p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : m.type === 'feedback' 
                      ? 'glass-card border-white/[0.06]'
                      : 'bg-slate-900/60 border border-white/[0.06] text-slate-200 backdrop-blur-sm'
                }`}>
                  {m.type === 'feedback' && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <Badge variant={m.score > 7 ? 'success' : 'warning'}>Score: {m.score}/10</Badge>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isEvaluating && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl px-5 py-3 backdrop-blur-sm">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="glass-card rounded-2xl p-4 border-white/[0.06]">
          <form onSubmit={submitAnswer} className="flex gap-3 items-end">
            <textarea 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(e as any); }}}
              placeholder="Type your answer here... (Shift+Enter for new line)"
              className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm focus:outline-none resize-none min-h-[44px] max-h-32 pt-2.5"
              rows={1}
            />
            <Button type="submit" disabled={!answer.trim() || isEvaluating} isLoading={isEvaluating} className="rounded-xl flex-shrink-0">
              Send
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function InterviewTypeCard({ title, icon, desc, color, onClick }: any) {
  const colorMap: Record<string, string> = {
    indigo: 'hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]',
    purple: 'hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]',
    emerald: 'hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]',
    amber: 'hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]',
  };
  const iconBg: Record<string, string> = {
    indigo: 'bg-indigo-500/10 border-indigo-500/15',
    purple: 'bg-purple-500/10 border-purple-500/15',
    emerald: 'bg-emerald-500/10 border-emerald-500/15',
    amber: 'bg-amber-500/10 border-amber-500/15',
  };

  return (
    <Card 
      className={`p-6 border-white/[0.05] ${colorMap[color]} group`} 
      hoverable={true}
    >
      <div onClick={onClick} className="cursor-pointer">
        <div className={`text-3xl w-14 h-14 ${iconBg[color]} border rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white font-outfit">{title}</h3>
        <p className="text-xs text-slate-600 font-medium mt-1">{desc}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.12em]">30-40 Mins</span>
          <span className="text-indigo-400 text-sm group-hover:translate-x-1 transition-transform duration-300">→</span>
        </div>
      </div>
    </Card>
  );
}
