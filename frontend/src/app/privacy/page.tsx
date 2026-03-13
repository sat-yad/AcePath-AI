'use client';

import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-slate-500 hover:text-white transition-colors">
           <span>←</span> <span>Back to Home</span>
        </Link>
        
        <header className="space-y-4">
          <Badge>Data Ethics</Badge>
          <h1 className="text-5xl font-bold font-outfit text-white">Privacy Policy</h1>
          <p className="text-slate-500">Last Updated: March 03, 2026</p>
        </header>

        <Card className="p-12 prose prose-invert max-w-none bg-slate-900 border-slate-800">
          <div className="space-y-8 text-slate-300 leading-relaxed">
             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, including your name, email, professional experience, resumes, and interview responses. We also collect technical data like your IP address and usage patterns to maintain service security.</p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">2. How We Use Your Data</h2>
                <p>Your data is used to calibrate our AI agents, generate personalized roadmaps, and provide feedback on your interviews. We use anonymized data to improve our machine learning models.</p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">3. AI Processing</h2>
                <p>We use third-party AI providers (OpenAI) to process some of your data. These providers are strictly bound by confidentiality agreements and are prohibited from using your data to train their general models without your explicit consent.</p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">4. Data Security</h2>
                <p>All sensitive information, including resumes and profile data, is encrypted at rest and in transit. We use industry-standard security protocols to prevent unauthorized access.</p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">5. Your Rights</h2>
                <p>You have the right to access, export, or delete your personal data at any time. You can initiate these requests through your Settings page or by contacting our support team.</p>
             </section>
          </div>
        </Card>

        <footer className="text-center pt-12">
           <p className="text-slate-500 text-sm">Concerned about your privacy? Contact our DPO at privacy@acepath.ai</p>
        </footer>
      </div>
    </div>
  );
}
