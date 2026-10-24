import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Cpu, 
  Compass, 
  Layers, 
  RotateCcw,
  Sparkles,
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFx } from '../utils/soundEffects';

interface HeaderProps {
  currentView: 'citizen' | 'admin';
  onViewChange: (view: 'citizen' | 'admin') => void;
  onResetData: () => void;
  onPreloadDuplicate: () => void;
  activeCount: number;
  userGps: { lat: number; lng: number } | null;
  locationAddress: string;
  isLocating: boolean;
  onTriggerGps: () => void;
  onSearchCity: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onResetData,
  onPreloadDuplicate,
  activeCount,
  userGps,
  locationAddress,
  isLocating,
  onTriggerGps,
  onSearchCity
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundFx.enabled);

  useEffect(() => {
    const unsub = soundFx.subscribe((enabled) => {
      setIsSoundEnabled(enabled);
    });
    return unsub;
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    await onSearchCity(searchQuery);
    setIsSearching(false);
    setShowSearchModal(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-xl bg-slate-950/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & Live System Status */}
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onViewChange('citizen')}
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-400 p-[1px] shadow-lg shadow-blue-500/25">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl tracking-wider text-white">
                  CIVICPULSE<span className="text-blue-400">.AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
                  GPS LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate max-w-xs">
                {locationAddress ? `📍 ${locationAddress}` : 'Autonomous Civic Triage & Spatial Prioritization'}
              </p>
            </div>
          </motion.div>

          {/* GPS Proximity Badge */}
          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-800">
            <button
              onClick={onTriggerGps}
              disabled={isLocating}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-mono transition-all cursor-pointer group"
              title="Detect real browser GPS coordinates"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              )}
              <span>
                {isLocating
                  ? 'Acquiring Satellites...'
                  : userGps
                  ? `GPS Locked: ${userGps.lat.toFixed(3)}°, ${userGps.lng.toFixed(3)}°`
                  : 'Detect My Surroundings'}
              </span>
            </button>

            <button
              onClick={() => setShowSearchModal(true)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
              title="Search any city or locality"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick GPS Action for Mobile/Tablet */}
          <button
            onClick={onTriggerGps}
            disabled={isLocating}
            className="xl:hidden p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            title="Detect Live GPS"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <Navigation className="w-4 h-4 text-blue-400" />
            )}
          </button>

          {/* Simulate Duplicate Quick Trigger */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPreloadDuplicate}
            title="Simulate Case A: Submit a nearby report that triggers Haversine <= 50m and Cosine >= 0.75 duplicate match"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Duplicate (Case A)</span>
          </motion.button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => soundFx.toggle()}
            title={isSoundEnabled ? 'Audio Feedback Enabled (Click to Mute)' : 'Audio Feedback Muted (Click to Enable)'}
            aria-label="Toggle Sound Effects"
            className={`p-2 rounded-xl transition-all cursor-pointer border ${
              isSoundEnabled
                ? 'text-blue-400 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 shadow-sm shadow-blue-500/20'
                : 'text-slate-500 bg-slate-900 border-slate-800 hover:text-slate-300'
            }`}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset seed button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onResetData();
            }}
            title="Reset to default seed data"
            aria-label="Reset simulation data"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Nav View Switcher Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
            <button
              onClick={() => {
                soundFx.playClick();
                onViewChange('citizen');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                currentView === 'citizen'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onViewChange('admin');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 relative cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Command Center</span>
              {activeCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-red-500 text-white font-bold animate-pulse">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* City Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-md rounded-2xl glass-panel-elevated p-5 border border-blue-500/30 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Search City or Surroundings</span>
                </div>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter city or district (e.g. Bangalore, New York, Peenya, Indiranagar)..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex flex-wrap gap-1">
                    {['Bangalore', 'New York', 'London', 'San Francisco'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSearchQuery(city);
                          onSearchCity(city);
                          setShowSearchModal(false);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700"
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Locate</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
