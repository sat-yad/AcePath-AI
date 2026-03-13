'use client';

import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui';

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-slate-500 hover:text-white transition-colors">
           <span>←</span> <span>Back to Home</span>
        </Link>
        
        <header className="space-y-4">
          <Badge>Legal Infrastructure</Badge>
          <h1 className="text-5xl font-bold font-outfit text-white">Terms of Service</h1>
          <p className="text-slate-500">Last Updated: March 03, 2026</p>
        </header>

        <Card className="p-12 prose prose-invert max-w-none bg-slate-900 border-slate-800">
          <div className="space-y-8 text-slate-300 leading-relaxed">
             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">1. Acceptance of Terms</h2>
                <p>By accessing and using AcePath AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">2. AI Coaching Disclaimer</h2>
                <p>AcePath AI uses advanced multi-agent AI systems to provide career advice and preparation material. While we strive for accuracy, our AI-generated content is for informational purposes only. We do not guarantee job placements or success in actual interviews.</p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">3. Subscription & Billing</h2>
                <p>Premium features are available via monthly or annual subscriptions. Payments are processed through Stripe. You can cancel your subscription at any time via the Settings page, and you will retain access until the end of the billing period.</p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">4. User Content</h2>
                <p>You retain ownership of the data you provide (resumes, interview answers). By using the service, you grant AcePath AI a limited license to process this data solely to provide and improve our coaching services.</p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-outfit">5. Ethical Use</h2>
                <p>You agree not to use AcePath AI to generate deceptive content, automate prohibited activities on third-party platforms, or scrape our proprietary AI logic.</p>
             </section>
          </div>
        </Card>

        <footer className="text-center pt-12">
           <p className="text-slate-500 text-sm">Have questions about our terms? Contact us at legal@acepath.ai</p>
        </footer>
      </div>
    </div>
  );
}
