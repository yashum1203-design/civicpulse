import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Flame, 
  TrendingDown, 
  Activity, 
  Layers, 
  ShieldAlert, 
  Radio, 
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { CivicIssue } from '../../types';
import { GeospatialMap } from './GeospatialMap';
import { PriorityQueue } from './PriorityQueue';
import { IncidentDetailModal } from './IncidentDetailModal';

interface AdminDashboardProps {
  issues: CivicIssue[];
  onDispatchCrew: (id: string, unitName?: string) => void;
  onResolveIssue: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  issues,
  onDispatchCrew,
  onResolveIssue
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [inspectingIssue, setInspectingIssue] = useState<CivicIssue | null>(null);

  // Compute live KPI metrics dynamically from issues state
  const activeIssues = issues.filter((i) => i.status !== 'Resolved');
  const resolvedIssues = issues.filter((i) => i.status === 'Resolved');
  const criticalHazards = activeIssues.filter((i) => i.severity_tier === 'CRITICAL');
  const totalReportsMerged = issues.reduce((acc, i) => acc + i.impact_count, 0);

  // Calculations for KPI Cards
  const activeCount = activeIssues.length;
  const resolvedCount = resolvedIssues.length;
  const resolutionRate = issues.length > 0
    ? Math.round((resolvedCount / issues.length) * 100)
    : 0;

  const handleSelectIssue = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    setInspectingIssue(issue);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Dashboard Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-medium mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>MUNICIPAL OPERATIONS COMMAND DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
            Autonomous Triage &amp; Prioritization Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time geospatial clustering, NLP similarity deduplication, and priority queue dispatching.
          </p>
        </div>

        {/* Global Cluster Stats */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 block text-[10px]">TOTAL CITIZEN SIGNALS</span>
            <span className="text-white font-bold text-sm">+{totalReportsMerged} Reports Merged</span>
          </div>
        </div>
      </div>

      {/* TOP ROW: 4 HIGH-FIDELITY KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Active Complaints */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-blue-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Active Complaints
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white">
              {activeCount}
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              -12% today
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>DBSCAN Active Clusters</span>
            <span className="text-blue-400 font-semibold">4 Zones</span>
          </div>
        </div>

        {/* Card 2: Resolved Issues */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Resolved Issues
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white">
              {resolvedCount}
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {resolutionRate}% clearance
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Mean Time to Resolution</span>
            <span className="text-emerald-400 font-semibold">94.8% SLA</span>
          </div>
        </div>

        {/* Card 3: Avg Response Latency */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Avg Response Latency
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white">
              3.4<span className="text-sm font-normal text-slate-400 ml-1">hrs</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              -28 mins vs avg
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Automated AI Triage</span>
            <span className="text-amber-400 font-semibold">&lt; 2.5s</span>
          </div>
        </div>

        {/* Card 4: Glowing Radiant Red "Critical Unresolved Hazards" Alert Card */}
        <div className="relative rounded-2xl p-4 sm:p-5 glass-panel-elevated border-2 border-red-500/70 glow-red overflow-hidden transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-mono text-red-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400 animate-pulse" />
              Critical Hazards
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-display font-bold text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              {criticalHazards.length}
            </span>
            <span className="text-xs font-mono text-red-300 font-semibold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40">
              Immediate Dispatch
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-red-200/90 flex items-center justify-between relative z-10">
            <span>Threat Score ≥ 80 pts</span>
            <span className="text-red-300 font-bold">CRITICAL Tier</span>
          </div>
        </div>
      </div>

      {/* SPLIT SCREEN LAYOUT: GEOSPATIAL MAP (LEFT) & LIVE PRIORITY QUEUE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Geospatial Mapping Hub (7 cols) */}
        <div className="lg:col-span-7">
          <GeospatialMap
            issues={issues}
            selectedIssueId={selectedIssueId}
            onSelectIssue={handleSelectIssue}
          />
        </div>

        {/* Right: Live Priority Queue & Logs (5 cols) */}
        <div className="lg:col-span-5">
          <PriorityQueue
            issues={issues}
            selectedIssueId={selectedIssueId}
            onSelectIssue={handleSelectIssue}
            onDispatchCrew={onDispatchCrew}
            onResolveIssue={onResolveIssue}
          />
        </div>
      </div>

      {/* Detailed Incident Modal (opens when an issue is selected for in-depth inspection) */}
      <IncidentDetailModal
        issue={inspectingIssue}
        onClose={() => setInspectingIssue(null)}
        onDispatchCrew={onDispatchCrew}
        onResolveIssue={onResolveIssue}
      />
    </div>
  );
};
