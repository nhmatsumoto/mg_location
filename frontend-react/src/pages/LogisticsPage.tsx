import { useEffect, useState } from 'react';
import { Package, Plus, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { logisticsApi, type SupplyItem } from '../services/logisticsApi';
import { Modal } from '../components/ui/Modal';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { useNotifications } from '../context/NotificationsContext';

export function LogisticsPage() {
  const [loading, setLoading] = useState(false);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<SupplyItem>>({
    item: '',
    quantity: 0,
    unit: 'un',
    origin: '',
    destination: '',
    status: 'pending',
    priority: 'medium'
  });

  const { pushNotice } = useNotifications();

  const load = async () => {
    setLoading(true);
    try {
      const data = await logisticsApi.getAll();
      setSupplies(data);
    } catch (error) {
      pushNotice({ 
        type: 'error', 
        title: 'Erro de Carga', 
        message: 'Não foi possível carregar os suprimentos.' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    if (!form.item || !form.quantity) {
      pushNotice({ type: 'warning', title: 'Validação', message: 'Item e quantidade são obrigatórios.' });
      return;
    }

    try {
      await logisticsApi.create(form);
      pushNotice({ type: 'success', title: 'Sucesso', message: 'Suprimento registrado com sucesso.' });
      setModalOpen(false);
      setForm({
        item: '',
        quantity: 0,
        unit: 'un',
        origin: '',
        destination: '',
        status: 'pending',
        priority: 'medium'
      });
      await load();
    } catch {
      pushNotice({ type: 'error', title: 'Erro', message: 'Falha ao salvar suprimento.' });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="text-cyan-400" /> Gestão de Logística e Suprimentos
          </h1>
          <p className="text-slate-400">Controle de recursos, transporte e distribuição humanitária.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => void load()} 
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Atualizar
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
          >
            <Plus size={16} /> Novo Suprimento
          </button>
        </div>
      </header>

      {loading && <LoadingOverlay message="Sincronizando logística..." />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total de Itens</p>
          <p className="mt-1 text-2xl font-bold text-white">{supplies.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Em Trânsito</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            {supplies.filter(s => s.status === 'in_transit').length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Entregues</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {supplies.filter(s => s.status === 'delivered').length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Prioridade Alta</p>
          <p className="mt-1 text-2xl font-bold text-rose-400">
            {supplies.filter(s => s.priority === 'high').length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 text-slate-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Item</th>
              <th className="px-6 py-4 font-semibold">Qtd / Unidade</th>
              <th className="px-6 py-4 font-semibold">Origem {'>'} Destino</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Prioridade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {supplies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Nenhum registro de suprimento encontrado.
                </td>
              </tr>
            ) : (
              supplies.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-100">{s.item}</td>
                  <td className="px-6 py-4 text-slate-300">{s.quantity} {s.unit}</td>
                  <td className="px-6 py-4 text-slate-400">
                    <span className="text-slate-100">{s.origin}</span>
                    <Send size={12} className="inline mx-2 text-slate-600" />
                    <span className="text-slate-100">{s.destination}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      s.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      s.status === 'in_transit' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-700/30 text-slate-400 border border-slate-700/50'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 font-semibold ${
                      s.priority === 'high' ? 'text-rose-400' :
                      s.priority === 'medium' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {s.priority === 'high' && <AlertTriangle size={14} />}
                      {s.priority}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        title="Registrar Novo Suprimento" 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Item</label>
              <input 
                value={form.item} 
                onChange={(e) => setForm(p => ({ ...p, item: e.target.value }))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Ex: Água Potável"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Quantidade</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  value={form.quantity} 
                  onChange={(e) => setForm(p => ({ ...p, quantity: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
                <select 
                  value={form.unit}
                  onChange={(e) => setForm(p => ({ ...p, unit: e.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-white"
                >
                  <option value="un">un</option>
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="caixas">caixas</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Origem</label>
              <input 
                value={form.origin} 
                onChange={(e) => setForm(p => ({ ...p, origin: e.target.value }))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Ex: CD Central"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Destino</label>
              <input 
                value={form.destination} 
                onChange={(e) => setForm(p => ({ ...p, destination: e.target.value }))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Ex: Abrigo Zona Sul"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Status</label>
              <select 
                value={form.status}
                onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                <option value="pending">Pendente</option>
                <option value="in_transit">Em Trânsito</option>
                <option value="delivered">Entregue</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Prioridade</label>
              <select 
                value={form.priority}
                onChange={(e) => setForm(p => ({ ...p, priority: e.target.value }))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-100"
            >
              Cancelar
            </button>
            <button 
              onClick={() => void handleCreate()}
              className="rounded-lg bg-cyan-600 px-6 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
            >
              Confirmar Envio
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
