import React, { useState } from 'react';
import { Camera, Sparkles, RefreshCw, CheckCircle2, ShieldCheck, UploadCloud, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFx } from '../../utils/soundEffects';

interface VisionScannerDropzoneProps {
  onTagsDetected: (tags: string[]) => void;
  category: string;
}

export const VisionScannerDropzone: React.FC<VisionScannerDropzoneProps> = ({
  onTagsDetected,
  category
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
  );
  const [detections, setDetections] = useState<Array<{ label: string; conf: string; box: { x: number; y: number; w: number; h: number } }>>([
    { label: 'Surface Pothole Void', conf: '97.8%', box: { x: 28, y: 35, w: 45, h: 32 } },
    { label: 'Vehicular Deflection Vector', conf: '94.2%', box: { x: 20, y: 25, w: 60, h: 50 } }
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playClick();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setPhotoPreview(result);
        triggerAiScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAiScan = () => {
    soundFx.playScanSweep();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      soundFx.playSuccess();
      const newDetections = [
        { label: 'Surface Anomaly Detected', conf: '98.6%', box: { x: 30, y: 30, w: 40, h: 35 } },
        { label: 'Public Safety Hazard Vector', conf: '95.1%', box: { x: 22, y: 20, w: 56, h: 52 } }
      ];
      setDetections(newDetections);
      onTagsDetected([
        'Computer Vision Confidence: 98.6%',
        'Pavement Void Depth ~18cm',
        'Pedestrian Collision Risk'
      ]);
    }, 1400);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-blue-400" />
          AI Sensor Vision Scanner
        </span>
        <button
          type="button"
          onClick={triggerAiScan}
          disabled={isScanning}
          className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Rescan Image'}</span>
        </button>
      </div>

      {/* Interactive Scan Canvas / Preview Area */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-44 flex items-center justify-center group select-none">
        {photoPreview ? (
          <>
            <img
              src={photoPreview}
              alt="Incident Sensor Capture"
              className="w-full h-full object-cover filter brightness-90 group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Bounding boxes detected by AI Vision */}
            <AnimatePresence>
              {!isScanning &&
                detections.map((det, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute border border-blue-400/80 bg-blue-500/10 rounded pointer-events-none"
                    style={{
                      left: `${det.box.x}%`,
                      top: `${det.box.y}%`,
                      width: `${det.box.w}%`,
                      height: `${det.box.h}%`
                    }}
                  >
                    <div className="absolute -top-5 left-0 px-1.5 py-0.2 rounded bg-blue-600/90 text-white font-mono text-[9px] font-bold shadow-md whitespace-nowrap flex items-center gap-1">
                      <span>{det.label}</span>
                      <span className="text-emerald-300">{det.conf}</span>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* Laser Scanline Beam Animation */}
            {isScanning && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none z-20"
              >
                <div className="w-full h-8 -top-8 absolute bg-gradient-to-b from-transparent to-cyan-500/15 pointer-events-none" />
              </motion.div>
            )}
          </>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-white">
            <UploadCloud className="w-8 h-8 text-blue-400 mb-1" />
            <span className="text-xs font-mono">Upload Photo or CCTV Clip</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        )}

        {/* Change image overlay button */}
        <label className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-200 cursor-pointer backdrop-blur-md flex items-center gap-1 transition-all">
          <UploadCloud className="w-3 h-3 text-blue-400" />
          <span>Upload Real Photo</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Detection tags list */}
      <div className="flex flex-wrap gap-1">
        {detections.map((det, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-mono flex items-center gap-1"
          >
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>{det.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
