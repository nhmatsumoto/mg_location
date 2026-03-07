import React from 'react';
import { ShieldAlert, Box, Crosshair } from 'lucide-react';
import { CountryDropdown } from './CountryDropdown';

interface SOSHeaderHUDProps {
  country: string;
  setCountry: (val: string) => void;
  show3D: boolean;
  setShow3D: (val: boolean) => void;
  onReset: () => void;
}

export const SOSHeaderHUD: React.FC<SOSHeaderHUDProps> = ({ country, setCountry, show3D, setShow3D, onReset }) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-50 flex justify-between pointer-events-none">
      <div className="flex gap-4 items-center bg-slate-900/80 border border-white/10 p-2 rounded-2xl backdrop-blur-xl pointer-events-auto shadow-2xl">
        <ShieldAlert className="h-5 w-5 text-cyan-400" />
        <div className="flex flex-col">
          <h1 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">SOS TERMINAL</h1>
          <span className="text-[8px] text-cyan-500/70 font-mono">STATUS: OPERATIONAL_v4</span>
        </div>
        <div className="h-4 w-px bg-white/10 mx-2" />
        <CountryDropdown value={country} onChange={setCountry} />
      </div>

      <div className="flex gap-2 pointer-events-auto">
         <button onClick={() => setShow3D(!show3D)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl transition-all ${show3D ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'}`}>
           <Box size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">TACTICAL 3D</span>
         </button>
         <button 
           onClick={onReset} 
           className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900/80 text-slate-400 hover:text-white backdrop-blur-xl transition-all"
           title="Reset View"
         >
           <Crosshair size={16} />
         </button>
      </div>
    </div>
  );
};
