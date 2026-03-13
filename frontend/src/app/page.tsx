'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Badge, AnimatedCounter } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    engineersCoached: 10,
    questionsPracticed: 500,
    successRate: 80,
    averageRating: 4.5,
    totalVisits: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* ── Background orbs ── */}
      <div className="bg-orb bg-orb-indigo w-[600px] h-[600px] -top-40 -left-40 opacity-50" />
      <div className="bg-orb bg-orb-purple w-[500px] h-[500px] top-[60%] -right-40 opacity-40" />
      <div className="bg-orb bg-orb-pink w-[400px] h-[400px] top-[30%] left-[40%] opacity-20" />

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12 border-b border-white/[0.05] backdrop-blur-2xl bg-slate-950/60 sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-outfit">
            AcePath <span className="text-indigo-400">AI</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[13px] font-semibold text-slate-500">
          <Link href="#features" className="hover:text-white transition-colors duration-300 relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-px bg-indigo-500 transition-all duration-300" />
          </Link>
          <Link href="#methodology" className="hover:text-white transition-colors duration-300 relative group">
            Methodology
            <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-px bg-indigo-500 transition-all duration-300" />
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors duration-300 relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-px bg-indigo-500 transition-all duration-300" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Button as={Link} href="/dashboard" size="md" className="glow rounded-xl">Dashboard →</Button>
          ) : (
            <>
              <Link href="/login" className="text-[13px] font-semibold text-slate-500 hover:text-white transition-colors hidden sm:block">
                Log in
              </Link>
              <Button as={Link} href="/register" size="md" className="glow rounded-xl">Get Started</Button>
            </>
          )}
        </div>
      </nav>

      <main>
        {/* ══════════════════════════════════════════════
           HERO
           ══════════════════════════════════════════════ */}
        <section className="relative pt-28 pb-32 px-6 flex flex-col items-center overflow-hidden min-h-[92vh] justify-center text-center">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-indigo-600/[0.08] via-transparent to-transparent rounded-full" />
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 -z-10 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />

          <div className="max-w-5xl space-y-8 animate-fade-in-up">
            <Badge variant="info" className="mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 animate-pulse shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
              The Future of Career Coaching
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-outfit leading-[1.05] text-white tracking-tighter">
              Accelerate Your <br />
              <span className="text-gradient">Tech Evolution</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Autonomous AI agents that design your roadmap, conduct deep technical mock interviews, and refine your resume until you&apos;re unstoppable.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button as={Link} href="/register" size="lg" className="px-10 text-base h-14 rounded-2xl glow shadow-xl shadow-indigo-500/20">
                Begin Free Assessment
              </Button>
              <Button as={Link} href="#features" variant="outline" size="lg" className="px-10 text-base h-14 rounded-2xl border-white/10 hover:border-white/20">
                Explore Agents ↓
              </Button>
            </div>
            
            {/* Trusted by strip */}
            <div className="pt-20 overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10" />
              <div className="flex items-center gap-16 animate-marquee whitespace-nowrap">
                {['GOOGLE', 'META', 'STRIPE', 'OPENAI', 'NVIDIA', 'APPLE', 'AMAZON', 'GOOGLE', 'META', 'STRIPE', 'OPENAI', 'NVIDIA', 'APPLE', 'AMAZON'].map((company, i) => (
                  <div key={i} className="text-lg font-black tracking-[0.15em] text-slate-700 hover:text-slate-400 transition-colors cursor-default select-none flex-shrink-0">
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
           STATS STRIP
           ══════════════════════════════════════════════ */}
        <section className="py-16 px-6 border-y border-white/[0.04]">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value={stats.engineersCoached} suffix="+" label="Engineers Coached" />
            <StatItem value={stats.successRate} suffix="%" label="Success Rate" />
            <StatItem value={stats.questionsPracticed} suffix="+" label="Questions Practiced" />
            <StatItem value={stats.averageRating} suffix="/5" label="Average Rating" decimals={1} />
          </div>
        </section>

        {/* ══════════════════════════════════════════════
           FEATURES
           ══════════════════════════════════════════════ */}
        <section id="features" className="py-28 px-6 md:px-12 relative overflow-hidden">
          <div className="bg-orb bg-orb-purple w-[500px] h-[500px] top-0 right-0 opacity-30" />
          
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <div className="max-w-2xl space-y-4">
                <Badge variant="info">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
                  Specialized Intelligence
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black font-outfit text-white leading-tight tracking-tight">
                  Expert Agents for <br />Every Career Stage
                </h2>
              </div>
              <p className="text-slate-500 text-base max-w-sm font-medium leading-relaxed">
                Our multi-agent architecture provides specialized expertise in DSA, architecture, behavior, and strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                title="Roadmap Planner" 
                description="Synthesizes market data and your current skill profile to build a precise, evolving 24-week growth cycle."
                icon="🎯"
                color="indigo"
                gradient="from-indigo-500/15 to-transparent"
                href={user ? "/roadmap" : "/login"}
              />
              <FeatureCard 
                title="Mock Interviewer" 
                description="Realistic voice and chat simulations that probe your deep technical knowledge and behavioral traits."
                icon="🗣️"
                color="purple"
                gradient="from-purple-500/15 to-transparent"
                href={user ? "/interview" : "/login"}
              />
              <FeatureCard 
                title="Resume Architect" 
                description="AI-driven rewrite system that transforms your experience into high-conversion ATS-optimized descriptions."
                icon="💎"
                color="emerald"
                gradient="from-emerald-500/15 to-transparent"
                href={user ? "/resume" : "/login"}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
           METHODOLOGY
           ══════════════════════════════════════════════ */}
        <section id="methodology" className="py-28 px-6 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <Badge variant="info">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
                How It Works
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black font-outfit text-white tracking-tight">
                From Zero to <span className="text-gradient">L3 Mastery</span>
              </h2>
              <p className="text-slate-500 font-medium">
                A battle-tested methodology used by engineers who landed roles at top tech companies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StepCard 
                step="01" 
                title="Skill Assessment" 
                description="Our AI maps your current technical strengths and identifies precise knowledge gaps across DSA, system design, and behavioral skills."
                color="indigo"
              />
              <StepCard 
                step="02" 
                title="AI-Tailored Roadmap" 
                description="Receive a personalized 24-week growth plan that adapts weekly based on your performance, market trends, and target companies."
                color="purple"
              />
              <StepCard 
                step="03" 
                title="Deep-Practice Loop" 
                description="Daily mock interviews, resume iterations, and concept deep-dives create compound growth until you're genuinely unstoppable."
                color="emerald"
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
           CTA
           ══════════════════════════════════════════════ */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto relative">
            {/* Glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-2xl" />
            
            <Card className="p-0 border-white/[0.06] relative overflow-hidden rounded-3xl" hoverable={false}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 -z-0" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              
              <div className="p-12 md:p-20 text-center space-y-8 relative z-10">
                <h2 className="text-4xl md:text-6xl font-black font-outfit text-white leading-[1.1] tracking-tight">
                  Ready to land your <br />next <span className="text-gradient">L3 role?</span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                  Join 10+ engineers from top tech companies who use AcePath to sharpen their skills and grow their careers.
                </p>
                <div className="pt-4">
                  <Button as={Link} href="/register" size="lg" className="px-14 text-base h-16 rounded-2xl glow shadow-xl shadow-indigo-500/25">
                    Get Started Now →
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════
         FOOTER
         ══════════════════════════════════════════════ */}
      <footer className="py-16 px-6 border-t border-white/[0.05] bg-slate-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-500/20">
                A
              </div>
              <span className="text-lg font-bold text-white font-outfit tracking-tight">
                AcePath <span className="text-indigo-400">AI</span>
              </span>
            </div>
            <p className="text-slate-600 max-w-sm font-medium text-sm leading-relaxed">
              The world&apos;s first autonomous career growth platform for software engineers and technology leaders.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase text-[10px] tracking-[0.15em]">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
              <li><Link href="#features" className="hover:text-white transition-colors duration-300">Agents</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors duration-300">Pricing</Link></li>
              <li><Link href="/roadmap" className="hover:text-white transition-colors duration-300">Example Roadmaps</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase text-[10px] tracking-[0.15em]">Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
              <li><Link href="/terms" className="hover:text-white transition-colors duration-300">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors duration-300">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-10 mt-10 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-700 font-bold font-outfit uppercase tracking-[0.1em]">© 2026 ACEPATH LABS</div>
            {stats.totalVisits > 0 && (
              <div className="text-[10px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)] animate-fade-in">
                VISITOR #{stats.totalVisits.toLocaleString()}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <SocialIcon href="#">𝕏</SocialIcon>
            <SocialIcon href="#">in</SocialIcon>
            <SocialIcon href="#">GH</SocialIcon>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function StatItem({ value, suffix, label, decimals = 0 }: { value: number; suffix: string; label: string; decimals?: number }) {
  return (
    <div className="text-center space-y-1 group">
      <div className="text-3xl md:text-4xl font-black font-outfit text-white tracking-tight">
        <AnimatedCounter target={value} suffix={suffix} decimals={decimals} duration={2500} />
      </div>
      <div className="text-xs text-slate-600 font-bold uppercase tracking-[0.12em]">{label}</div>
    </div>
  );
}

function FeatureCard({ title, description, icon, color, gradient, href = '#' }: {
  title: string; description: string; icon: string; color: string; gradient: string; href?: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'group-hover:shadow-indigo-500/10 border-indigo-500/10',
    purple: 'group-hover:shadow-purple-500/10 border-purple-500/10',
    emerald: 'group-hover:shadow-emerald-500/10 border-emerald-500/10',
  };
  const iconBg: Record<string, string> = {
    indigo: 'bg-indigo-500/10 border-indigo-500/15',
    purple: 'bg-purple-500/10 border-purple-500/15',
    emerald: 'bg-emerald-500/10 border-emerald-500/15',
  };

  return (
    <Card className={`relative group p-8 border-white/[0.05] ${colorMap[color]}`} hoverable={true} glow>
      <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0 pointer-events-none`} />
      
      <div className="relative z-10 space-y-5">
        <div className={`text-4xl ${iconBg[color]} w-16 h-16 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-all duration-500 backdrop-blur-sm`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white font-outfit">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
        <Link href={href} className="pt-2 flex items-center gap-2 text-indigo-400 font-bold text-xs group-hover:gap-3 transition-all duration-300 uppercase tracking-[0.12em] w-fit">
          Learn More <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </Card>
  );
}

function StepCard({ step, title, description, color }: {
  step: string; title: string; description: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-500 border-indigo-500/20',
    purple: 'text-purple-500 border-purple-500/20',
    emerald: 'text-emerald-500 border-emerald-500/20',
  };

  return (
    <Card className="p-8 border-white/[0.05] group" hoverable={true}>
      <div className="space-y-5">
        <div className={`text-5xl font-black font-outfit ${colorMap[color]} opacity-30 group-hover:opacity-60 transition-opacity`}>
          {step}
        </div>
        <h3 className="text-xl font-bold text-white font-outfit">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
      </div>
    </Card>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-600 text-[10px] font-black hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300">
      {children}
    </a>
  );
}
