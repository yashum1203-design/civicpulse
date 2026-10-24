import React, { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle2, 
  CopyCheck, 
  Terminal, 
  Cpu, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  PlusCircle,
  AlertTriangle,
  Radio,
  Hospital,
  GraduationCap
} from 'lucide-react';
import { CivicIssue, DuplicateCheckResult } from '../../types';
import { getPriorityColor } from '../../utils/priority';

interface AIProcessingHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateResult: DuplicateCheckResult | null;
  createdIssue: CivicIssue | null;
  onGoToAdmin: () => void;
  onReportAnother: () => void;
}

export const AIProcessingHubModal: React.FC<AIProcessingHubModalProps> = ({
  isOpen,
  duplicateResult,
  createdIssue,
  onGoToAdmin,
  onReportAnother
}) => {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize algorithmic simulation steps
  useEffect(() => {
    if (!isOpen) {
      setStage(1);
      setTerminalLines([]);
      setProgressPercent(0);
      return;
    }

    const logs = [
      '[INIT] Ingesting report payload into CivicPulse AI Intake Pipeline...',
      '[EMBEDDING] all-MiniLM-L6-v2: Generating 64-dim dense float embedding vector...',
      '[HAVERSINE] Computing R=6371000m geodesic distance against database...',
      '[COSINE] Calculating (A dot B) / (||A|| * ||B||) similarity with active tickets...',
      '[GIS] Intersecting Hospital (<100m) & School (<100m) critical safety zones...',
      '[DENSITY] Evaluating foot-traffic multiplier + Peak Transit flag...',
      '[SCORE] Computing calculate_urgency_score(category, location, baseline_data)...',
      '[CONVERGED] Intake Pipeline resolved successfully. Dispatching to Command Ledger.'
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logs.length) {
        setTerminalLines((prev) => [...prev.slice(-6), logs[logIndex]]);
        logIndex++;
      }
    }, 400);

    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => (prev >= 100 ? 100 : prev + 3));
    }, 100);

    const timer1 = setTimeout(() => setStage(2), 1200);
    const timer2 = setTimeout(() => setStage(3), 2600);
    const timer3 = setTimeout(() => {
      setStage(4);
      setProgressPercent(100);
    }, 3800);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  // Canvas particle clustering for DBSCAN / Haversine spatial scan
  useEffect(() => {
    if (!isOpen || stage > 3) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 380);
    const height = (canvas.height = 140);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      cluster: Math.floor(Math.random() * 2),
      color: ['#3B82F6', '#EF4444', '#F59E0B'][Math.floor(Math.random() * 3)]
    }));

    const centers = [
      { x: width * 0.35, y: height * 0.5 },
      { x: width * 0.7, y: height * 0.5 }
    ];

    let t = 0;
    const render = () => {
      t += 0.05;
      ctx.clearRect(0, 0, width, height);

      // Radar scanline
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Haversine 50m threshold zone
      centers.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 40 + Math.sin(t) * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Update & draw particles
      particles.forEach((p) => {
        if (stage === 1) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        } else {
          const target = centers[p.cluster];
          p.x += (target.x - p.x) * 0.05 + (Math.random() - 0.5) * 1.0;
          p.y += (target.y - p.y) * 0.05 + (Math.random() - 0.5) * 1.0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, stage]);

  if (!isOpen) return null;

  const targetIssue = duplicateResult?.isDuplicate
    ? duplicateResult.matchedIssue
    : createdIssue;

  const priorityMeta = targetIssue
    ? getPriorityColor(targetIssue.priority_score)
    : getPriorityColor(85);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl glass-panel-elevated border border-blue-500/30 overflow-hidden shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold tracking-wider text-white uppercase flex items-center gap-2">
                CivicPulse AI Intake Pipeline
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {stage < 4 ? 'PROCESSING' : 'CONVERGED'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                all-MiniLM-L6-v2 + Haversine (50m) + GIS Proximity (0–100)
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-blue-400 font-bold">{progressPercent.toFixed(0)}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {stage < 4 ? (
            /* Simulation Stepper */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    stage === 1
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md shadow-blue-500/20'
                      : stage > 1
                      ? 'bg-slate-900/80 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>1. MiniLM Encode</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                    Text Embedding [64]
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    stage === 2
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md shadow-blue-500/20'
                      : stage > 2
                      ? 'bg-slate-900/80 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
                    <Radio className="w-3.5 h-3.5" />
                    <span>2. Haversine &le;50m</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                    Cosine Sim &ge;0.75
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    stage === 3
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>3. GIS Urgency</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                    Score / 100 &amp; Tier
                  </div>
                </div>
              </div>

              {/* Dynamic Stage View */}
              {stage === 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                      Generating text embedding via SentenceTransformer(&apos;all-MiniLM-L6-v2&apos;)...
                    </span>
                    <span>Embedding Vector</span>
                  </div>
                  <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 font-mono text-xs text-slate-300 space-y-1 h-36 overflow-hidden relative">
                    <div className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span>&gt;&gt;&gt; new_embedding = embedding_model.encode(new_description)</span>
                    </div>
                    {terminalLines.map((line, idx) => (
                      <div key={idx} className="text-slate-400 text-[11px] leading-tight">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stage === 2 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Checking Haversine distance (&le; 50.0m) &amp; Cosine similarity (&ge; 0.75)...
                    </span>
                    <span>Distance Scan</span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-36 flex items-center justify-center">
                    <canvas ref={canvasRef} className="w-full h-full" />
                    <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      Scanning radius: distance &le; 50.0m ...
                    </div>
                  </div>
                </div>
              )}

              {stage === 3 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      Evaluating calculate_urgency_score(category, location, baseline_data)...
                    </span>
                    <span>Max: 100 pts</span>
                  </div>
                  <div className="rounded-xl p-4 bg-slate-950 border border-amber-500/30 flex flex-col items-center justify-center space-y-2.5 h-36">
                    <div className="font-mono text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-center">
                      Score = Category Base + Hospital Bonus + School Bonus + Density + Traffic
                    </div>
                    <div className="flex items-center gap-3 font-mono text-sm">
                      <span className="text-slate-400">Calculated Priority:</span>
                      <span className="text-white font-bold text-lg">
                        {targetIssue ? targetIssue.priority_score : 85} / 100
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${priorityMeta.badge}`}>
                        {priorityMeta.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Stage 4: Result Screen Matching Exact Python Terminal Output */
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              {duplicateResult?.isDuplicate ? (
                /* Alternative B: Duplicate Detected */
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <CopyCheck className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">
                          ⚠️ [REJECTED/LINKED] Duplicate Found!
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Linked to: {duplicateResult.duplicateTicketId}
                        </span>
                      </div>
                      <p className="text-xs text-amber-200/90 mt-1 font-mono">
                        Semantic Similarity: <strong>{(duplicateResult.similarityScore * 100).toFixed(2)}%</strong> (threshold: 75%)
                        <br />
                        Physical Distance: <strong>{duplicateResult.distanceMeters.toFixed(1)} meters</strong> (threshold: 50.0m)
                      </p>
                    </div>
                  </div>

                  {/* Matched Issue Card */}
                  {duplicateResult.matchedIssue && (
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-400 font-bold">
                          Matched Ticket: #{duplicateResult.matchedIssue.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${priorityMeta.badge}`}>
                          Tier: {duplicateResult.matchedIssue.severity_tier} ({duplicateResult.matchedIssue.priority_score}/100)
                        </span>
                      </div>
                      <p className="font-medium text-slate-200">
                        {duplicateResult.matchedIssue.title}
                      </p>
                      <p className="text-slate-400 text-[11px] font-mono">
                        &quot;{duplicateResult.matchedIssue.description}&quot;
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80">
                        <span>Physical Distance: {duplicateResult.distanceMeters.toFixed(1)}m</span>
                        <span className="text-emerald-400 font-bold">
                          Impact elevated to +{duplicateResult.matchedIssue.impact_count} reports
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Alternative A: Unique Issue Approved */
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">
                          ✅ [APPROVED] Unique Report Verified!
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {targetIssue?.id || 'TICKET_NEW'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200/90 mt-1 font-mono">
                        No duplicate detected (&gt;50m or &lt;75% similarity). Provisioning ticket routing...
                      </p>
                    </div>
                  </div>

                  {targetIssue && (
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-400 font-bold">
                          Calculated Priority Score: <strong className="text-white text-sm">{targetIssue.priority_score} / 100</strong>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${priorityMeta.badge}`}>
                          Administrative Dispatch Tier: **{targetIssue.severity_tier}**
                        </span>
                      </div>
                      <p className="font-medium text-slate-200">
                        {targetIssue.title}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80">
                        <span>Dept: {targetIssue.assignedDepartment}</span>
                        <span className="text-blue-400 font-semibold">🚀 Ticket Routed to Queue</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
          {stage < 4 ? (
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Intake pipeline executing in background...
            </div>
          ) : (
            <>
              <button
                onClick={onReportAnother}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-2 cursor-pointer font-mono"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Another Report</span>
              </button>

              <button
                onClick={onGoToAdmin}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer font-mono"
              >
                <span>View in Command Center Queue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
