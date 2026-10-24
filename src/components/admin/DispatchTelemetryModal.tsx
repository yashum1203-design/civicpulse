import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Radio, 
  Clock, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CivicIssue } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { CATEGORY_METADATA } from '../../data/mockIssues';

interface DispatchTelemetryModalProps {
  issue: CivicIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDispatch: (issueId: string, unitName: string) => void;
}

export const DispatchTelemetryModal: React.FC<DispatchTelemetryModalProps> = ({
  issue,
  isOpen,
  onClose,
  onConfirmDispatch
}) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState(240);
  const [radioSignalStrength, setRadioSignalStrength] = useState(98);

  useEffect(() => {
    if (isOpen) {
      soundFx.playAlert();
      setIsTransmitting(false);
      setEtaSeconds(Math.floor(180 + Math.random() * 180)); // 3-6 mins
      setRadioSignalStrength(Math.floor(94 + Math.random() * 6));
    }
  }, [isOpen]);

  if (!isOpen || !issue) return null;

  const categoryMeta = CATEGORY_METADATA[issue.category];
  const isCritical = issue.severity_tier === 'CRITICAL';

  // Determine realistic specialized crew unit
  const crewUnits: Record<string, string> = {
    open_drainage: 'Bio-Hazard Hydraulics Crew #04',
    road_damage: 'Rapid Pavement Paving Unit #12',
    street_light_malfunction: 'Municipal Grid Electrical Team #08',
    waste_management: 'Sanitation Rapid Deployment Squad #02'
  };

  const assignedCrew = crewUnits[issue.category] || 'Civil Emergency Response Unit #01';
  const radioFreq = `446.${Math.floor(100 + Math.random() * 899)} MHz`;

  const handleTransmit = () => {
    setIsTransmitting(true);
    soundFx.playDispatch();
    setTimeout(() => {
      onConfirmDispatch(issue.id, assignedCrew);
      setIsTransmitting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="relative w-full max-w-2xl rounded-2xl glass-panel-elevated border border-blue-500/40 p-6 shadow-2xl overflow-hidden bg-slate-950/95"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-cyber-grid bg-[size:24px_24px] opacity-10 pointer-events-none" />

        {/* Top Header */}
        <div className="relative flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
            }`}>
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-wider text-white uppercase">
                  Field Operations Dispatch Protocol
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SEC-OPS-LIVE
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Target Node: <strong className="text-white">{issue.id}</strong> • Priority: {issue.priority_score}/100 ({issue.severity_tier})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content Body */}
        <div className="relative mt-5 space-y-5">
          {/* Incident summary banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {categoryMeta.label}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{issue.locationName}</span>
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">
                {issue.title}
              </h4>
              <p className="text-xs text-slate-400 font-mono line-clamp-1">
                &quot;{issue.description}&quot;
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-mono text-slate-400">Impact Factor</div>
              <div className="text-lg font-bold font-mono text-purple-400">
                +{issue.impact_count} merged
              </div>
            </div>
          </div>

          {/* Interactive Route Navigation Telemetry Canvas */}
          <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>GPS Vector Routing & Optimal Path Lock</span>
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Radio className="w-3 h-3" />
                <span>Link Quality: {radioSignalStrength}%</span>
              </span>
            </div>

            {/* SVG Telemetry Map Path */}
            <div className="relative h-28 bg-slate-900/60 rounded-lg border border-slate-800/80 p-2 flex items-center justify-between">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 110">
                <defs>
                  <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor={isCritical ? '#ef4444' : '#10b981'} />
                  </linearGradient>
                </defs>
                {/* Background Dash Line */}
                <path
                  d="M 60 55 C 160 20, 240 90, 440 55"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                />
                {/* Animated Pulsing Active Route Line */}
                <path
                  d="M 60 55 C 160 20, 240 90, 440 55"
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
              </svg>

              {/* Depot Origin Marker */}
              <div className="relative z-10 flex items-center gap-2 pl-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400">DEPOT DISPATCH</div>
                  <div className="text-xs font-mono font-bold text-white">Central Operations</div>
                  <div className="text-[10px] font-mono text-blue-400">Coords: 13.029, 77.540</div>
                </div>
              </div>

              {/* Moving Vehicle Dot in between */}
              <motion.div 
                animate={{ x: [-20, 20, -20] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 px-2 py-1 rounded-md bg-slate-900 border border-blue-500/40 text-[10px] font-mono text-blue-300 flex items-center gap-1 shadow-lg"
              >
                <Truck className="w-3 h-3 text-blue-400" />
                <span>En Route (1.4 km)</span>
              </motion.div>

              {/* Target Incident Marker */}
              <div className="relative z-10 flex items-center gap-2 pr-3 text-right">
                <div>
                  <div className="text-[10px] font-mono text-slate-400">TARGET HAZARD</div>
                  <div className="text-xs font-mono font-bold text-white">{issue.id}</div>
                  <div className="text-[10px] font-mono text-red-400">
                    {issue.latitude.toFixed(3)}°, {issue.longitude.toFixed(3)}°
                  </div>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isCritical ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-bounce' : 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Quick telemetry badges */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 text-[10px]">ASSIGNED UNIT</div>
                <div className="font-bold text-blue-300 truncate">{assignedCrew}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 text-[10px]">ESTIMATED ARRIVAL</div>
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{Math.floor(etaSeconds / 60)}m {etaSeconds % 60}s</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 text-[10px]">RADIO COMMS</div>
                <div className="font-bold text-purple-400">{radioFreq}</div>
              </div>
            </div>
          </div>

          {/* Critical alert banner if critical */}
          {isCritical && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-3 text-red-300 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
              <span>
                <strong>CRITICAL SEVERITY WARNING:</strong> Urgency score is {issue.priority_score}/100. Emergency vehicle passage or pedestrian safety is in immediate jeopardy.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isTransmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer"
            >
              Abort Dispatch
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleTransmit}
              disabled={isTransmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-white shadow-xl transition-all flex items-center gap-2 cursor-pointer ${
                isCritical
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
              }`}
            >
              <Truck className={`w-4 h-4 ${isTransmitting ? 'animate-bounce' : ''}`} />
              <span>{isTransmitting ? 'Transmitting Work Order...' : 'Authorize & Transmit Dispatch'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
