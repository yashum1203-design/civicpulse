import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Truck, 
  Check, 
  Cpu, 
  Radio, 
  Hospital, 
  GraduationCap, 
  Users, 
  Flame 
} from 'lucide-react';
import { CivicIssue } from '../../types';
import { getPriorityColor } from '../../utils/priority';
import { CATEGORY_METADATA } from '../../data/mockIssues';

interface IncidentDetailModalProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onDispatchCrew: (id: string) => void;
  onResolveIssue: (id: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  issue,
  onClose,
  onDispatchCrew,
  onResolveIssue
}) => {
  if (!issue) return null;

  const priorityTokens = getPriorityColor(issue.priority_score);
  const categoryMeta = CATEGORY_METADATA[issue.category];

  const hospBonus = issue.baseline_data.distance_to_nearest_hospital_meters <= 100
    ? 20
    : issue.baseline_data.distance_to_nearest_hospital_meters <= 300
    ? 10
    : 0;
  const schoolBonus = issue.baseline_data.distance_to_nearest_school_meters <= 100 ? 10 : 0;
  const densityBonus = issue.baseline_data.population_density_tier === 'high'
    ? 20
    : issue.baseline_data.population_density_tier === 'medium'
    ? 10
    : 0;
  const trafficBonus = issue.baseline_data.is_peak_traffic_zone ? 10 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel-elevated border border-blue-500/30 overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-300">
                  TICKET #{issue.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${priorityTokens.badge}`}>
                  Tier: {issue.severity_tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Category: {categoryMeta.label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title & Description */}
          <div>
            <h3 className="text-lg font-bold text-white">
              {issue.title}
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed font-mono text-xs bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              &quot;{issue.description}&quot;
            </p>
          </div>

          {/* Priority Score Mathematical Breakdown HUD */}
          <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-blue-400 uppercase font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                calculate_urgency_score Breakdown (0–100)
              </span>
              <span className="text-white font-bold text-sm">
                Score: {issue.priority_score} / 100
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Base Weight</span>
                <span className="text-sm font-bold text-amber-400">+{categoryMeta.baseWeight}</span>
                <span className="text-[10px] text-slate-500 block">/ 40 pts</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Hospital</span>
                <span className="text-sm font-bold text-red-400">+{hospBonus}</span>
                <span className="text-[10px] text-slate-500 block">{issue.baseline_data.distance_to_nearest_hospital_meters}m</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">School</span>
                <span className="text-sm font-bold text-amber-400">+{schoolBonus}</span>
                <span className="text-[10px] text-slate-500 block">{issue.baseline_data.distance_to_nearest_school_meters}m</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Density</span>
                <span className="text-sm font-bold text-blue-400">+{densityBonus}</span>
                <span className="text-[10px] text-slate-500 block">{issue.baseline_data.population_density_tier}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Peak Traffic</span>
                <span className="text-sm font-bold text-purple-400">+{trafficBonus}</span>
                <span className="text-[10px] text-slate-500 block">{issue.baseline_data.is_peak_traffic_zone ? 'Peak' : 'Off'}</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded-lg text-center">
              Score = {categoryMeta.baseWeight} + {hospBonus} + {schoolBonus} + {densityBonus} + {trafficBonus} = <strong className="text-white font-bold">{issue.priority_score} / 100</strong> &rarr; <span className="text-amber-400 font-bold">{issue.severity_tier}</span>
            </div>
          </div>

          {/* Location & Metadata Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">GPS LOCATION</span>
              <p className="text-white font-medium">{issue.locationName}</p>
              <p className="text-slate-400 text-[11px]">
                [{issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}]
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">ASSIGNED JURISDICTION</span>
              <p className="text-white font-medium">{issue.assignedDepartment}</p>
              <p className="text-emerald-400 text-[11px]">
                Status: {issue.status} {issue.dispatchedUnit ? `(${issue.dispatchedUnit})` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
          >
            Dismiss
          </button>

          <div className="flex items-center gap-2">
            {issue.status === 'Pending' && (
              <button
                onClick={() => {
                  onDispatchCrew(issue.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Dispatch Emergency Crew</span>
              </button>
            )}
            {issue.status === 'Dispatched' && (
              <button
                onClick={() => {
                  onResolveIssue(issue.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Work Complete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
