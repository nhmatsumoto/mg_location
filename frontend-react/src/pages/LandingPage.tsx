import { Link, useNavigate } from 'react-router-dom';
import { keycloak } from '../lib/keycloak';

export function LandingPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    if (keycloak.authenticated) {
      navigate('/app/sos');
    } else {
      keycloak.login();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100 selection:bg-cyan-500/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative animate-in fade-in zoom-in duration-1000 ease-out fill-mode-both">
        <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-bold mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
          // sos-location system v1.2
        </p>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          Plataforma de <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">resposta crítica</span> e transparência
        </h1>
        
        <p className="mt-6 max-w-2xl text-slate-400 text-lg leading-relaxed mx-auto">
          Monitoramento tático de hotspots, operações de resgate e pessoas desaparecidas com visualização 3D e inteligência situacional integrada.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <Link 
            className="group relative overflow-hidden rounded-xl bg-cyan-600 px-8 py-3.5 font-bold text-white shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] active:scale-95" 
            to="/public/map"
          >
            <span className="relative z-10">Explorar Mapa Público</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
          </Link>

          <Link 
            className="group relative overflow-hidden rounded-xl border border-cyan-500/30 bg-cyan-950/10 px-8 py-3.5 font-bold text-cyan-100 backdrop-blur-sm transition-all hover:bg-cyan-900/20 hover:border-cyan-400 active:scale-95" 
            to="/public/info"
          >
            <span className="relative z-10">Saiba Mais</span>
          </Link>
          
          <button 
            className="rounded-xl border border-slate-700 bg-slate-900/50 px-8 py-3.5 font-bold text-slate-200 backdrop-blur-sm transition-all hover:bg-slate-800 hover:border-slate-500 active:scale-95"
            onClick={handleLogin}
          >
            {keycloak.authenticated ? 'Acessar War Room' : 'Login Operacional'}
          </button>
        </div>
      </div>
    </main>
  );
}
