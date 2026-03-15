import React, { useState, useEffect } from 'react';
import { Cpu, Database, Globe, ShieldCheck } from 'lucide-react';

export const TacticalLoadingScreen: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootSequence = [
    "INITIALIZING_TACTICAL_KERNEL_V4.2...",
    "CONNECTING_TO_GEOSPATIAL_UPLINK_HUB...",
    "FETCHING_OSM_BUILDING_METADATA...",
    "CALIBRATING_TOPOGRAPHIC_MESH_GEN...",
    "LOADING_HOLOGRAPHIC_SHADERS...",
    "SYNCING_REALTIME_INCIDENT_STREAM...",
    "SYSTEM_READY_STATUS_OK"
  ];

  useEffect(() => {
    let currentIdx = 0;
    const logInterval = setInterval(() => {
      if (currentIdx < bootSequence.length) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${bootSequence[currentIdx]}`]);
        currentIdx++;
      } else {
        clearInterval(logInterval);
      }
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + Math.random() * 5 : 100));
    }, 100);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-mono text-cyan-400">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-40"></div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-20">
        <div className="w-full h-[5px] bg-cyan-400 blur-[2px] animate-scanline"></div>
      </div>
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <div className="z-20 flex flex-col items-center gap-10 max-w-3xl w-full px-12">
        {/* Core Icon with Glow */}
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full scale-150 animate-pulse transition-all duration-700 group-hover:scale-175 group-hover:bg-cyan-400/40" />
          <div className="w-24 h-24 glass-panel rounded-3xl flex items-center justify-center relative border-white/20 shadow-2xl animate-glitch">
             <Cpu className="w-12 h-12 text-cyan-400 animate-spin-slow drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
             <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 rounded-full animate-ping opacity-75" />
             <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          </div>
        </div>

        <div className="w-full space-y-8">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-black tracking-[0.4em] uppercase font-display bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic animate-pulse">
              TACTICAL_KERNEL_BOOT
            </h1>
            <p className="text-[10px] text-cyan-500/50 tracking-[0.5em] uppercase font-bold">Initializing Geospatial Defense Protocol</p>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black tracking-widest uppercase mb-1">
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 bg-cyan-400 rounded-full animate-ping"></span>
                Calibrating Neural Mesh
              </span>
              <span className="text-cyan-400 font-mono">{Math.floor(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-cyan-950/20 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent"></div>
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) shadow-[0_0_20px_hsla(var(--primary),0.6)] relative z-10" 
                style={{ width: `${progress}%` }} 
              >
                <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-12"></div>
              </div>
            </div>
          </div>

          {/* Log Stream with better aesthetics */}
          <div className="h-40 glass-panel rounded-2xl p-6 overflow-hidden flex flex-col gap-2 relative group hover:border-white/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/20 group-hover:bg-cyan-500/40 transition-colors"></div>
            {logs.slice(-5).map((log, i) => (
              <div key={i} className={`text-[10px] font-mono whitespace-nowrap overflow-hidden transition-all duration-500 flex items-center ${i === 4 ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-2 scale-95'}`}>
                <span className="text-cyan-500/30 font-bold mr-3">[{i + 1}]</span>
                <span className="text-cyan-400/90">{log}</span>
              </div>
            ))}
            {logs.length < 5 && (
              <div className="flex items-center gap-2 text-[10px] text-cyan-500/30 italic font-mono animate-pulse">
                <ShieldCheck size={12} />
                Verifying system checksums...
              </div>
            )}
          </div>
        </div>

        {/* Loading Footer Stats - Improved Layout */}
        <div className="flex justify-between w-full border-t border-white/10 pt-8 mt-4">
          <Stat icon={<ShieldCheck size={14} className="text-emerald-400" />} label="Security" value="MIL-SPEC-256" />
          <div className="w-px h-8 bg-white/5"></div>
          <Stat icon={<Globe size={14} className="text-cyan-400" />} label="Uplink" value="94.2% ACTIVE" />
          <div className="w-px h-8 bg-white/5"></div>
          <Stat icon={<Database size={14} className="text-blue-400" />} label="Cache" value="HYPER_SYNC" />
        </div>
      </div>

      {/* Extreme Visuals - Dynamic Corner Data */}
      <div className="absolute top-8 left-8 text-[9px] font-black text-cyan-900/60 flex flex-col font-mono tracking-widest gap-1">
        <span className="flex items-center gap-2">
          <div className="w-3 h-1 bg-cyan-500/30"></div>
          X_COORD: {Math.random().toFixed(4)}
        </span>
        <span className="flex items-center gap-2">
          <div className="w-3 h-1 bg-cyan-500/30"></div>
          Y_COORD: {Math.random().toFixed(4)}
        </span>
      </div>
      <div className="absolute bottom-8 right-8 text-[9px] font-black text-cyan-900/60 flex flex-col font-mono tracking-widest text-right gap-1">
        <span>ENCRYPT // SHARD_ {Math.floor(Math.random() * 1000)}</span>
        <span>AUTH_STATUS // GRANTED</span>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex flex-col items-center gap-1.5 group cursor-default">
    <div className="transition-transform duration-500 group-hover:scale-110">{icon}</div>
    <span className="text-[8px] text-slate-500 uppercase font-black tracking-[0.2em]">{label}</span>
    <span className="text-[10px] font-black tracking-widest text-white group-hover:text-cyan-400 transition-colors uppercase">{value}</span>
  </div>
);
