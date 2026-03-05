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
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-mono text-cyan-500">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #0891b2 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Scanning Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/30 blur-sm animate-scan-fast z-10" />

      <div className="z-20 flex flex-col items-center gap-8 max-w-2xl w-full px-8">
        {/* Core Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="w-20 h-20 border-2 border-cyan-500 rounded-2xl flex items-center justify-center relative group">
             <Cpu className="w-10 h-10 animate-spin-slow" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
          </div>
        </div>

        <div className="w-full space-y-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-xl font-black tracking-[0.3em] uppercase italic">Motor Tático Ativo</h1>
            <p className="text-[10px] text-cyan-500/60 tracking-widest uppercase">Geospatial Intelligence Engine v4.2.0-stable</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold tracking-tighter uppercase">
              <span>Sincronizando Malha...</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="h-1 w-full bg-cyan-900/30 rounded-full overflow-hidden border border-cyan-500/20">
              <div 
                className="h-full bg-cyan-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          {/* Log Stream */}
          <div className="h-32 bg-slate-900/50 border border-cyan-500/10 rounded-xl p-4 overflow-hidden flex flex-col gap-1.5 backdrop-blur-md">
            {logs.slice(-5).map((log, i) => (
              <div key={i} className={`text-[10px] whitespace-nowrap overflow-hidden transition-all duration-300 ${i === 4 ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-2'}`}>
                <span className="text-cyan-600/50 mr-2">&gt;</span>
                {log}
              </div>
            ))}
            {logs.length < 5 && <div className="text-[10px] text-cyan-900 italic animate-pulse">Initializing bios uplink...</div>}
          </div>
        </div>

        {/* Loading Footer Stats */}
        <div className="grid grid-cols-3 gap-8 w-full border-t border-cyan-500/10 pt-6">
          <Stat icon={<ShieldCheck size={12} />} label="Security" value="Encrypted" />
          <Stat icon={<Globe size={12} />} label="Source" value="OSM/DEM" />
          <Stat icon={<Database size={12} />} label="Buffer" value="256MB" />
        </div>
      </div>

      {/* Extreme Visuals - Corner Coordinates */}
      <div className="absolute top-6 left-6 text-[8px] text-cyan-900 flex flex-col font-mono opacity-50">
        <span>LAT_CALIBRATION_HUB_42</span>
        <span>LON_AUTO_OFFSET_SYNC</span>
      </div>
      <div className="absolute bottom-6 right-6 text-[8px] text-cyan-900 flex flex-col font-mono opacity-50 text-right">
        <span>ENCRYPT_LEVEL_AES_256</span>
        <span>UPLINK_STRENGTH_94.2%</span>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="text-cyan-500/40">{icon}</div>
    <span className="text-[8px] text-cyan-900 uppercase font-black tracking-tighter">{label}</span>
    <span className="text-[9px] font-bold tracking-widest">{value}</span>
  </div>
);
