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
    <div className="absolute top-4 left-4 right-4 z-50 glass-panel px-6 h-20 flex items-center justify-between rounded-[2rem] border border-white/10 ring-1 ring-white/10 ring-inset pointer-events-auto animate-fade-in shadow-2xl bg-mesh hover:shadow-cyan-500/10 transition-shadow duration-700">
      {/* Brand & Search */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-white/20 relative group overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <ShieldAlert size={24} fill="rgba(255,255,255,0.2)" className="relative z-10" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white uppercase tracking-[0.4em] leading-none mb-1.5 flex items-center gap-2 font-display">
              SOS <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">FIELD</span> COMMAND
            </h1>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-[0.2em] font-black opacity-60">System Ready // v5.2.0-PRO</span>
            </div>
          </div>
        </div>

        <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        
        <div className="flex items-center gap-3">
          <CitySearch onSelect={onSearchSelect} />
          <div className="scale-95 opacity-90 hover:opacity-100 transition-all duration-300">
            <CountryDropdown value={country} onChange={setCountry} />
          </div>
        </div>
      </div>

      {/* Center Section: KPIs */}
      <div className="hidden 2xl:flex items-center gap-10 px-10 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        {[
          { label: 'Equipes', value: stats?.activeTeams, icon: Users, color: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
          { label: 'Alertas', value: stats?.criticalAlerts, icon: Activity, color: 'text-rose-400', glow: 'shadow-rose-500/20' },
          { label: 'Logística', value: stats?.supplies, icon: PackageOpen, color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
          { label: 'Missing', value: stats?.missingPersons, icon: MapPin, color: 'text-orange-400', glow: 'shadow-orange-500/20' }
        ].map((kpi, idx) => (
          <div key={idx} className="flex items-center gap-4 group cursor-help animate-stagger-1" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className={`h-11 w-11 glass-card rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${kpi.glow} ${kpi.color}`}>
              <kpi.icon size={20} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1 group-hover:text-slate-400 transition-colors">{kpi.label}</span>
              <span className="text-base font-black text-white leading-none tracking-tight">{kpi.value || '0'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Right Section: Climate & Tools */}
      <div className="flex items-center gap-6">
        {/* Climate HUD */}
        <div className="hidden lg:flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 group hover:border-cyan-500/30 transition-all duration-500">
          <div className="relative">
            <CloudRain size={18} className="text-cyan-400 relative z-10" />
            <div className="absolute inset-0 bg-cyan-400 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>
          <div className="flex flex-col min-w-[75px]">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Environmental</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-white leading-none">{stats?.climate?.temp ?? '24'}°C</span>
              <div className="h-3 w-px bg-white/10" />
              <span className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-tight truncate max-w-[70px]">{stats?.climate?.description || 'Operational'}</span>
            </div>
          </div>
        </div>

        <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Tactical Tools */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
          <ToolButton active={activeTool === 'inspect'} onClick={() => setTool('inspect')} icon={<MousePointer2 size={18} />} label="Inspect" hideLabel className="scale-95 hover:bg-white/10 rounded-xl" />
          <ToolButton active={activeTool === 'point'} onClick={() => setTool('point')} icon={<MapPin size={18} />} label="Mark" hideLabel className="scale-95 hover:bg-white/10 rounded-xl" />
          <ToolButton active={activeTool === 'area'} onClick={() => setTool('area')} icon={<Box size={18} />} label="Area" hideLabel className="scale-95 hover:bg-white/10 rounded-xl" />
          <div className="h-5 w-px bg-white/10 mx-1" />
          <ToolButton active={activeTool === 'snapshot'} onClick={() => setTool('snapshot')} icon={<Camera size={18} />} label="Snapshot" hideLabel className="scale-95 hover:bg-white/10 rounded-xl" />
        </div>

        <button
          onClick={onReset}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all active:scale-90 shadow-xl group overflow-hidden relative"
          title="Recalibrate System"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/0 to-cyan-500/10 group-hover:to-cyan-500/20"></div>
          <Crosshair size={22} className="relative z-10 group-hover:rotate-180 transition-transform duration-700" />
        </button>
      </div>
    </div>
  );
};
