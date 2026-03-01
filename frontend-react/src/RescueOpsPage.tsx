import { Link } from 'react-router-dom';
import { useRescueTasks } from './hooks/useRescueTasks';
import { useRescueFiltersStore } from './store/rescueFiltersStore';
import { RescueKpiCards } from './components/rescue/RescueKpiCards';
import { RescueTaskForm } from './components/rescue/RescueTaskForm';
import { RescueTaskTable } from './components/rescue/RescueTaskTable';
import type { RescueTaskInput } from './types/rescue';

export default function RescueOpsPage() {
  const {
    loading,
    tasks,
    summary,
    editingTask,
    setEditingTask,
    createTask,
    updateTask,
    removeTask,
    updateStatus,
  } = useRescueTasks();

  const { query, priority, status, setQuery, setPriority, setStatus } = useRescueFiltersStore();

  const onSubmitTask = async (data: RescueTaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
      return;
    }
    await createTask(data);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-6 text-slate-100 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Central de Resgate e Voluntários</h1>
            <p className="text-sm text-slate-400">Fluxo otimizado com Tailwind + hooks: triagem, despacho e conclusão operacional.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/hotspots" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500">Mapa Tático</Link>
            <Link to="/news" className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Boletins</Link>
          </div>
        </header>

        <RescueKpiCards total={summary.total} open={summary.open} active={summary.active} done={summary.done} />

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por ocorrência, equipe ou local"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
              <option value="todos">Todos os status</option>
              <option value="aberto">Aberto</option>
              <option value="em_acao">Em ação</option>
              <option value="concluido">Concluído</option>
            </select>
            <select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)} className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
              <option value="todas">Todas as prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.9fr]">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">{editingTask ? 'Editar ocorrência' : 'Nova ocorrência de resgate'}</h2>
            <RescueTaskForm
              editingTask={editingTask}
              onCancel={() => setEditingTask(null)}
              onSubmitTask={onSubmitTask}
            />
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">Fila operacional (REST + Axios + fallback local)</h2>
            <RescueTaskTable
              tasks={tasks}
              loading={loading}
              onEdit={setEditingTask}
              onDelete={removeTask}
              onStatus={updateStatus}
            />
          </article>
        </section>
      </div>
    </main>
  );
}
