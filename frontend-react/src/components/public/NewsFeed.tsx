import React from 'react';
import type { NewsNotification } from '../../services/newsApi';
import { Calendar, MapPin, ExternalLink, Info, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewsFeedProps {
  news: NewsNotification[];
  isLoading: boolean;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card animate-pulse h-32 rounded-2xl border border-white/5 bg-white/5" />
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-4 text-center">
        <div className="h-16 w-16 glass-card rounded-full flex items-center justify-center mb-2">
           <Info size={32} className="text-slate-600" />
        </div>
        <p className="text-lg font-black text-slate-300">Nenhum evento detectado.</p>
        <p className="text-sm font-medium tracking-tight text-slate-500">Tente ajustar seus filtros ou aguarde novas indexações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {news.map((item) => (
        <div 
          key={item.id} 
          className="group glass-card relative bg-white/2 hover:bg-white/5 transition-all duration-500 rounded-3xl p-6 border border-white/5 hover:border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className={`absolute -top-4 -left-4 w-12 h-12 blur-2xl opacity-20 ${
            item.category === 'Disaster' ? 'bg-rose-500/40' : 
            item.category === 'Weather' ? 'bg-amber-500/40' : 'bg-blue-500/40'
          }`} />

          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <span className={`h-1.5 w-1.5 rounded-full ${
                        item.riskScore > 80 ? 'bg-rose-500' :
                        item.riskScore > 50 ? 'bg-orange-500' : 'bg-emerald-500'
                     } shadow-[0_0_8px_currentColor]`} />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.category}</span>
                  </div>
                  <h3 className="text-base font-black text-white leading-tight group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
               </div>
               
               <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                    {item.source}
                  </span>
                  <div className={`text-[11px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                    item.riskScore > 80 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    item.riskScore > 50 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    <Trophy size={10} className="opacity-60" />
                    {item.riskScore.toFixed(0)}%
                  </div>
               </div>
            </div>

            <p className="text-slate-400 line-clamp-2 text-[13px] leading-relaxed font-medium">
              {item.content}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
               <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-600" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-600" />
                    <span className="tabular-nums opacity-60">
                      {format(new Date(item.publishedAt), "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
               </div>

               {item.externalUrl && (
                 <a 
                   href={item.externalUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
                   title="Abrir Fonte"
                 >
                   <ExternalLink size={14} />
                 </a>
               )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
