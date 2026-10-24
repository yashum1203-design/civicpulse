import React, { useState, useMemo } from 'react';
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Compass, 
  MapPin, 
  Crosshair, 
  AlertTriangle,
  Radio
} from 'lucide-react';
import { CivicIssue, CivicCategory } from '../../types';
import { getPriorityColor } from '../../utils/priority';
import { CATEGORY_METADATA } from '../../data/mockIssues';

interface GeospatialMapProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: CivicIssue) => void;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedFilter, setSelectedFilter] = useState<'all' | CivicCategory>('all');
  const [showDensityHeatmap, setShowDensityHeatmap] = useState<boolean>(true);

  // Dynamic geographic bounding box adapting to user GPS surroundings
  const bounds = useMemo(() => {
    if (issues.length === 0) {
      return { minLat: 12.9000, maxLat: 13.0600, minLng: 77.4900, maxLng: 77.6700 };
    }
    const lats = issues.map((i) => i.latitude);
    const lngs = issues.map((i) => i.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const padLat = Math.max(0.003, (maxLat - minLat) * 0.2 || 0.006);
    const padLng = Math.max(0.003, (maxLng - minLng) * 0.2 || 0.006);

    return {
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
      minLng: minLng - padLng,
      maxLng: maxLng + padLng
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (selectedFilter === 'all') return true;
      return issue.category === selectedFilter;
    });
  }, [issues, selectedFilter]);

  // Convert lat/lng to map percentage coordinates
  const getPositionPercent = (lat: number, lng: number) => {
    const spanLng = bounds.maxLng - bounds.minLng || 0.01;
    const spanLat = bounds.maxLat - bounds.minLat || 0.01;
    const x = ((lng - bounds.minLng) / spanLng) * 100;
    const y = ((bounds.maxLat - lat) / spanLat) * 100;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[650px] relative select-none">
      {/* Map Header Controls */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>GEO-RADAR: EPSG:4326</span>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Active Pins: <strong className="text-white">{filteredIssues.length}</strong>
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            All Categories
          </button>
          {(['open_drainage', 'road_damage', 'street_light_malfunction', 'waste_management'] as CivicCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === cat
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800'
              }`}
            >
              {CATEGORY_METADATA[cat].shortLabel}
            </button>
          ))}
        </div>

        {/* Zoom & Layer Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowDensityHeatmap(!showDensityHeatmap)}
            title="Toggle Density Heatmap Layer"
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
              showDensityHeatmap
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden md:inline">Heatmap</span>
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(1.8, prev + 0.2))}
            aria-label="Zoom In"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.2))}
            aria-label="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cyberpunk Map Vector Canvas Surface */}
      <div className="flex-1 relative bg-[#090D16] overflow-hidden cyber-grid-bg cursor-grab active:cursor-grabbing">
        {/* Transformable container responding to zoom */}
        <div
          className="w-full h-full relative transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Stylized Vector Urban Road Network SVG with numerical viewBox */}
          <svg
            className="absolute inset-0 w-full h-full opacity-45 pointer-events-none"
            viewBox="0 0 1000 700"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Major Arterial Ring Roads & Expressways */}
            <path
              d="M 150 150 Q 500 80, 850 180 T 900 600 Q 500 680, 100 550 Z"
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="3"
              strokeDasharray="8,4"
              opacity="0.6"
            />
            {/* Peenya to City Center Express Highway */}
            <line x1="280" y1="180" x2="600" y2="480" stroke="#3B82F6" strokeWidth="3" opacity="0.8" />
            <line x1="100" y1="350" x2="900" y2="350" stroke="#3B82F6" strokeWidth="2" opacity="0.6" />
            <line x1="600" y1="50" x2="600" y2="650" stroke="#3B82F6" strokeWidth="2" opacity="0.6" />
            <line x1="750" y1="100" x2="750" y2="650" stroke="#10B981" strokeWidth="1.5" opacity="0.5" />

            {/* Grid street matrix */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={90 + i * 70}
                x2="1000"
                y2={90 + i * 70}
                stroke="#1E293B"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={100 + i * 90}
                y1="0"
                x2={100 + i * 90}
                y2="700"
                stroke="#1E293B"
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* Density Heatmap Glow Blobs */}
          {showDensityHeatmap && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[28%] left-[32%] w-56 h-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/15 blur-3xl animate-pulse" />
              <div className="absolute top-[68%] left-[22%] w-52 h-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/20 blur-3xl" />
              <div className="absolute top-[48%] left-[62%] w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/15 blur-2xl" />
            </div>
          )}

          {/* Selected Issue Radar Focus Rings */}
          {selectedIssue && (() => {
            const pos = getPositionPercent(selectedIssue.latitude, selectedIssue.longitude);
            return (
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="w-24 h-24 rounded-full border border-blue-400/50 animate-ping" />
                <div className="absolute inset-0 w-36 h-36 -translate-x-6 -translate-y-6 rounded-full border border-dashed border-blue-400/30 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
            );
          })()}

          {/* Interactive Pins on Map */}
          {filteredIssues.map((issue) => {
            const pos = getPositionPercent(issue.latitude, issue.longitude);
            const isSelected = issue.id === selectedIssueId;
            const priorityTokens = getPriorityColor(issue.priority_score);
            const isCritical = issue.severity_tier === 'CRITICAL';
            const isResolved = issue.status === 'Resolved';

            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 group z-20 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {/* Hotspot Outer Pulsing Ring for Critical Tier */}
                {!isResolved && isCritical && (
                  <span className="absolute -inset-2.5 rounded-full bg-red-500/35 animate-ping pointer-events-none" />
                )}

                {/* Hotspot Pin Body */}
                <div
                  className={`relative flex flex-col items-center p-1 rounded-xl transition-all shadow-xl backdrop-blur-md ${
                    isSelected
                      ? 'bg-slate-900 border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.8)]'
                      : isCritical
                      ? 'bg-slate-950/90 border border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : isResolved
                      ? 'bg-slate-950/70 border border-emerald-500/50 opacity-70'
                      : 'bg-slate-950/90 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  }`}
                >
                  <div className="flex items-center gap-1 px-1.5 py-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isResolved
                          ? 'bg-emerald-400'
                          : isCritical
                          ? 'bg-red-400 animate-pulse'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-[10px] font-mono font-bold text-white">
                      {issue.priority_score}
                    </span>
                  </div>

                  {/* Marker Pin Tail */}
                  <div
                    className={`w-2 h-2 rotate-45 -mb-1 ${
                      isSelected
                        ? 'bg-white'
                        : isCritical
                        ? 'bg-red-500'
                        : isResolved
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>

                {/* Hover Popover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-lg bg-slate-950/95 border border-slate-700 text-xs shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-40">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-400 font-bold">{issue.id}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${priorityTokens.badge}`}>
                      {issue.severity_tier}
                    </span>
                  </div>
                  <p className="font-semibold text-white truncate text-[11px]">
                    {issue.title}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Impact: +{issue.impact_count}</span>
                    <span className="text-blue-400 font-bold">Score: {issue.priority_score}/100</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time Map HUD Overlay */}
        <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-slate-950/85 border border-slate-800/90 text-xs font-mono text-slate-400 space-y-1 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-medium">Haversine GPS Plane (50m Threshold)</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Center: 13.0285° N, 77.5450° E (Peenya-CBD Grid)
          </div>
        </div>

        {/* Priority Legend Overlay */}
        <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/85 border border-slate-800/90 text-[10px] font-mono text-slate-300 space-y-1 backdrop-blur-md z-10 hidden sm:block">
          <div className="text-slate-400 uppercase font-semibold">Dispatch Tiers:</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />
            <span>CRITICAL (&ge; 80 pts)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>HIGH (50–79 pts)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>ROUTINE (&lt; 50 pts)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
