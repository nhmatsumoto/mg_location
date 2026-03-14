import { ShieldAlert, Box, Crosshair, MousePointer2, MapPin, Camera, Activity, Users, PackageOpen, CloudRain } from 'lucide-react';
import { CitySearch } from './CitySearch';
import { CountryDropdown } from './CountryDropdown';
import { ToolButton } from './ToolButton';

interface SOSHeaderHUDProps {
  country: string;
  setCountry: (val: string) => void;
  onReset: () => void;
  activeTool: string;
  setTool: (tool: any) => void;
  stats?: {
    activeTeams: string | number;
    criticalAlerts: string | number;
    supplies: string | number;
    missingPersons?: string | number;
    climate?: {
      temp: number;
      humidity: number;
      windSpeed: number;
      description: string;
    };
  };
  onSearchSelect?: (lat: number, lon: number, displayName: string) => void;
}

export const SOSHeaderHUD: React.FC<SOSHeaderHUDProps> = ({
  country, setCountry, onReset, activeTool, setTool, stats, onSearchSelect
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-50 glass-panel px-6 h-20 flex items-center justify-between rounded-3xl border border-white/10 ring-1 ring-white/5 ring-inset pointer-events-auto animate-fade-in shadow-2xl">
      {/* Brand & Search */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-900/40 border border-white/20">
            <ShieldAlert size={24} fill="rgba(255,255,255,0.2)" className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white uppercase tracking-[0.3em] leading-none mb-1.5 flex items-center gap-2">
              SOS <span className="text-cyan-400">FIELD</span> COMMAND
            </h1>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-black">Node: BRA-SEC-01 // v5.2</span>
            </div>
          </div>
        </div>

        <div className="h-10 w-px bg-white/10" />
        
        <div className="flex items-center gap-3">
          <CitySearch onSelect={onSearchSelect} />
          <div className="scale-90 opacity-80 hover:opacity-100 transition-opacity">
            <CountryDropdown value={country} onChange={setCountry} />
          </div>
        </div>
      </div>

      {/* Center Section: KPIs */}
      <div className="hidden 2xl:flex items-center gap-8 px-8 py-2.5 rounded-2xl bg-white/2 border border-white/5">
        {[
          { label: 'Equipes', value: stats?.activeTeams, icon: Users, color: 'text-cyan-400' },
          { label: 'Alertas', value: stats?.criticalAlerts, icon: Activity, color: 'text-rose-400' },
          { label: 'Logística', value: stats?.supplies, icon: PackageOpen, color: 'text-emerald-400' },
          { label: 'Missing', value: stats?.missingPersons, icon: MapPin, color: 'text-orange-400' }
        ].map((kpi, idx) => (
          <div key={idx} className="flex items-center gap-4 group cursor-help">
            <div className={`h-10 w-10 glass-card rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${kpi.color}`}>
              <kpi.icon size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{kpi.label}</span>
              <span className="text-sm font-black text-white leading-none">{kpi.value || '0'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Right Section: Climate & Tools */}
      <div className="flex items-center gap-6">
        {/* Climate HUD */}
        <div className="hidden lg:flex items-center gap-3 bg-white/2 px-4 py-2 rounded-2xl border border-white/5 group">
          <CloudRain size={16} className="text-cyan-400 group-hover:animate-bounce" />
          <div className="flex flex-col min-w-[70px]">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Local Clima</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-white leading-none">{stats?.climate?.temp ?? '24'}°C</span>
              <div className="h-3 w-px bg-white/10" />
              <span className="text-[9px] font-bold text-cyan-400/70 uppercase tracking-tighter truncate max-w-[60px]">{stats?.climate?.description || 'Limpo'}</span>
            </div>
          </div>
        </div>

        <div className="h-10 w-px bg-white/10" />

        {/* Tactical Tools */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/2 border border-white/5">
          <ToolButton active={activeTool === 'inspect'} onClick={() => setTool('inspect')} icon={<MousePointer2 size={18} />} label="Inspect" hideLabel className="scale-95 hover:bg-white/10" />
          <ToolButton active={activeTool === 'point'} onClick={() => setTool('point')} icon={<MapPin size={18} />} label="Mark" hideLabel className="scale-95 hover:bg-white/10" />
          <ToolButton active={activeTool === 'area'} onClick={() => setTool('area')} icon={<Box size={18} />} label="Area" hideLabel className="scale-95 hover:bg-white/10" />
          <div className="h-5 w-px bg-white/10 mx-1" />
          <ToolButton active={activeTool === 'snapshot'} onClick={() => setTool('snapshot')} icon={<Camera size={18} />} label="Snapshot" hideLabel className="scale-95 hover:bg-white/10" />
        </div>

        <button
          onClick={onReset}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/2 text-slate-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all active:scale-90 shadow-xl"
          title="Recalibrate System"
        >
          <Crosshair size={20} />
        </button>
      </div>
    </div>
  );
};
