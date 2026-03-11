import { useEffect, useState } from 'react';
import { Heart, DollarSign, Wallet, RefreshCw, BarChart3 } from 'lucide-react';
import { supportApi, type Campaign, type Donation, type Expense } from '../services/supportApi';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { useNotifications } from '../context/NotificationsContext';

export function SupportDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // In a real app, this would come from a URL param or context
  const incidentId = '00000000-0000-0000-0000-000000000000'; 

  const { pushNotice } = useNotifications();

  const load = async () => {
    setLoading(true);
    try {
      const [c, d, e] = await Promise.all([
        supportApi.getCampaigns(incidentId),
        supportApi.getDonations(incidentId),
        supportApi.getExpenses(incidentId)
      ]);
      setCampaigns(c);
      setDonations(d);
      setExpenses(e);
    } catch {
      pushNotice({ 
        type: 'error', 
        title: 'Sincronização Falhou', 
        message: 'Não foi possível carregar os dados financeiros do incidente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const totalDonations = donations.reduce((acc, d) => acc + d.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const balance = totalDonations - totalExpenses;

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Heart className="text-rose-400" /> Fluxo de Apoio e Transparência
          </h1>
          <p className="text-slate-400">Monitoramento de campanhas de arrecadação e prestação de contas.</p>
        </div>
        <button 
          onClick={() => void load()} 
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Atualizar Transparência
        </button>
      </header>

      {loading && <LoadingOverlay message="Auditando registros financeiros..." />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-emerald-500/5 p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase">Total Arrecadado</p>
              <p className="text-2xl font-bold text-white">R$ {totalDonations.toLocaleString()}</p>
            </div>
            <DollarSign className="text-emerald-500" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-rose-500/5 p-6 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-rose-400 uppercase">Total de Despesas</p>
              <p className="text-2xl font-bold text-white">R$ {totalExpenses.toLocaleString()}</p>
            </div>
            <Wallet className="text-rose-500" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-cyan-500/5 p-6 border-l-4 border-l-cyan-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-cyan-400 uppercase">Saldo em Conta</p>
              <p className="text-2xl font-bold text-white">R$ {balance.toLocaleString()}</p>
            </div>
            <BarChart3 className="text-cyan-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Campanhas Ativas</h2>
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-slate-100">{c.title}</h3>
                  <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded uppercase">{c.status}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full mb-2 overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500" 
                    style={{ width: `${Math.min((c.currentAmount / c.targetAmount) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>R$ {c.currentAmount.toLocaleString()}</span>
                  <span>Meta: R$ {c.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Extrato de Movimentação</h2>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden text-xs">
            <div className="grid grid-cols-3 bg-slate-800/50 p-3 font-bold text-slate-400">
              <span>Descrição</span>
              <span className="text-center">Categoria</span>
              <span className="text-right">Valor</span>
            </div>
            <div className="divide-y divide-slate-800">
              {expenses.map(e => (
                <div key={e.id} className="grid grid-cols-3 p-3 text-slate-300 hover:bg-slate-800/20">
                  <span>{e.description}</span>
                  <span className="text-center text-slate-500">{e.category}</span>
                  <span className="text-right text-rose-400 font-mono">- R$ {e.amount.toLocaleString()}</span>
                </div>
              ))}
              {donations.map(d => (
                <div key={d.id} className="grid grid-cols-3 p-3 text-slate-300 hover:bg-slate-800/20">
                  <span>Doação: {d.donorName}</span>
                  <span className="text-center text-slate-500">Receita</span>
                  <span className="text-right text-emerald-400 font-mono">+ R$ {d.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
