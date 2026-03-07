import React from 'react';
import { CloudRain } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const MeteorologicalIntelPanel: React.FC = () => {
  const focalWeather = useSimulationStore(state => state.focalWeather);

  return (
    <div className="absolute top-28 left-4 z-40 flex flex-col gap-2 w-[220px] animate-in fade-in slide-in-from-left-4 duration-500">
       <div className="flex items-center gap-2 mb-1 px-1">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Regional Intelligence</span>
       </div>
       
       <div className="bg-slate-950/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <CloudRain className="text-cyan-400" size={24} />
                <div className="flex flex-col">
                   <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Weather</span>
                   <span className="text-lg font-black text-white leading-none tracking-tight text-glow">
                     {focalWeather.temp}°c
                   </span>
                </div>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-mono text-cyan-500/80 uppercase">
                  {focalWeather.description}
                </span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Umidade</span>
                <span className="text-xs font-black text-slate-200">{focalWeather.humidity}%</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Vento</span>
                <span className="text-xs font-black text-slate-200">{focalWeather.windSpeed} km/h</span>
             </div>
          </div>

          <div className="pt-1 flex items-center gap-2 group cursor-help">
             <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[65%]" />
             </div>
             <span className="text-[8px] text-cyan-500 font-black">SOLO_SAT: 65%</span>
          </div>
       </div>
    </div>
  );
};
