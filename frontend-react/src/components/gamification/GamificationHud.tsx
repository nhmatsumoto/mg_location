import { Trophy, Star } from 'lucide-react';

interface GamificationHudProps {
  xp: number;
  level: number;
  rank: string;
  nextLevelXp: number;
  className?: string;
}

export function GamificationHud({ xp, level, rank, nextLevelXp, className = '' }: GamificationHudProps) {
  const progress = (xp / nextLevelXp) * 100;

  return (
    <div className={`glass-panel p-4 rounded-2xl flex items-center gap-4 ${className}`}>
      <div className="relative">
        <div className="level-badge h-12 w-12 rounded-full flex items-center justify-center text-white font-black text-xl border-2 border-white/20">
          {level}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-1 shadow-lg">
          <Trophy size={12} className="text-amber-900" />
        </div>
      </div>

      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="rank-text text-sm uppercase tracking-tighter">{rank}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{xp} / {nextLevelXp} XP</span>
        </div>
        
        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-out progress-bar-glow"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/10">
        <div className="flex flex-col items-center">
          <Star size={16} className="text-amber-400 fill-amber-400/20" />
          <span className="text-[9px] font-bold text-slate-400 mt-0.5">BADGES</span>
          <span className="text-xs font-black text-white">12</span>
        </div>
      </div>
    </div>
  );
}
