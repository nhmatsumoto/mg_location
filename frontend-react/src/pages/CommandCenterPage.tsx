import { AlertTriangle, CloudRain, PackageOpen, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { LayerControl } from '../components/maps/LayerControl';
import { OperationalMap } from '../components/maps/OperationalMap';
import { KpiCard } from '../components/ui/KpiCard';
import { QuickActions } from '../components/ui/QuickActions';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { operationsApi, type OperationsSnapshot } from '../services/operationsApi';
import { useNotifications } from '../context/NotificationsContext';
import { buildLayersFromSnapshot } from '../utils/mapLayers';

const severityFromScore = (score: number) => {
  if (score >= 95) return 'emergencia' as const;
  if (score >= 85) return 'alerta' as const;
  if (score >= 75) return 'alto' as const;
  return 'moderado' as const;
};

export function CommandCenterPage() {
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pushNotice } = useNotifications();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setSnapshot(await operationsApi.snapshot());
    } catch {
      setSnapshot(null);
      setError('Falha ao consultar o backend. Verifique o serviço da API e CORS/proxy no frontend.');
      pushNotice({ type: 'warning', title: 'Falha de integração', message: 'Não foi possível carregar o snapshot operacional.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const hotspots = useMemo(() => snapshot?.layers.hotspots.slice(0, 5) ?? [], [snapshot]);
  const isEmpty = Boolean(snapshot && hotspots.length === 0 && snapshot.layers.missingPersons.length === 0 && snapshot.layers.riskAreas.length === 0);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
      <div className="space-y-4">
        <QuickActions />
        {error ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-sm text-rose-100">{error}</div>
        ) : null}
        {isEmpty ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-sm text-amber-100">
            Snapshot carregado sem registros operacionais. Rode o seed local (`python manage.py seed_rain_flood_map`).
          </div>
        ) : null}
        <OperationalMap data={snapshot} onRefresh={load} />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard title="Alertas críticos" value={snapshot?.kpis.criticalAlerts ?? '-'} subtitle="áreas em alto risco" icon={<AlertTriangle size={16} className="text-rose-300" />} />
          <KpiCard title="Equipes ativas" value={snapshot?.kpis.activeTeams ?? '-'} subtitle="grupos de resgate" icon={<Users size={16} className="text-cyan-300" />} />
          <KpiCard title="Chuva 24h" value={`${snapshot?.kpis.rain24hMm ?? '-'}mm`} subtitle={`Tempestade: ${snapshot?.weather.stormRisk ?? 'n/d'}`} icon={<CloudRain size={16} className="text-blue-300" />} />
          <KpiCard title="Suprimentos" value={snapshot?.kpis.suppliesInTransit ?? '-'} subtitle="em transporte" icon={<PackageOpen size={16} className="text-emerald-300" />} />
        </div>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Hotspots prioritários</h3>
            <button onClick={() => void load()} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800">{loading ? 'Atualizando…' : 'Atualizar'}</button>
          </div>
          <p className="mb-2 text-xs text-slate-400">Última atualização: {snapshot?.generatedAtUtc ? new Date(snapshot.generatedAtUtc).toLocaleString() : 'n/d'}</p>
          <ul className="space-y-2">
            {hotspots.map((spot) => (
              <li key={spot.id} className="rounded-lg border border-slate-700 bg-slate-950/50 p-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100">{spot.id}</p>
                  <SeverityBadge severity={severityFromScore(spot.score)} />
                </div>
                <p className="text-xs text-slate-300">{spot.type} · Score {spot.score}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-3">
          <h3 className="mb-1 text-sm font-semibold text-slate-100">Clima e situação</h3>
          <p className="text-xs text-slate-300">{snapshot?.weather.summary ?? 'Carregando informações climáticas operacionais...'}</p>
          <p className="mt-1 text-xs text-slate-400">Chuva próxima 24h: {snapshot?.weather.rainNext24hMm ?? 0} mm · Rajada máx: {snapshot?.weather.windGustKmh ?? 'n/d'} km/h</p>
        </section>

        <LayerControl layers={buildLayersFromSnapshot(snapshot)} />
      </div>
    </div>
  );
}
