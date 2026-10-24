import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Users, 
  Search, 
  Check, 
  Flame,
  Hospital,
  GraduationCap
} from 'lucide-react';
import { CivicIssue, CivicCategory, IssueStatus } from '../../types';
import { getPriorityColor } from '../../utils/priority';
import { CATEGORY_METADATA } from '../../data/mockIssues';
import { DispatchTelemetryModal } from './DispatchTelemetryModal';
import { soundFx } from '../../utils/soundEffects';

interface PriorityQueueProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: CivicIssue) => void;
  onDispatchCrew: (issueId: string, unitName?: string) => void;
  onResolveIssue: (issueId: string) => void;
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  onDispatchCrew,
  onResolveIssue
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | IssueStatus>('All');
  const [telemetryIssue, setTelemetryIssue] = useState<CivicIssue | null>(null);

  // Filter and sort by Urgency Score descending (exact Python backend formula output)
  const sortedAndFiltered = issues
    .filter((issue) => {
      if (statusFilter !== 'All' && issue.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        issue.title.toLowerCase().includes(term) ||
        issue.locationName.toLowerCase().includes(term) ||
        issue.category.toLowerCase().includes(term) ||
        issue.id.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => b.priority_score - a.priority_score);

  const handleDispatchClick = (e: React.MouseEvent, issue: CivicIssue) => {
    e.stopPropagation();
    soundFx.playClick();
    setTelemetryIssue(issue);
  };

  const handleResolveClick = (e: React.MouseEvent, issueId: string) => {
    e.stopPropagation();
    soundFx.playSuccess();
    onResolveIssue(issueId);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[650px] overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-white">
                Live Priority Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                Formula: Base + Hospital + School + Density + Traffic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Auto-ranked by calculate_urgency_score (0–100)
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
            {sortedAndFiltered.length} Active Tickets
          </span>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ticket ID, category, or road..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(['All', 'Pending', 'Dispatched', 'Resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Cards Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sortedAndFiltered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
            <CheckCircle className="w-8 h-8 text-slate-600" />
            <p className="text-xs font-mono">No incident nodes match current filter.</p>
          </div>
        ) : (
          sortedAndFiltered.map((issue) => {
            const isSelected = issue.id === selectedIssueId;
            const priorityTokens = getPriorityColor(issue.priority_score);
            const isCritical = issue.severity_tier === 'CRITICAL';
            const categoryMeta = CATEGORY_METADATA[issue.category];

            // GIS bonuses:
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
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className={`p-4 rounded-xl transition-all duration-300 cursor-pointer border relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-900/90 border-blue-500 shadow-lg shadow-blue-500/20 translate-y-[-2px]'
                    : isCritical && issue.status === 'Pending'
                    ? 'bg-slate-950/90 border-red-500/40 hover:border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:translate-y-[-2px]'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50 hover:translate-y-[-2px]'
                }`}
              >
                {/* Critical Glow Edge */}
                {isCritical && issue.status === 'Pending' && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 animate-pulse" />
                )}

                {/* Card Top Row: Node ID, Status & Priority Score Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {issue.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {categoryMeta.shortLabel}
                    </span>
                    {issue.status === 'Dispatched' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>DISPATCHED</span>
                      </span>
                    )}
                    {issue.status === 'Resolved' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>RESOLVED</span>
                      </span>
                    )}
                  </div>

                  {/* Priority Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 uppercase ${priorityTokens.badge}`}
                    >
                      {isCritical && <Flame className="w-3.5 h-3.5 text-red-400" />}
                      <span>{issue.severity_tier}: {issue.priority_score}/100</span>
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                  {issue.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed font-mono text-[11px]">
                  &quot;{issue.description}&quot;
                </p>

                {/* Location & Time */}
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 truncate max-w-[220px]">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{issue.locationName}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{issue.timestamp}</span>
                  </span>
                  <span className="flex items-center gap-1 text-purple-300">
                    <Users className="w-3 h-3 shrink-0" />
                    <span>+{issue.impact_count} Reports Merged</span>
                  </span>
                </div>

                {/* Formula Breakdown Tags */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-mono flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300" title={`Category weight: ${categoryMeta.baseWeight}`}>
                      Base: <strong className="text-amber-400">+{categoryMeta.baseWeight}</strong>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300" title={`Hospital distance ${issue.baseline_data.distance_to_nearest_hospital_meters}m`}>
                      Hosp: <strong className="text-red-400">+{hospBonus}</strong>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300" title={`School distance ${issue.baseline_data.distance_to_nearest_school_meters}m`}>
                      School: <strong className="text-amber-400">+{schoolBonus}</strong>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300" title={`Density tier ${issue.baseline_data.population_density_tier}`}>
                      Density: <strong className="text-blue-400">+{densityBonus}</strong>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300" title={`Peak traffic`}>
                      Traffic: <strong className="text-purple-400">+{trafficBonus}</strong>
                    </span>
                  </div>

                  {/* Actions: Dispatch / Resolve */}
                  <div className="flex items-center gap-2">
                    {issue.status === 'Pending' ? (
                      <button
                        onClick={(e) => handleDispatchClick(e, issue)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Field Crew</span>
                      </button>
                    ) : issue.status === 'Dispatched' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-blue-300 hidden sm:inline">
                          {issue.dispatchedUnit || 'Crew En Route'}
                        </span>
                        <button
                          onClick={(e) => handleResolveClick(e, issue.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Resolved</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Work Order Closed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* High-Fidelity Animated Dispatch Telemetry Modal */}
      <DispatchTelemetryModal
        issue={telemetryIssue}
        isOpen={!!telemetryIssue}
        onClose={() => setTelemetryIssue(null)}
        onConfirmDispatch={(issueId, unitName) => {
          onDispatchCrew(issueId, unitName);
        }}
      />
    </div>
  );
};
