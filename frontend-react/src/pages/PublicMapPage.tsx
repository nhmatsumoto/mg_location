import { useEffect, useState } from 'react';
import { OperationalMap } from '../components/maps/OperationalMap';
import { operationsApi, type OperationsSnapshot } from '../services/operationsApi';

export function PublicMapPage() {
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);

  const load = async () => {
    try {
      setSnapshot(await operationsApi.snapshot());
    } catch {
      setSnapshot(null);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-3 text-xl font-semibold text-slate-100">Mapa público (somente leitura)</h1>
        <OperationalMap data={snapshot} onRefresh={load} />
      </div>
    </div>
  );
}
