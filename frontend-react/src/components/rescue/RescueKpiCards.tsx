interface RescueKpiCardsProps {
  total: number;
  open: number;
  active: number;
  done: number;
}

export function RescueKpiCards({ total, open, active, done }: RescueKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <article className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <p className="text-slate-400 text-sm">Total</p>
        <p className="text-2xl font-bold text-white">{total}</p>
      </article>
      <article className="rounded-xl border border-red-900 bg-red-950/40 p-4">
        <p className="text-red-300 text-sm">Abertos</p>
        <p className="text-2xl font-bold text-red-200">{open}</p>
      </article>
      <article className="rounded-xl border border-amber-900 bg-amber-950/40 p-4">
        <p className="text-amber-300 text-sm">Em ação</p>
        <p className="text-2xl font-bold text-amber-200">{active}</p>
      </article>
      <article className="rounded-xl border border-emerald-900 bg-emerald-950/40 p-4">
        <p className="text-emerald-300 text-sm">Concluídos</p>
        <p className="text-2xl font-bold text-emerald-200">{done}</p>
      </article>
    </div>
  );
}
