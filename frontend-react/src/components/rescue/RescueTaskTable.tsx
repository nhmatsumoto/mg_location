import type { RescueTask, TaskStatus } from '../../types/rescue';

interface RescueTaskTableProps {
  tasks: RescueTask[];
  loading: boolean;
  onEdit: (task: RescueTask) => void;
  onDelete: (id: string) => void;
  onStatus: (id: string, status: TaskStatus) => void;
}

const statusClass: Record<TaskStatus, string> = {
  aberto: 'bg-red-900/40 text-red-200 border-red-800',
  em_acao: 'bg-amber-900/40 text-amber-200 border-amber-800',
  concluido: 'bg-emerald-900/40 text-emerald-200 border-emerald-800',
};

export function RescueTaskTable({ tasks, loading, onEdit, onDelete, onStatus }: RescueTaskTableProps) {
  if (loading) return <p className="text-sm text-slate-400">Carregando ocorrências...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-300">
            <th className="p-2 text-left">Ocorrência</th>
            <th className="p-2 text-left">Equipe</th>
            <th className="p-2 text-left">Local</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr><td className="p-3 text-slate-400" colSpan={5}>Sem ocorrências registradas.</td></tr>
          ) : tasks.map((task) => (
            <tr key={task.id} className="border-b border-slate-800 align-top">
              <td className="p-2">
                <p className="font-semibold text-slate-100">{task.title}</p>
                <p className="text-xs text-slate-400">{task.description || 'Sem descrição'}</p>
              </td>
              <td className="p-2 text-slate-200">{task.team}</td>
              <td className="p-2 text-slate-200">{task.location}</td>
              <td className="p-2"><span className={`inline-flex rounded-md border px-2 py-1 text-xs ${statusClass[task.status]}`}>{task.status.replace('_', ' ')}</span></td>
              <td className="p-2">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onStatus(task.id, 'em_acao')} className="rounded border border-amber-700 px-2 py-1 text-xs text-amber-200">Acionar</button>
                  <button onClick={() => onStatus(task.id, 'concluido')} className="rounded border border-emerald-700 px-2 py-1 text-xs text-emerald-200">Concluir</button>
                  <button onClick={() => onEdit(task)} className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200">Editar</button>
                  <button onClick={() => onDelete(task.id)} className="rounded border border-red-700 px-2 py-1 text-xs text-red-200">Remover</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
