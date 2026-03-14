import { Globe, AlertCircle, Clock } from 'lucide-react';

export function GlobalDisastersPage() {
  const globalEvents = [
    { id: 1, name: 'Ciclone Tropical - Pacífico Sul', status: 'Monitorando', severity: 'Alta', lastUpdate: '10m atrás' },
    { id: 2, name: 'Sismo 6.2 - Indonésia', status: 'Avaliação de Impacto', severity: 'Crítica', lastUpdate: '1h atrás' },
    { id: 3, name: 'Incêndios Florestais - Austrália', status: 'Ativo', severity: 'Média', lastUpdate: '4h atrás' },
  ];

  return (
    <div className="space-y-6 p-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Globe className="text-cyan-400" /> Eventos Globais de Desastre
        </h1>
        <p className="text-slate-400">Monitoramento em tempo real de crises internacionais via GDACS e fontes parceiras.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {globalEvents.map(event => (
          <div key={event.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                event.severity === 'Crítica' ? 'bg-rose-500/20 text-rose-400' : 
                event.severity === 'Alta' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {event.severity}
              </span>
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <Clock size={12} /> {event.lastUpdate}
              </span>
            </div>
            <h3 className="font-semibold text-slate-100 mb-1">{event.name}</h3>
            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
              <AlertCircle size={14} className="text-cyan-500" /> {event.status}
            </p>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-700">
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>

      <section className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4">
          <Globe className="text-cyan-400" size={32} />
        </div>
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Mapa Global Interativo</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Integração com Mapbox e camadas do Sentinel-2 pendente. O monitoramento tático nacional tem prioridade sobre a visualização global no momento.
        </p>
      </section>
    </div>
  );
}
