import React from 'react';

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Iniciando sistemas de segurança...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]" />

      <div className="relative flex flex-col items-center">
        {/* Animated Logo Placeholder */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-2 border-2 border-cyan-400/40 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
          <div className="absolute inset-4 border-t-2 border-cyan-300 rounded-full animate-[spin_1s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xl font-bold tracking-[0.3em] uppercase text-cyan-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            SOS Location
          </h1>
          <p className="text-xs text-slate-400 tracking-wider font-light italic mt-2 animate-pulse">
            {message}
          </p>
        </div>

        {/* Progress bar line */}
        <div className="h-px w-48 bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-cyan-500/50 animate-[loadingLine_2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes loadingLine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
