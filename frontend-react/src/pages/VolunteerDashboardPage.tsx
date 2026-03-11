import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { 
  CheckCircle2, 
  Trophy, 
  Clock, 
  Map as MapIcon, 
  LayoutGrid,
  ShieldCheck,
  Power
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { VolunteerTaskCard } from '../components/volunteer/VolunteerTaskCard';
import { useVolunteerStore } from '../store/volunteerStore';
import type { VolunteerTask } from '../types/volunteer';

// Mock data for initial visualization
const MOCK_TASKS: VolunteerTask[] = [
  {
    id: '1',
    title: 'Entrega de Mantimentos - Setor Norte',
    description: 'Necessário entrega de kits de higiene e água potável para 15 famílias isoladas no bairro Vila Esperança.',
    location: { lat: -21.115, lng: -42.935, address: 'Vila Esperança' },
    priority: 'high',
    status: 'available',
    category: 'delivery',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Triagem de Doações - Centro de Apoio',
    description: 'Auxílio na organização e separação de roupas e alimentos recebidos para distribuição imediata.',
    location: { lat: -21.125, lng: -42.945, address: 'Centro Comunitário' },
    priority: 'medium',
    status: 'available',
    category: 'logistics',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Apoio em Primeiro Socorros',
    description: 'Profissional de saúde ou socorrista para apoio na base avançada Beta.',
    location: { lat: -21.110, lng: -42.940, address: 'Base Avançada Beta' },
    priority: 'critical',
    status: 'available',
    category: 'first-aid',
    createdAt: new Date().toISOString()
  }
];

export function VolunteerDashboardPage() {
  const { tasks, setTasks, isOnline, toggleOnline, stats, setStats } = useVolunteerStore();

  useEffect(() => {
    // Simulate data fetch
    setTasks(MOCK_TASKS);
    setStats({
      activeTasks: 3,
      completedTasks: 12,
      impactScore: 850,
      hoursContributed: 42
    });
  }, []);

  const handlePickUpTask = (id: string) => {
    console.log('Picking up task:', id);
    // Logic to assign task would go here
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-6 p-4 md:p-6 overflow-hidden">
      {/* Header with Status Toggle */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 border border-white/10 p-5 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Painel do Voluntário</h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Coordenação tática e resposta comunitária em tempo real</p>
        </div>

        <button 
          onClick={toggleOnline}
          className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${
            isOnline 
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-800/50 border-white/5 text-slate-400 grayscale'
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors ${isOnline ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700'}`}>
            <Power size={18} strokeWidth={3} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Status</p>
            <p className="text-sm font-bold">{isOnline ? 'DISPONÍVEL / EM CAMPO' : 'OFFLINE'}</p>
          </div>
        </button>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar / List Section */}
        <section className="flex flex-col w-full md:w-[400px] gap-6 overflow-y-auto no-scrollbar pr-1">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard 
              title="Tarefas Ativas" 
              value={stats?.activeTasks ?? 0} 
              icon={<LayoutGrid size={16} />} 
              color="text-cyan-400"
            />
            <KpiCard 
              title="Concluídas" 
              value={stats?.completedTasks ?? 0} 
              icon={<CheckCircle2 size={16} />} 
              color="text-emerald-400"
            />
            <KpiCard 
              title="Pontuação XP" 
              value={stats?.impactScore ?? 0} 
              icon={<Trophy size={16} />} 
              color="text-amber-400"
            />
            <KpiCard 
              title="Horas SOS" 
              value={`${stats?.hoursContributed ?? 0}h`} 
              icon={<Clock size={16} />} 
              color="text-indigo-400"
            />
          </div>

          {/* Guidelines Mini Info */}
          <div className="bg-linear-to-br from-cyan-600 to-blue-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6" />
              <h3 className="font-bold uppercase tracking-tight">Segurança Primeiro</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              Sempre utilize seu equipamento de proteção e mantenha contato com a central. Em caso de risco, aborte a missão imediatamente.
            </p>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[.2em]">Missões Disponíveis</h2>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{tasks.length}</span>
            </div>
            {tasks.map(task => (
              <VolunteerTaskCard key={task.id} task={task} onPickUp={handlePickUpTask} />
            ))}
          </div>
        </section>

        {/* Map Section */}
        <section className="hidden md:block flex-1 rounded-[32px] overflow-hidden border border-white/5 relative shadow-2xl">
          <div className="absolute top-4 right-4 z-1000 space-y-2">
            <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                <MapIcon size={14} className="text-cyan-400" />
                <span>MAPA DE CALOR (SOS)</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Alta Prioridade</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Logística / Apoio</span>
                </div>
              </div>
            </div>
          </div>

          <MapContainer 
            center={[-21.1215, -42.9427]} 
            zoom={14} 
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer 
              attribution='&copy; CARTO' 
              url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
            />
            {tasks.map(task => (
              <Circle
                key={task.id}
                center={[task.location.lat, task.location.lng]}
                radius={200}
                pathOptions={{
                  fillColor: task.priority === 'critical' ? '#f43f5e' : task.priority === 'high' ? '#f59e0b' : '#3b82f6',
                  fillOpacity: 0.1,
                  color: 'transparent'
                }}
              />
            ))}
            {tasks.map(task => (
              <Marker key={task.id} position={[task.location.lat, task.location.lng]}>
                <Popup>
                  <div className="p-1">
                    <h4 className="font-bold text-slate-900">{task.title}</h4>
                    <p className="text-xs text-slate-600">{task.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>
      </div>
    </div>
  );
}
