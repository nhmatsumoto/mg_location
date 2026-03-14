import { Target, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  type: 'report' | 'validate' | 'rescue';
}

const mockMissions: Mission[] = [
  { id: '1', title: 'Validar 3 áreas de risco', reward: 500, completed: false, type: 'validate' },
  { id: '2', title: 'Reportar inundação ativa', reward: 300, completed: true, type: 'report' },
  { id: '3', title: 'Confirmar status de equipe', reward: 200, completed: false, type: 'rescue' },
];

export function MissionsPanel() {
  return (
    <div className="glass-panel w-[320px] rounded-[2.5rem] flex flex-col border border-white/10 shadow-2xl overflow-hidden animate-panel">
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em]">Operações</h3>
            <p className="text-xl font-black text-white">Missões Ativas</p>
          </div>
          <div className="h-10 w-10 glass-card rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Target size={18} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-8 custom-scrollbar">
        {mockMissions.map((mission) => (
          <div 
            key={mission.id} 
            className={`glass-card p-4 rounded-2xl border flex items-center justify-between group cursor-pointer transition-all ${
              mission.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/2 border-white/5 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
               <div className={mission.completed ? 'text-emerald-400' : 'text-slate-500 group-hover:text-cyan-400 transition-colors'}>
                  {mission.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
               </div>
               <div className="space-y-0.5">
                  <p className={`text-xs font-black leading-tight ${mission.completed ? 'text-emerald-400/80 line-through' : 'text-slate-200'}`}>
                    {mission.title}
                  </p>
                  <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-tighter">
                    +{mission.reward} XP
                  </p>
               </div>
            </div>
            
            {!mission.completed && (
              <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            )}
          </div>
        ))}
      </div>

      <div className="p-6 bg-black/40 border-t border-white/5 mt-auto">
         <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500">Bônus Diário</span>
            <span className="text-amber-400">80%</span>
         </div>
         <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
         </div>
      </div>
    </div>
  );
}
