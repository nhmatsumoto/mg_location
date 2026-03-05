import React from 'react';
import { useSplatStore, type QualityPreset } from '../../store/useSplatStore';
import { 
  RotateCcw, 
  Settings, 
  Info,
  Layers,
  Camera,
  Download
} from 'lucide-react';

interface SplatControlPanelProps {
  title: string;
  onReset?: () => void;
  onTakeScreenshot?: () => void;
}

export const SplatControlPanel: React.FC<SplatControlPanelProps> = ({ 
  title, 
  onReset,
  onTakeScreenshot 
}) => {
  const { quality, setQuality } = useSplatStore();

  return (
    <div className="absolute top-6 left-6 z-40 flex flex-col gap-4 pointer-events-none">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-white/10 p-4 rounded-2xl backdrop-blur-xl pointer-events-auto shadow-2xl flex flex-col gap-1 min-w-[240px]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-[10px] font-black text-white uppercase tracking-widest">{title}</h2>
        </div>
        <p className="text-[9px] text-slate-400 font-mono">GAUSSIAN SPLATTING • 3D RECONSTRUCTION</p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 pointer-events-auto">
        <ControlButton onClick={onReset} icon={<RotateCcw size={16} />} label="Reset Cam" />
        <ControlButton onClick={onTakeScreenshot} icon={<Camera size={16} />} label="Snap" />
        <ControlButton onClick={() => {}} icon={<Download size={16} />} label="Export" />
      </div>

      {/* Settings Panel */}
      <div className="bg-slate-900/80 border border-white/10 p-3 rounded-2xl backdrop-blur-xl pointer-events-auto shadow-2xl flex flex-col gap-3 min-w-[200px]">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Render Quality</span>
          <Settings className="w-3 h-3 text-slate-500" />
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          {(['LOW', 'MEDIUM', 'HIGH'] as QualityPreset[]).map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition-all border ${
                quality === q 
                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Stats/Help */}
      <div className="bg-slate-900/60 border border-white/5 p-3 rounded-2xl backdrop-blur-lg pointer-events-auto shadow-xl flex items-start gap-3 max-w-[240px]">
        <Info className="w-4 h-4 text-cyan-500/50 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          Use the mouse to orbit (Left), pan (Right), and zoom (Scroll). Point cloud fidelity depends on the quality preset.
        </p>
      </div>
    </div>
  );
};

const ControlButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="bg-slate-900/80 border border-white/10 w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-xl group relative"
  >
    {icon}
    <span className="absolute left-12 bg-slate-950 border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {label}
    </span>
  </button>
);
