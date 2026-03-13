'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsSent(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">A</div>
            <span className="text-2xl font-bold text-white font-outfit">AcePath <span className="text-indigo-500">AI</span></span>
          </Link>
          <h2 className="text-3xl font-bold text-white font-outfit">Reset Password</h2>
          <p className="text-slate-400 mt-2">Enter your email and we'll send you a recovery link</p>
        </div>

        <Card className="p-8">
          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="you@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Send Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4 animate-in zoom-in duration-500">
               <div className="text-5xl text-emerald-500">📧</div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold text-white">Check your email</h3>
                 <p className="text-sm text-slate-400">We've sent a password reset link to <br /><span className="text-white font-medium">{email}</span></p>
               </div>
               <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>Resend Link</Button>
            </div>
          )}
        </Card>

        <p className="text-center text-sm text-slate-500">
          Remember your password? <Link href="/login" className="text-indigo-400 font-medium hover:text-indigo-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
