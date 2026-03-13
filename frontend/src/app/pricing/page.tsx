'use client';

import Link from 'next/link';
import { Button, Card, Badge } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <Badge>Simple, Transparent Pricing</Badge>
          <h1 className="text-5xl md:text-7xl font-bold font-outfit text-white">Invest in Your <span className="text-gradient">Future</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Choose the plan that fits your career stage. All plans include access to our core multi-agent ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <PricingCard 
            tier="Free" 
            price="$0" 
            description="Perfect for casual preparation and getting started."
            features={[
              "1 AI Mock Interview / Week",
              "Access to Daily Task Engine",
              "Standard Roadmap Generation",
              "Community Dashboard Access",
              "Basic Skill Gap Analysis"
            ]}
            cta="Current Plan"
            isCurrent={user?.tier === 'free'}
          />

          {/* Premium Tier */}
          <PricingCard 
            tier="Premium" 
            price="$29" 
            period="/mo"
            description="The complete toolkit for serious job seekers."
            features={[
              "Unlimited AI Mock Interviews",
              "Deep-Dive ATS Resume Scoring",
              "Advanced Skill Radar Analytics",
              "Premium Accountability Nudges",
              "Priority Roadmap Adjustments",
              "Full Achievement System"
            ]}
            cta="Upgrade to Premium"
            isCurrent={user?.tier === 'premium'}
            featured
          />

          {/* Enterprise / VIP Tier */}
          <PricingCard 
            tier="VIP Mentorship" 
            price="$199" 
            period="/mo"
            description="Direct human oversight for elite executive roles."
            features={[
              "Everything in Premium",
              "1-on-1 Human Mentor Review",
              "Custom Concierge Support",
              "System Design Deep Dives",
              "Lifetime Access to Alumni Network"
            ]}
            cta="Join VIP Waitlist"
            isCurrent={false}
          />
        </div>

        <div className="max-w-3xl mx-auto pt-20">
          <Card className="p-12 text-center space-y-6 bg-indigo-600/5 border-indigo-500/20">
             <h3 className="text-2xl font-bold font-outfit text-white">Trusted by engineers at top-tier companies</h3>
             <div className="flex flex-wrap justify-center gap-8 opacity-40">
                <span className="font-bold text-xl">GOOGLE</span>
                <span className="font-bold text-xl">AMAZON</span>
                <span className="font-bold text-xl">META</span>
                <span className="font-bold text-xl">STRIPE</span>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ tier, price, period, description, features, cta, isCurrent, featured }: any) {
  return (
    <Card className={`p-8 flex flex-col h-full relative ${featured ? 'border-indigo-500 bg-indigo-600/5 scale-105 shadow-2xl shadow-indigo-500/20 z-10' : 'border-slate-800'}`}>
      {featured && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1 rounded-full">
          Most Popular
        </div>
      )}
      
      <div className="space-y-4 mb-8">
        <h3 className="text-xl font-bold text-white font-outfit">{tier}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold text-white font-outfit">{price}</span>
          {period && <span className="text-slate-500 font-medium">{period}</span>}
        </div>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <div className="flex-1 space-y-4 mb-10">
        {features.map((feature: string) => (
          <div key={feature} className="flex items-start gap-3">
             <span className="text-indigo-500 mt-1">✓</span>
             <span className="text-sm text-slate-300">{feature}</span>
          </div>
        ))}
      </div>

      <Button 
        variant={featured ? 'primary' : 'outline'} 
        className="w-full"
        disabled={isCurrent}
      >
        {isCurrent ? 'Current Plan' : cta}
      </Button>
    </Card>
  );
}
