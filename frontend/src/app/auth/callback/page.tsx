'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');

    const handleCallback = async () => {
      if (token && refresh) {
        // Save tokens using the keys auth-context expects
        localStorage.setItem('acepath_token', token);
        localStorage.setItem('acepath_refresh_token', refresh);
        
        // Fetch user data into context
        try {
          await refreshUser();
          router.push('/dashboard');
        } catch (err) {
          console.error('Failed to fetch user:', err);
          setError('Failed to load user profile. Please try logging in again.');
        }
      } else {
        setError('Authentication failed. Missing tokens.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-outfit text-white">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-indigo w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      
      <div className="text-center space-y-6 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] animate-bounce">
          <svg className="w-8 h-8 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <div>
          <h2 className="text-2xl font-black mb-2 tracking-tight text-gradient">Authenticating...</h2>
          <p className="text-slate-400 text-sm font-medium">Securing connection to Command Center</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm max-w-sm mt-4 backdrop-blur-sm mx-auto">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>}>
      <CallbackContent />
    </Suspense>
  );
}
