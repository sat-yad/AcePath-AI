'use client';

import React, { useRef, useCallback, useState } from 'react';

/* ══════════════════════════════════════════════════
   BUTTON — 3D Neon
   ══════════════════════════════════════════════════ */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  as?: React.ElementType;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md',
  isLoading = false, className = '', disabled, as: Component = 'button', href, ...props
}) => {
  const base = `
    inline-flex items-center justify-center rounded-xl font-bold
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#02030f]
    disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.96] select-none relative overflow-hidden cursor-pointer
  `;

  const variants = {
    primary: `
      text-white focus:ring-indigo-500
      shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.3)]
      hover:shadow-[0_0_35px_rgba(99,102,241,0.5),0_0_60px_rgba(99,102,241,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]
      hover:-translate-y-0.5
    `,
    secondary: `
      text-white border focus:ring-slate-500
      hover:-translate-y-0.5
    `,
    outline: `
      border text-slate-300 bg-transparent focus:ring-slate-500
      hover:text-white hover:-translate-y-0.5
    `,
    ghost: `
      text-slate-400 bg-transparent focus:ring-slate-600
      hover:text-white hover:bg-white/[0.05]
    `,
    danger: `
      text-white focus:ring-red-500
      shadow-[0_0_20px_rgba(239,68,68,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
      hover:shadow-[0_0_35px_rgba(239,68,68,0.5)]
      hover:-translate-y-0.5
    `,
    glow: `
      text-white focus:ring-purple-500
      hover:-translate-y-0.5
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs gap-1.5 tracking-wide',
    md: 'px-6 py-2.5 text-sm gap-2 tracking-wide',
    lg: 'px-8 py-3.5 text-sm gap-2.5 tracking-wider',
  };

  const variantStyles: React.CSSProperties =
    variant === 'primary' ? { background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #4f46e5 100%)', backgroundSize: '200% 200%' } :
    variant === 'danger'  ? { background: 'linear-gradient(135deg, #dc2626, #ef4444)' } :
    variant === 'glow'    ? { background: 'linear-gradient(135deg, #7c3aed, #8b5cf6, #6d28d9)', boxShadow: '0 0 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' } :
    variant === 'secondary' ? { background: 'rgba(30,35,60,0.8)', borderColor: 'rgba(255,255,255,0.1)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 15px rgba(0,0,0,0.3)' } :
    variant === 'outline' ? { borderColor: 'rgba(255,255,255,0.1)' } : {};

  return (
    <Component
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={variantStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shimmer sweep */}
      <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      </span>
      {/* Top highlight */}
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

      {isLoading && (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      <span className="relative z-10 flex items-center gap-inherit">{children}</span>
    </Component>
  );
};

/* ══════════════════════════════════════════════════
   CARD — 3D Tilt Glass
   ══════════════════════════════════════════════════ */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
  glowColor?: string;
  neon?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children, className = '', hoverable = true, glow = false, glowColor = 'indigo', neon = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverable || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px) scale(1.01)`;
    // Dynamic gradient based on mouse position
    const gradX = ((e.clientX - rect.left) / rect.width) * 100;
    const gradY = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--mouse-x', `${gradX}%`);
    cardRef.current.style.setProperty('--mouse-y', `${gradY}%`);
  }, [hoverable]);

  const handleMouseLeave = useCallback(() => {
    if (!hoverable || !cardRef.current) return;
    setIsHovered(false);
    cardRef.current.style.transform = '';
    cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease';
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = '';
      }
    }, 500);
  }, [hoverable]);

  const glowColors: Record<string, string> = {
    indigo:  '99,102,241',
    purple:  '168,85,247',
    emerald: '16,185,129',
    cyan:    '6,182,212',
    amber:   '245,158,11',
    rose:    '244,63,94',
  };
  const rgb = glowColors[glowColor] || glowColors.indigo;

  return (
    <div
      ref={cardRef}
      onMouseMove={hoverable ? handleMouseMove : undefined}
      onMouseEnter={hoverable ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverable ? handleMouseLeave : undefined}
      className={`glass-card rounded-2xl overflow-hidden relative ${className}`}
      style={{
        transition: 'transform 0.08s ease, box-shadow 0.3s ease, background 0.3s ease',
        boxShadow: isHovered
          ? `0 30px 80px -20px rgba(0,0,0,0.8), 0 0 40px rgba(${rgb},0.12), inset 0 1px 0 rgba(255,255,255,0.08)`
          : glow
          ? `0 0 30px rgba(${rgb},0.2), 0 20px 60px rgba(0,0,0,0.5)`
          : undefined,
      }}
    >
      {/* Mouse-tracking spotlight */}
      {hoverable && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(circle 150px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${rgb},0.06) 0%, transparent 100%)`,
          }}
        />
      )}
      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {/* Neon top edge */}
      {neon && (
        <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, rgba(${rgb},0.8), transparent)` }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   INPUT — Neon focus ring
   ══════════════════════════════════════════════════ */
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <div className="relative group">
    <input
      className={`
        rounded-xl px-4 py-3 text-white
        placeholder-slate-600 text-sm font-medium
        focus:outline-none w-full
        transition-all duration-300
        ${className}
      `}
      style={{
        background: 'rgba(8,12,30,0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
      onFocus={e => {
        e.target.style.borderColor = 'rgba(99,102,241,0.6)';
        e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1), 0 0 20px rgba(99,102,241,0.1), inset 0 0 20px rgba(99,102,241,0.03)';
        e.target.style.background = 'rgba(12,16,40,0.9)';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
        e.target.style.boxShadow = 'none';
        e.target.style.background = 'rgba(8,12,30,0.7)';
      }}
      {...props}
    />
    {/* Bottom glow line on focus */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-focus-within:w-4/5 h-px transition-all duration-500"
      style={{ background: 'linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)' }}
    />
  </div>
);

/* ══════════════════════════════════════════════════
   BADGE — Neon pill
   ══════════════════════════════════════════════════ */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    success: { background: 'rgba(16,185,129,0.1)',  color: '#34d399', border: '1px solid rgba(16,185,129,0.25)',  boxShadow: '0 0 10px rgba(16,185,129,0.15)' },
    warning: { background: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)',  boxShadow: '0 0 10px rgba(245,158,11,0.15)' },
    info:    { background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)',   boxShadow: '0 0 10px rgba(99,102,241,0.15)' },
    danger:  { background: 'rgba(239,68,68,0.1)',   color: '#f87171', border: '1px solid rgba(239,68,68,0.25)',  boxShadow: '0 0 10px rgba(239,68,68,0.15)' },
    purple:  { background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)',  boxShadow: '0 0 10px rgba(168,85,247,0.15)' },
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm ${className}`}
      style={styles[variant]}
    >
      <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'currentColor', boxShadow: '0 0 4px currentColor' }} />
      {children}
    </span>
  );
};

/* ══════════════════════════════════════════════════
   PROGRESS — Neon shimmer bar
   ══════════════════════════════════════════════════ */
interface ProgressProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose';
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value, size = 'md', color = 'indigo', showLabel = false
}) => {
  const gradients: Record<string, string> = {
    indigo:  'linear-gradient(90deg, #4f46e5, #6366f1, #818cf8)',
    emerald: 'linear-gradient(90deg, #059669, #10b981, #34d399)',
    amber:   'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)',
    cyan:    'linear-gradient(90deg, #0891b2, #06b6d4, #22d3ee)',
    rose:    'linear-gradient(90deg, #e11d48, #f43f5e, #fb7185)',
  };
  const glows: Record<string, string> = {
    indigo:  'rgba(99,102,241,0.6)',
    emerald: 'rgba(16,185,129,0.6)',
    amber:   'rgba(245,158,11,0.6)',
    cyan:    'rgba(6,182,212,0.6)',
    rose:    'rgba(244,63,94,0.6)',
  };
  const h = size === 'sm' ? '2px' : size === 'lg' ? '6px' : '4px';

  return (
    <div className="relative" style={{ height: h, background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
      <div
        className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: gradients[color],
          boxShadow: `0 0 10px ${glows[color]}`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          style={{ animation: 'shimmer-sweep 2s infinite' }}
        />
        {/* Leading edge glow */}
        <div className="absolute right-0 top-0 bottom-0 w-4"
          style={{ background: `radial-gradient(ellipse at right, ${glows[color]}, transparent)` }}
        />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   SKELETON — Shimmer placeholder
   ══════════════════════════════════════════════════ */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden rounded-xl ${className}`}
    style={{ background: 'rgba(255,255,255,0.04)' }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
      style={{ animation: 'shimmer-sweep 1.8s infinite' }}
    />
  </div>
);

/* ══════════════════════════════════════════════════
   MODAL — 3D Glass overlay
   ══════════════════════════════════════════════════ */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-xl animate-fade-in"
        style={{ background: 'rgba(2,3,15,0.75)' }}
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg animate-fade-in-up glass-card rounded-2xl"
        style={{ boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(99,102,241,0.1)' }}
      >
        {/* Neon top edge */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(168,85,247,0.8), transparent)' }}
        />
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white font-outfit">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all duration-200 hover:rotate-90"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   ANIMATED COUNTER
   ══════════════════════════════════════════════════ */
interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target, duration = 2000, suffix = '', prefix = '', decimals = 0,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const startCount = useCallback(() => {
    if (hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    const startTime = performance.now();
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      if (ref.current) ref.current.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [target, duration, suffix, prefix, decimals]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startCount(); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startCount]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
};

/* ══════════════════════════════════════════════════
   STAT CARD — 3D neon metric card
   ══════════════════════════════════════════════════ */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  color?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, icon, change, changeType = 'neutral', color = 'indigo'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState(false);

  const rgbs: Record<string, string> = {
    indigo: '99,102,241', emerald: '16,185,129', amber: '245,158,11',
    cyan: '6,182,212', rose: '244,63,94', purple: '168,85,247',
  };
  const rgb = rgbs[color];

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cardRef.current.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
  };

  const handleLeave = () => {
    setHov(false);
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
    cardRef.current.style.transform = '';
    setTimeout(() => { if (cardRef.current) cardRef.current.style.transition = ''; }, 400);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={handleLeave}
      className="relative rounded-2xl overflow-hidden cursor-default"
      style={{
        background: 'rgba(8,12,30,0.7)',
        border: hov ? `1px solid rgba(${rgb},0.35)` : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        boxShadow: hov
          ? `0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(${rgb},0.12), inset 0 1px 0 rgba(255,255,255,0.08)`
          : '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'transform 0.08s ease, box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Neon top bar */}
      <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${rgb},0.9), transparent)`, opacity: hov ? 1 : 0.4, transition: 'opacity 0.3s' }}
      />
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, rgba(${rgb},0.08), transparent 70%)` }}
      />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: `rgba(${rgb},0.12)`,
                border: `1px solid rgba(${rgb},0.2)`,
                boxShadow: `0 0 15px rgba(${rgb},0.1)`,
              }}
            >
              {icon}
            </div>
          )}
          {change && (
            <span className="text-xs font-bold px-2 py-1 rounded-lg"
              style={{
                background: changeType === 'up' ? 'rgba(16,185,129,0.12)' : changeType === 'down' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
                color: changeType === 'up' ? '#34d399' : changeType === 'down' ? '#f87171' : '#94a3b8',
                border: `1px solid ${changeType === 'up' ? 'rgba(16,185,129,0.2)' : changeType === 'down' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '→'} {change}
            </span>
          )}
        </div>
        <div className="text-3xl font-black text-white font-outfit mb-1"
          style={{ textShadow: `0 0 20px rgba(${rgb},0.3)` }}
        >
          {value}
        </div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
      </div>
    </div>
  );
};
