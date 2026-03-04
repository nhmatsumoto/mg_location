import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">sos-location</p>
      <h1 className="mt-2 text-4xl font-bold">Plataforma de resposta e transparência</h1>
      <p className="mt-3 max-w-2xl text-slate-300">Monitoramento em tempo real de hotspots, operações e pessoas desaparecidas com mapa operacional integrado.</p>
      <div className="mt-6 flex gap-3">
        <Link className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950" to="/public/map">Mapa público</Link>
        <Link className="rounded-lg border border-slate-600 px-4 py-2" to="/login">Entrar</Link>
      </div>
    </main>
  );
}
