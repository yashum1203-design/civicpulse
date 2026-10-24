import React from 'react';
import { motion } from 'motion/react';
import { DispatchTier } from '../../types';

interface UrgencyGaugeProps {
  score: number; // 0 to 100
  tier: DispatchTier;
  size?: number;
}

export const UrgencyGauge: React.FC<UrgencyGaugeProps> = ({
  score,
  tier,
  size = 180
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle (180 deg)
  const clampedScore = Math.min(100, Math.max(0, score));
  const progressOffset = circumference - (clampedScore / 100) * circumference;

  const color =
    tier === 'CRITICAL'
      ? '#EF4444'
      : tier === 'HIGH'
      ? '#F59E0B'
      : '#10B981';

  const glowColor =
    tier === 'CRITICAL'
      ? 'rgba(239, 68, 68, 0.4)'
      : tier === 'HIGH'
      ? 'rgba(245, 158, 11, 0.35)'
      : 'rgba(16, 185, 129, 0.3)';

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size * 0.65 }}>
      <svg
        width={size}
        height={size * 0.65}
        viewBox={`0 0 ${size} ${size * 0.65}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="85%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Track Arc */}
        <path
          d={`M ${strokeWidth / 2} ${size * 0.58} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size * 0.58}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Animated Progress Arc */}
        <motion.path
          d={`M ${strokeWidth / 2} ${size * 0.58} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size * 0.58}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          filter="url(#gaugeGlow)"
        />
      </svg>

      {/* Center Value Content */}
      <div className="absolute bottom-1 flex flex-col items-center">
        <motion.div
          key={score}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="flex items-baseline gap-1"
        >
          <span
            className="text-4xl font-display font-bold tracking-tight text-white drop-shadow-md"
            style={{ textShadow: `0 0 16px ${glowColor}` }}
          >
            {score}
          </span>
          <span className="text-xs font-mono text-slate-400 font-semibold">/100</span>
        </motion.div>

        <span
          className={`mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
            tier === 'CRITICAL'
              ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse'
              : tier === 'HIGH'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {tier} TIER
        </span>
      </div>
    </div>
  );
};
