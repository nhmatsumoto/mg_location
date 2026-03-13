import { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, Map as MapIcon, Users, Building2, Zap } from 'lucide-react';
import { riskApi, type RiskAssessment } from '../services/riskApi';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { useNotifications } from '../context/NotificationsContext';

export function RiskAssessmentPage() {
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [coords] = useState({ lat: -21.1149, lon: -42.9342 }); // Default HQ/Crisis Area

  const { pushNotice } = useNotifications();

  const load = async () => {
    setLoading(true);
    try {
      const data = await riskApi.getAssessment(coords.lat, coords.lon);
      setAssessment(data);
    } catch {
      pushNotice({ 
        type: 'error', 
        title: 'Falha no Cálculo', 
        message: 'Não foi possível processar a matriz de risco para esta área.' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSync = async () => {
    setLoading(true);
    try {
      await riskApi.pipelineSync();
      pushNotice({ 
        type: 'success', 
        title: 'Sincronização', 
        message: 'Pipeline de risco sincronizado com dados geográficos.' 
      });
      await load();
    } catch {
      pushNotice({ type: 'error', title: 'Erro', message: 'Falha ao sincronizar pipeline.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="text-amber-400" /> Matriz de Análise de Risco
          </h1>
          <p className="text-slate-400">Modelagem preditiva e avaliação de impacto em infraestrutura.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => void load()} 
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Recalcular
          </button>
          <button 
            onClick={() => void handleSync()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
          >
            <Zap size={16} /> Sync Pipeline
          </button>
        </div>
      </header>

      {loading && <LoadingOverlay message="Processando modelos preditivos..." />}

      {assessment && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex items-start gap-4">
              <div className="bg-cyan-500/10 p-2 rounded-lg"><Users className="text-cyan-400" /></div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">População Exposta</p>
                <p className="text-2xl font-bold text-white">{assessment.analytics.affectedPopulation.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">Estimativa baseada em densidade demográfica.</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex items-start gap-4">
              <div className="bg-amber-500/10 p-2 rounded-lg"><Building2 className="text-amber-400" /></div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Infraestrutura Crítica</p>
                <p className="text-2xl font-bold text-white">{assessment.analytics.criticalInfrastructureCount}</p>
                <p className="text-[10px] text-slate-500">Pontos sensíveis detectados no raio.</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex items-start gap-4">
              <div className="bg-rose-500/10 p-2 rounded-lg"><MapIcon className="text-rose-400" /></div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Modelo Ativo</p>
                <p className="text-2xl font-bold text-white">{assessment.model.name}</p>
                <p className="text-[10px] text-slate-500">Motor de risco: {assessment.model.version}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-300">Mapa de Calor Operacional (Backend Data)</h3>
              <div className="space-y-4">
                {assessment.riskMap.map((point, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                    <div>
                      <p className="text-xs font-mono text-slate-400">{point.lat.toFixed(4)}, {point.lon.toFixed(4)}</p>
                      <p className={`text-[10px] font-bold uppercase ${
                        point.severity === 'high' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        Impacto: {point.severity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-100">{(point.riskScore * 100).toFixed(0)}%</p>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${point.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} 
                          style={{ width: `${point.riskScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-full bg-slate-800 shadow-inner">
                <ShieldAlert size={48} className="text-slate-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-100">Análise de Impacto Concluída</h4>
                <p className="text-sm text-slate-400 max-w-xs">
                  A matriz de risco foi gerada com base nos parâmetros geográficos atuais.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
