import type { ReactNode } from 'react';

export function KpiCard({ title, value, trend, icon, color = "text-slate-50" }: { title: string; value: string | number; trend?: string; icon?: ReactNode; color?: string }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-md shadow-2xl transition-all hover:bg-slate-900/60 hover:border-white/20">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-cyan-500/5 blur-3xl transition-all group-hover:bg-cyan-500/10" />
      
      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 group-hover:text-cyan-400 transition-colors">
            {icon}
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p>
          {trend && (
            <span className="text-[10px] font-bold text-emerald-400/80 bg-emerald-400/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">
              {trend}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
