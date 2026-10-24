import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  LightbulbOff, 
  Biohazard, 
  Trash2, 
  MapPin, 
  Navigation, 
  Send, 
  Check, 
  Sparkles, 
  Camera, 
  ChevronRight, 
  ChevronLeft, 
  Crosshair, 
  Hospital, 
  GraduationCap, 
  Activity, 
  AlertTriangle,
  Radio,
  Loader2,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BaselineGisData, CivicCategory, CivicIssue } from '../../types';
import { CATEGORY_METADATA } from '../../data/mockIssues';
import { calculateUrgencyScore, getSeverityTier, calculateHaversineDistance } from '../../utils/civicPulseAlgorithms';
import { UrgencyGauge } from '../common/UrgencyGauge';
import { VisionScannerDropzone } from './VisionScannerDropzone';
import { soundFx } from '../../utils/soundEffects';

interface CitizenPortalProps {
  onSubmitIssue: (issueData: {
    category: CivicCategory;
    title: string;
    description: string;
    locationName: string;
    latitude: number;
    longitude: number;
    baseline_data: BaselineGisData;
  }) => void;
  onSimulateDuplicatePrefill: () => void;
  userGps: { lat: number; lng: number } | null;
  locationAddress: string;
  isLocating: boolean;
  onTriggerGps: () => void;
  nearbyIssues: CivicIssue[];
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  onSubmitIssue,
  userGps,
  locationAddress,
  isLocating,
  onTriggerGps,
  nearbyIssues
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<CivicCategory>('road_damage');
  
  // Location selection state
  const [locationName, setLocationName] = useState<string>(
    locationAddress || 'Peenya / Yeshwanthpur Express Road'
  );
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: userGps ? userGps.lat : 13.0286,
    lng: userGps ? userGps.lng : 77.5451
  });

  // Keep location in sync when user triggers GPS
  useEffect(() => {
    if (userGps) {
      setCoordinates(userGps);
      if (locationAddress) {
        setLocationName(locationAddress);
      }
    }
  }, [userGps, locationAddress]);

  // Description & Details
  const [title, setTitle] = useState<string>('Deep Pothole Crater Threatening Two-Wheelers');
  const [description, setDescription] = useState<string>(
    'There is a deep pothole right in the middle of the street, highly dangerous for bikes.'
  );

  // Baseline GIS Layer State (Exact Python backend model)
  const [baselineData, setBaselineData] = useState<BaselineGisData>({
    distance_to_nearest_hospital_meters: 150.0,
    distance_to_nearest_school_meters: 60.0,
    population_density_tier: 'high',
    is_peak_traffic_zone: true
  });

  const [aiVisionTags, setAiVisionTags] = useState<string[]>([
    'Surface Pothole Void (~18cm)',
    'High Vehicular Deflection',
    'Two-Wheeler Hazard'
  ]);

  // Check if any existing ticket is dangerously close (< 50m) to user's pin
  const closestExistingTicket = nearbyIssues.reduce<{ issue: CivicIssue; distance: number } | null>(
    (closest, curr) => {
      if (curr.status === 'Resolved') return closest;
      const d = calculateHaversineDistance(
        [coordinates.lat, coordinates.lng],
        [curr.latitude, curr.longitude]
      );
      if (!closest || d < closest.distance) {
        return { issue: curr, distance: d };
      }
      return closest;
    },
    null
  );

  const isWithinDuplicateRange = closestExistingTicket && closestExistingTicket.distance <= 50.0;

  // Preset scenarios
  const DISTRICT_PRESETS = [
    {
      name: 'Peenya / Yeshwanthpur Industrial (Near TICKET_001)',
      lat: 13.0286,
      lng: 77.5451,
      description: '15m from TICKET_001 - Test Case A Duplicate Detection'
    },
    {
      name: 'Jayanagar Medical Emergency Wing (Case B Target)',
      lat: 12.9240,
      lng: 77.5120,
      description: '35m from Hospital Emergency Ward - High Urgency (Score 90)'
    },
    {
      name: 'MG Road Commercial Promenade (Near TICKET_002)',
      lat: 12.9716,
      lng: 77.5946,
      description: 'Commercial shopping district & high pedestrian density'
    },
    {
      name: 'Koramangala 4th Block School Transit',
      lat: 12.9352,
      lng: 77.6245,
      description: 'School crosswalk zone with vulnerable pedestrians'
    }
  ];

  const handleSelectCategory = (cat: CivicCategory) => {
    soundFx.playClick();
    setSelectedCategory(cat);
    if (cat === 'road_damage') {
      setTitle('Deep Pothole Crater Threatening Two-Wheelers');
      setDescription('There is a deep pothole right in the middle of the street, highly dangerous for bikes.');
      setBaselineData({
        distance_to_nearest_hospital_meters: 150.0,
        distance_to_nearest_school_meters: 60.0,
        population_density_tier: 'high',
        is_peak_traffic_zone: true
      });
      setAiVisionTags(['Surface Pothole Void (~18cm)', 'High Vehicular Deflection', 'Two-Wheeler Hazard']);
    } else if (cat === 'open_drainage') {
      setTitle('Sewage Line Overflowing Near Emergency Wing');
      setDescription('Sewage line broken and overflowing outside the main emergency wing.');
      setBaselineData({
        distance_to_nearest_hospital_meters: 35.0,
        distance_to_nearest_school_meters: 450.0,
        population_density_tier: 'high',
        is_peak_traffic_zone: true
      });
      setAiVisionTags(['Biohazard Effluent', 'Emergency Access Block', 'Bacterial Outflow']);
    } else if (cat === 'street_light_malfunction') {
      setTitle('Complete Blackout of Streetlamps on School Crossing');
      setDescription('Series of 4 unlit streetlights leaving pedestrian crossing in pitch black darkness.');
      setBaselineData({
        distance_to_nearest_hospital_meters: 220.0,
        distance_to_nearest_school_meters: 40.0,
        population_density_tier: 'high',
        is_peak_traffic_zone: false
      });
      setAiVisionTags(['Zero Illumination', 'Child Safety Risk', 'Darkness Hazard']);
    } else {
      setTitle('Commercial Garbage Bin Overflow Spilling on Footpath');
      setDescription('Garbage bin is overflowing and plastic waste is spilling onto the footpath.');
      setBaselineData({
        distance_to_nearest_hospital_meters: 450.0,
        distance_to_nearest_school_meters: 220.0,
        population_density_tier: 'medium',
        is_peak_traffic_zone: false
      });
      setAiVisionTags(['Footpath Obstruction', 'Municipal Waste', 'Sanitation Hazard']);
    }
  };

  const handleSelectPresetDistrict = (district: typeof DISTRICT_PRESETS[0]) => {
    setLocationName(district.name);
    setCoordinates({ lat: district.lat, lng: district.lng });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = x / rect.width;
    const pctY = y / rect.height;

    const spanLat = 0.04;
    const spanLng = 0.05;
    const newLat = (coordinates.lat + spanLat / 2) - pctY * spanLat;
    const newLng = (coordinates.lng - spanLng / 2) + pctX * spanLng;

    const roundedLat = Math.round(newLat * 10000) / 10000;
    const roundedLng = Math.round(newLng * 10000) / 10000;

    setCoordinates({ lat: roundedLat, lng: roundedLng });
    setLocationName(`Pin at [${roundedLat.toFixed(4)}, ${roundedLng.toFixed(4)}]`);
  };

  const liveUrgencyScore = calculateUrgencyScore(
    selectedCategory,
    [coordinates.lat, coordinates.lng],
    baselineData
  );
  const liveSeverityTier = getSeverityTier(liveUrgencyScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmitIssue({
      category: selectedCategory,
      title: title || `${CATEGORY_METADATA[selectedCategory].shortLabel} Issue`,
      description,
      locationName,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      baseline_data: baselineData
    });
  };

  const renderCategoryIcon = (cat: CivicCategory) => {
    switch (cat) {
      case 'open_drainage':
        return <Biohazard className="w-6 h-6 text-red-400" />;
      case 'road_damage':
        return <AlertOctagon className="w-6 h-6 text-amber-400" />;
      case 'street_light_malfunction':
        return <LightbulbOff className="w-6 h-6 text-blue-400" />;
      case 'waste_management':
        return <Trash2 className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Dynamic Surroundings Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl glass-panel p-6 sm:p-8 overflow-hidden border border-blue-500/25 bg-gradient-to-r from-blue-950/40 via-slate-900/70 to-slate-900/50 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Intelligent Intake Engine</span>
              </span>
              <button
                type="button"
                onClick={onTriggerGps}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-all cursor-pointer"
              >
                {isLocating ? (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                ) : (
                  <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
                )}
                <span>
                  {isLocating ? 'Detecting GPS...' : 'Scan My Real Surroundings'}
                </span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
              Report a Civic Issue in Your Surroundings
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Real-time spatial deduplication: Haversine distance (&le;50m) &amp; SentenceTransformer cosine similarity (&ge;0.75), paired with GIS critical infrastructure proximity scoring (0–100).
            </p>

            {/* Current GPS Readout Bar */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{locationName}</span>
              </div>
              <div className="px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-blue-400">
                [{coordinates.lat.toFixed(4)}°, {coordinates.lng.toFixed(4)}°]
              </div>
            </div>
          </div>

          {/* Step Progress Pill */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 self-start md:self-auto font-mono text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                step === 1 ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Category
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                step === 2 ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. GeoLocation
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                step === 3 ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Telemetry
            </button>
          </div>
        </div>
      </motion.div>

      {/* Surrounding Live Hazards Ticker */}
      {nearbyIssues.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl glass-panel border border-slate-800/80 space-y-2.5"
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Active Incidents in Your Immediate Surroundings ({nearbyIssues.length})
            </span>
            <span className="text-[11px] text-blue-400 font-bold">
              Radius: ~800m
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {nearbyIssues.slice(0, 3).map((iss) => {
              const d = calculateHaversineDistance(
                [coordinates.lat, coordinates.lng],
                [iss.latitude, iss.longitude]
              );
              const isVeryClose = d <= 50.0;

              return (
                <div
                  key={iss.id}
                  className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                    isVeryClose
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">#{iss.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                      iss.severity_tier === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {iss.severity_tier} ({iss.priority_score})
                    </span>
                  </div>
                  <p className="text-[11px] truncate text-slate-300">
                    {iss.title}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{d < 1000 ? `${d.toFixed(0)}m away` : `${(d / 1000).toFixed(1)}km away`}</span>
                    {isVeryClose && (
                      <span className="text-amber-400 font-bold animate-pulse">
                        &le; 50m Proximity!
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Proximity duplicate advisory alert */}
      {isWithinDuplicateRange && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3 shadow-lg"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white flex items-center gap-2">
              <span>Proximity Alert: Active Issue Within {closestExistingTicket?.distance.toFixed(1)}m</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {closestExistingTicket?.issue.id}
              </span>
            </h4>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              You are located within the 50.0m Haversine radius of an existing report: &quot;{closestExistingTicket?.issue.title}&quot;.
              Submitting a report on the same issue will automatically trigger deduplication and elevate the community impact score.
            </p>
          </div>
        </motion.div>
      )}

      {/* Wizard Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: Category Picker */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-mono">
                      1
                    </span>
                    Select Civic Category Classification
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category base severity weights: open_drainage (40), road_damage (35), street_light (20), waste_management (15).
                  </p>
                </div>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  4 Core Backend Weights
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(CATEGORY_METADATA) as CivicCategory[]).map((catKey) => {
                  const meta = CATEGORY_METADATA[catKey];
                  const isSelected = selectedCategory === catKey;

                  return (
                    <motion.button
                      key={catKey}
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.985 }}
                      type="button"
                      onClick={() => handleSelectCategory(catKey)}
                      className={`relative p-5 rounded-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? 'glass-panel-elevated border-blue-500/70 shadow-lg shadow-blue-500/20'
                          : 'glass-panel hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                          {renderCategoryIcon(catKey)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-base">
                            {meta.label}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {meta.tag}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-amber-400 font-bold">
                          Base Weight: {meta.baseWeight} / 40 pts
                        </span>
                        <span className="text-blue-400 font-semibold group-hover:underline">
                          Select Category →
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Step 1 Footer Action */}
              <div className="pt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer font-mono"
                >
                  <span>Continue to GPS Location</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Location Selector with Interactive Radar Grid */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-mono">
                      2
                    </span>
                    GPS Coordinates &amp; Spatial Proximity
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Haversine distance evaluates whether incoming report falls within the &le; 50.0m threshold of an existing ticket.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <Crosshair className="w-3.5 h-3.5 animate-pulse" />
                  <span>Threshold: 50.0m</span>
                </div>
              </div>

              {/* Split: Interactive Radar Canvas and Presets */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Interactive Vector Radar Grid (7 cols) */}
                <div className="lg:col-span-7 glass-panel rounded-2xl p-4 border border-blue-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <Navigation className="w-3.5 h-3.5" />
                      Spatial Radar Grid (Click to Drop GPS Pin)
                    </span>
                    <button
                      type="button"
                      onClick={onTriggerGps}
                      disabled={isLocating}
                      className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
                    </button>
                  </div>

                  {/* Map Mock Canvas Card */}
                  <div
                    onClick={handleMapClick}
                    className="relative w-full h-72 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden cursor-crosshair group cyber-grid-bg select-none"
                  >
                    {/* Street grid stylized paths */}
                    <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6,4" />
                      <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#3B82F6" strokeWidth="1.5" />
                      <line x1="35%" y1="0" x2="35%" y2="100%" stroke="#3B82F6" strokeWidth="1.5" />
                      <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8,4" />
                      <circle cx="50%" cy="50%" r="60" fill="none" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4,4" />
                      <circle cx="50%" cy="50%" r="120" fill="none" stroke="#3B82F6" strokeWidth="0.8" strokeDasharray="6,6" opacity="0.4" />
                    </svg>

                    {/* Active Pin Marker at center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                      <div className="relative flex flex-col items-center">
                        <div className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold shadow-lg shadow-blue-500/50 whitespace-nowrap">
                          YOUR REPORT PIN
                        </div>
                        <MapPin className="w-7 h-7 text-red-500 fill-red-500/30 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-ping -mt-1" />
                      </div>
                    </div>

                    {/* Nearby surrounding issues plotted on radar */}
                    {nearbyIssues.slice(0, 4).map((iss, i) => {
                      const d = calculateHaversineDistance(
                        [coordinates.lat, coordinates.lng],
                        [iss.latitude, iss.longitude]
                      );
                      const isClose = d <= 50.0;
                      // Place on radar circle
                      const angle = (i * Math.PI) / 2 + 0.4;
                      const radDist = Math.min(100, (d / 500) * 80 + 30);
                      const xPct = 50 + (Math.cos(angle) * radDist) / 3;
                      const yPct = 50 + (Math.sin(angle) * radDist) / 3;

                      return (
                        <div
                          key={iss.id}
                          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ left: `${xPct}%`, top: `${yPct}%` }}
                        >
                          <div className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold flex items-center gap-1 ${
                            isClose ? 'bg-amber-500 text-slate-950 animate-bounce' : 'bg-slate-900 border border-slate-700 text-slate-300'
                          }`}>
                            <span>{iss.id}</span>
                            <span>({d.toFixed(0)}m)</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Instructions Overlay Banner */}
                    <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between backdrop-blur-md">
                      <span>Click to drop target pin or scan your GPS position</span>
                      <span className="text-blue-400 font-bold">Haversine GPS Plane</span>
                    </div>
                  </div>

                  {/* Coordinate HUD Readout */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">LATITUDE (coord[0])</span>
                      <span className="text-white font-bold">{coordinates.lat.toFixed(4)}° N</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">LONGITUDE (coord[1])</span>
                      <span className="text-white font-bold">{coordinates.lng.toFixed(4)}° E</span>
                    </div>
                  </div>
                </div>

                {/* District Presets List (5 cols) */}
                <div className="lg:col-span-5 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Location Quick Presets
                      </h3>
                      <button
                        type="button"
                        onClick={onTriggerGps}
                        className="text-[10px] text-blue-400 font-mono hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Detect GPS</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {DISTRICT_PRESETS.map((d, idx) => {
                        const isMatch = Math.abs(d.lat - coordinates.lat) < 0.001;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectPresetDistrict(d)}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                              isMatch
                                ? 'bg-blue-600/20 border-blue-500/70 text-blue-200'
                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{d.name}</span>
                              {isMatch && (
                                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {d.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">
                      Confirmed Target Address:
                    </span>
                    <p className="text-white font-medium text-xs mt-0.5 truncate">
                      {locationName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 Footer Navigation */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Category</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer font-mono"
                >
                  <span>Continue to GIS Telemetry</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Text Description & GIS Telemetry Layer */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-mono">
                      3
                    </span>
                    Incident Description &amp; GIS Layer Inputs
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Localized civic urgency score out of 100 via Critical Infrastructure proximity and foot-traffic density.
                  </p>
                </div>
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  SentenceTransformer Vectorization
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Form Inputs (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Title Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                      <span>REPORT TITLE</span>
                      <span className="text-[10px] text-slate-500">Concise hazard headline</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g. Deep pothole right in the middle of the street"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  {/* Description Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <label className="text-slate-300">DESCRIPTION (FOR EMBEDDING ENCODING)</label>
                      <span className="text-slate-400">{description.length} chars</span>
                    </div>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      placeholder="Describe size, depth, danger, and environmental surroundings..."
                      className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed font-mono"
                    />
                  </div>

                  {/* Test Case Quick Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Quick Scenario Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('road_damage');
                          setDescription('There is a deep pothole right in the middle of the street, highly dangerous for bikes.');
                          setTitle('Dangerous Road Pothole in Commute Lane');
                          setCoordinates({ lat: 13.0286, lng: 77.5451 });
                          setLocationName('Peenya Main Road (15m from TICKET_001)');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[11px] text-amber-300 border border-amber-500/30 transition-all cursor-pointer font-mono flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Case A: Pothole (Duplicate of TICKET_001)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('open_drainage');
                          setDescription('Sewage line broken and overflowing outside the main emergency wing.');
                          setTitle('Sewage Line Overflow at Emergency Ward');
                          setCoordinates({ lat: 12.9240, lng: 77.5120 });
                          setLocationName('Jayanagar Emergency Ward');
                          setBaselineData({
                            distance_to_nearest_hospital_meters: 35.0,
                            distance_to_nearest_school_meters: 450.0,
                            population_density_tier: 'high',
                            is_peak_traffic_zone: true
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer font-mono flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Case B: Sewage Overflow (Score 90 / CRITICAL)</span>
                      </button>
                    </div>
                  </div>

                  {/* GIS Layer Controls (Exact Python baseline_data) */}
                  <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-3.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-blue-300 font-bold uppercase flex items-center gap-1.5">
                        <Hospital className="w-4 h-4 text-red-400" />
                        Hospital Proximity Bonus (Max +20 pts)
                      </span>
                      <span className="text-white font-bold">{baselineData.distance_to_nearest_hospital_meters}m</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="600"
                      step="10"
                      value={baselineData.distance_to_nearest_hospital_meters}
                      onChange={(e) => setBaselineData({
                        ...baselineData,
                        distance_to_nearest_hospital_meters: parseFloat(e.target.value)
                      })}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 -mt-2">
                      <span>&le;100m: +20 pts</span>
                      <span>&le;300m: +10 pts</span>
                      <span>&gt;300m: 0 pts</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
                      <span className="text-blue-300 font-bold uppercase flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        School Proximity Bonus (Max +10 pts)
                      </span>
                      <span className="text-white font-bold">{baselineData.distance_to_nearest_school_meters}m</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="600"
                      step="10"
                      value={baselineData.distance_to_nearest_school_meters}
                      onChange={(e) => setBaselineData({
                        ...baselineData,
                        distance_to_nearest_school_meters: parseFloat(e.target.value)
                      })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 -mt-2">
                      <span>&le;100m: +10 pts</span>
                      <span>&gt;100m: 0 pts</span>
                    </div>

                    {/* Density Tier & Peak Traffic Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          POPULATION DENSITY TIER
                        </span>
                        <select
                          value={baselineData.population_density_tier}
                          onChange={(e) => setBaselineData({
                            ...baselineData,
                            population_density_tier: e.target.value as 'high' | 'medium' | 'low'
                          })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none"
                        >
                          <option value="high">High (+20 pts)</option>
                          <option value="medium">Medium (+10 pts)</option>
                          <option value="low">Low (0 pts)</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          PEAK TRAFFIC ZONE
                        </span>
                        <button
                          type="button"
                          onClick={() => setBaselineData({
                            ...baselineData,
                            is_peak_traffic_zone: !baselineData.is_peak_traffic_zone
                          })}
                          className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                            baselineData.is_peak_traffic_zone
                              ? 'bg-red-500/20 border-red-500 text-red-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          {baselineData.is_peak_traffic_zone ? 'Peak Traffic (+10 pts)' : 'Off-Peak (0 pts)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Dynamic Radial Urgency Gauge & AI Vision Scanner (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Mathematical Urgency HUD with Radial Speedometer */}
                  <div className="glass-panel-elevated rounded-2xl p-5 border border-blue-500/30 space-y-3 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs font-mono text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                        Dynamic Urgency Gauge
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Formula Scale: 0–100
                      </span>
                    </div>

                    {/* Radial Arc Speedometer */}
                    <div className="py-2">
                      <UrgencyGauge score={liveUrgencyScore} tier={liveSeverityTier} size={190} />
                    </div>

                    {/* Formula Breakdown Tags */}
                    <div className="w-full space-y-1.5 text-[11px] font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="flex justify-between text-slate-300">
                        <span>Base Category ({selectedCategory}):</span>
                        <strong className="text-white">+{CATEGORY_METADATA[selectedCategory].baseWeight} pts</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Hospital Proximity ({baselineData.distance_to_nearest_hospital_meters}m):</span>
                        <strong className="text-red-400">
                          +{baselineData.distance_to_nearest_hospital_meters <= 100 ? 20 : baselineData.distance_to_nearest_hospital_meters <= 300 ? 10 : 0} pts
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>School Proximity ({baselineData.distance_to_nearest_school_meters}m):</span>
                        <strong className="text-amber-400">
                          +{baselineData.distance_to_nearest_school_meters <= 100 ? 10 : 0} pts
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Density Tier ({baselineData.population_density_tier}):</span>
                        <strong className="text-blue-400">
                          +{baselineData.population_density_tier === 'high' ? 20 : baselineData.population_density_tier === 'medium' ? 10 : 0} pts
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Peak Traffic Factor:</span>
                        <strong className="text-purple-400">
                          +{baselineData.is_peak_traffic_zone ? 10 : 0} pts
                        </strong>
                      </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer group font-mono mt-1"
                    >
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      <span>Run Intake Pipeline</span>
                    </motion.button>
                  </div>

                  {/* Laser Vision Scanner Dropzone */}
                  <VisionScannerDropzone
                    category={selectedCategory}
                    onTagsDetected={(tags) => setAiVisionTags(tags)}
                  />
                </div>
              </div>

              {/* Step 3 Footer Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Location</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
