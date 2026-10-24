import { DispatchTier } from '../types';
import { getSeverityTier } from './civicPulseAlgorithms';

export function getPriorityColor(priorityScore: number): {
  color: string;
  bg: string;
  border: string;
  badge: string;
  glow: string;
  label: DispatchTier;
} {
  const tier = getSeverityTier(priorityScore);
  switch (tier) {
    case 'CRITICAL':
      return {
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/40',
        badge: 'bg-red-500/20 text-red-300 border-red-500/50',
        glow: 'shadow-[0_0_18px_rgba(239,68,68,0.45)]',
        label: 'CRITICAL'
      };
    case 'HIGH':
      return {
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/40',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
        label: 'HIGH'
      };
    case 'ROUTINE':
    default:
      return {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        label: 'ROUTINE'
      };
  }
}
