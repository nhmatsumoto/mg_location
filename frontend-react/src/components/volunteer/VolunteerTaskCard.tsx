import { MapPin, Clock, AlertCircle } from 'lucide-react';
import type { VolunteerTask } from '../../types/volunteer';

interface VolunteerTaskCardProps {
  task: VolunteerTask;
  onPickUp: (taskId: string) => void;
}

export function VolunteerTaskCard({ task, onPickUp }: VolunteerTaskCardProps) {
  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 transition-all hover:bg-slate-800/60 hover:shadow-xl hover:shadow-cyan-500/10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{task.category}</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors uppercase tracking-tight">
            {task.title}
          </h3>
        </div>
        <div className="bg-slate-800/80 p-2 rounded-xl border border-white/5">
          <AlertCircle size={18} className={task.priority === 'critical' ? 'text-rose-400 animate-pulse' : 'text-slate-400'} />
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-400 leading-relaxed line-clamp-2">
        {task.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-700/50 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <MapPin size={14} className="text-cyan-400" />
          <span>{task.location.address || 'Localização no mapa'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Clock size={14} className="text-slate-500" />
          <span>Postado há 2h</span>
        </div>
      </div>

      <button
        onClick={() => onPickUp(task.id)}
        className="mt-5 w-full rounded-xl bg-cyan-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-[0.98] uppercase tracking-widest"
      >
        Assumir Tarefa
      </button>
    </div>
  );
}
