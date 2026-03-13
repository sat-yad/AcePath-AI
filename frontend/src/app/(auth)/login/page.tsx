'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Input, Badge } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-slate-950">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-indigo w-[500px] h-[500px] -top-40 -left-40 opacity-60" />
      <div className="bg-orb bg-orb-purple w-[400px] h-[400px] -bottom-20 -right-20 opacity-40" />
      <div className="bg-orb bg-orb-pink w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15" />

      {/* Grid overlay */}
      <div className="fixed inset-0 -z-10 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              A
            </div>
            <span className="text-xl font-bold text-white font-outfit tracking-tight">
              AcePath <span className="text-indigo-400">AI</span>
            </span>
          </Link>
          <div className="space-y-1.5">
            <h2 className="text-3xl font-black text-white font-outfit tracking-tight">Welcome Back</h2>
            <p className="text-slate-600 text-sm font-medium">Continue your evolution to L6+ mastery</p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="p-8 border-white/[0.06] relative" hoverable={false}>
          {/* Gradient top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">Email Address</label>
              <Input 
                type="email" 
                placeholder="engineering@lead.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-400 hover:text-white transition-colors">
                  Recover
                </Link>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            {error && (
              <div className="animate-fade-in-up">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center text-sm text-red-400 font-medium">
                  {error}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 rounded-xl text-sm font-bold glow" isLoading={isLoading}>
              Sign In to Command Center
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/[0.05]" />
            </div>
            <span className="relative bg-[rgba(15,23,42,0.4)] px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700">
              Secure Access
            </span>
          </div>

          {/* Google SSO */}
          <div className="mt-6">
            <a href="http://localhost:4000/api/auth/google" className="block w-full">
              <Button type="button" variant="outline" className="w-full h-12 rounded-xl flex gap-3 text-slate-400 font-semibold border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </a>
          </div>
        </Card>

        <p className="text-center text-sm font-medium text-slate-600">
          New to AcePath?{' '}
          <Link href="/register" className="text-indigo-400 font-bold hover:text-white transition-colors">
            Initialize Account →
          </Link>
        </p>
      </div>
    </div>
  );
}
