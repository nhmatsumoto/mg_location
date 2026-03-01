import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { RescueTask, RescueTaskInput } from '../../types/rescue';

interface RescueTaskFormProps {
  editingTask: RescueTask | null;
  onCancel: () => void;
  onSubmitTask: (data: RescueTaskInput) => Promise<void>;
}

const defaultValues: RescueTaskInput = {
  title: '',
  team: '',
  priority: 'alta',
  location: '',
  description: '',
  status: 'aberto',
};

export function RescueTaskForm({ editingTask, onCancel, onSubmitTask }: RescueTaskFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RescueTaskInput>({ defaultValues });

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        team: editingTask.team,
        priority: editingTask.priority,
        location: editingTask.location,
        description: editingTask.description,
        status: editingTask.status,
      });
      return;
    }
    reset(defaultValues);
  }, [editingTask, reset]);

  return (
    <form className="space-y-3" onSubmit={handleSubmit(async (data) => { await onSubmitTask(data); reset(defaultValues); })}>
      <input className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" placeholder="Título da ocorrência" {...register('title', { required: true })} />
      {errors.title && <p className="text-xs text-red-300">Título é obrigatório.</p>}
      <input className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" placeholder="Equipe responsável" {...register('team', { required: true })} />
      <input className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" placeholder="Local da ocorrência" {...register('location', { required: true })} />
      <select className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" {...register('priority')}>
        <option value="alta">Prioridade alta</option>
        <option value="media">Prioridade média</option>
        <option value="baixa">Prioridade baixa</option>
      </select>
      <select className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" {...register('status')}>
        <option value="aberto">Aberto</option>
        <option value="em_acao">Em ação</option>
        <option value="concluido">Concluído</option>
      </select>
      <textarea className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" placeholder="Descrição operacional" {...register('description')} />
      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">{editingTask ? 'Salvar' : 'Criar'}</button>
        {editingTask && <button type="button" onClick={onCancel} className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Cancelar</button>}
      </div>
    </form>
  );
}
