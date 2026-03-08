import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ShieldAlert, Home, RefreshCw, Lock } from 'lucide-react';

export function ErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code') || '500';
  
  const errorConfigs = {
    '401': {
      title: 'ACESSO NEGADO',
      message: 'Sua sessão expirou ou você não tem permissão para acessar este recurso.',
      icon: <Lock className="w-16 h-16 text-amber-500" />,
      action: () => window.location.reload(),
      actionLabel: 'RE-AUTENTICAR',
    },
    '404': {
      title: 'SETOR NÃO ENCONTRADO',
      message: 'O recurso ou página que você está tentando acessar não existe no sistema.',
      icon: <AlertCircle className="w-16 h-16 text-blue-500" />,
      action: () => navigate('/'),
      actionLabel: 'RETORNAR AO HQ',
    },
    '500': {
      title: 'FALHA NO SISTEMA',
      message: 'Ocorreu um erro crítico interno. Nossa equipe técnica foi notificada.',
      icon: <ShieldAlert className="w-16 h-16 text-rose-500" />,
      action: () => navigate('/'),
      actionLabel: 'REINICIAR TERMINAL',
    },
  };

  const config = errorConfigs[code as keyof typeof errorConfigs] || errorConfigs['500'];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[20px_20px]"></div>
      </div>
      
      <div className="max-w-md w-full border border-white/10 bg-slate-900/50 backdrop-blur-xl p-8 rounded-lg shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-white/5 rounded-full border border-white/10 animate-pulse">
            {config.icon}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              ERROR_{code}
            </h1>
            <h2 className={`text-sm font-bold tracking-widest uppercase py-1 px-3 rounded inline-block ${
              code === '500' ? 'bg-rose-500/20 text-rose-400' : 
              code === '401' ? 'bg-amber-500/20 text-amber-400' : 
              'bg-blue-500/20 text-blue-400'
            }`}>
              {config.title}
            </h2>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            {config.message}
          </p>

          <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={config.action}
              className={`flex items-center justify-center gap-2 py-3 rounded font-bold text-xs tracking-widest transition-all ${
                code === '500' ? 'bg-rose-600 hover:bg-rose-500 text-white' : 
                code === '401' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 
                'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {config.actionLabel}
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 py-3 rounded font-bold text-xs tracking-widest border border-white/5 hover:bg-white/5 text-slate-400 transition-all"
            >
              <Home className="w-4 h-4" />
              HQ PRINCIPAL
            </button>
          </div>
        </div>
      </div>

      {/* Grid footer decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-cyan-500/10 to-transparent pointer-events-none"></div>
    </div>
  );
}
