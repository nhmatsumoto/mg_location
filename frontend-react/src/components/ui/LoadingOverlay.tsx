import React from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  variant?: 'fullscreen' | 'contained';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = "Sincronizando Dados...", 
  variant = 'fullscreen' 
}) => {
  const isFullscreen = variant === 'fullscreen';
  
  return (
    <div className={`
      ${isFullscreen ? 'fixed inset-0 z-[9999]' : 'absolute inset-0 z-[50] rounded-inherit'}
      flex flex-col items-center justify-center
      bg-slate-950/60 backdrop-blur-md
      transition-all duration-300 animate-in fade-in
    `}>
      <div className="relative flex flex-col items-center gap-4">
        {/* Decorative Glow */}
        <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        
        {/* Spinner & Icon */}
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          <ShieldAlert className="absolute w-5 h-5 text-cyan-400 opacity-50" />
        </div>
        
        {/* Message */}
        {message && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] animate-pulse">
              {message}
            </span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="w-1 h-1 bg-cyan-500/40 rounded-full animate-bounce" 
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Corner Accents (Tactical feel) */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-cyan-500/30" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-cyan-500/30" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-cyan-500/30" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-cyan-500/30" />
    </div>
  );
};
