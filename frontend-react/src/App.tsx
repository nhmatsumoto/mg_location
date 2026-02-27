import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import {
  AlertTriangle,
  MapPin,
  Waves,
  ShieldAlert,
  Activity,
  CheckCircle2,
  X,
  ExternalLink,
  Camera,
  Upload,
  Smartphone,
  Film,
  Maximize2,
  Minimize2,
  Newspaper,
  Users,
} from 'lucide-react';
import LandslideSimulation from './LandslideSimulation';
import PostDisasterSplat from './PostDisasterSplat';

const API_BASE_URL = 'http://localhost:5031';

const iconLandslide = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-orange.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const iconFlood = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const iconCritical = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  score: number;
  confidence: number;
  type: string;
  riskFactors: string[];
  humanExposure: string;
  estimatedAffected: number;
  urgency: string;
}

interface CollapseReport {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  description: string;
  reporterName: string;
  reporterPhone: string;
  videoFileName: string;
  sourceVideoUrl: string;
  uploadedAtUtc: string;
  processingStatus: 'Pending' | 'Ingested' | 'Trained' | 'Published';
  splatUrl?: string | null;
}

interface NewsUpdate {
  id: string;
  city: string;
  title: string;
  source: string;
  url: string;
  publishedAtUtc: string;
}

interface MissingPerson {
  id: string;
  personName: string;
  age?: number | null;
  city: string;
  lastSeenLocation: string;
  physicalDescription: string;
  additionalInfo: string;
  contactName: string;
  contactPhone: string;
  reportedAtUtc: string;
}

const initialFormState = {
  locationName: '',
  latitude: '',
  longitude: '',
  description: '',
  reporterName: '',
  reporterPhone: '',
  video: null as File | null,
};

const initialMissingForm = {
  personName: '',
  age: '',
  city: 'Ubá',
  lastSeenLocation: '',
  physicalDescription: '',
  additionalInfo: '',
  contactName: '',
  contactPhone: '',
};

export default function App() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [reports, setReports] = useState<CollapseReport[]>([]);
  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>([]);
  const [missingPeople, setMissingPeople] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingMissing, setLoadingMissing] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingMissing, setSavingMissing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [missingError, setMissingError] = useState('');
  const [missingSuccess, setMissingSuccess] = useState('');
  const [formState, setFormState] = useState(initialFormState);
  const [missingForm, setMissingForm] = useState(initialMissingForm);
  const [selectedPanel, setSelectedPanel] = useState<{ hotspot?: Hotspot; report?: CollapseReport; mode: 'sim' | 'splat' } | null>(null);
  const [isPanelFullscreen, setIsPanelFullscreen] = useState(true);

  const loadReports = () => {
    setLoadingReports(true);
    fetch(`${API_BASE_URL}/api/collapse-reports`)
      .then((res) => res.json())
      .then((data: CollapseReport[]) => {
        setReports(data);
        setLoadingReports(false);
      })
      .catch(() => setLoadingReports(false));
  };

  const loadNews = () => {
    setLoadingNews(true);
    fetch(`${API_BASE_URL}/api/news-updates`)
      .then((res) => res.json())
      .then((data: NewsUpdate[]) => {
        setNewsUpdates(data);
        setLoadingNews(false);
      })
      .catch(() => setLoadingNews(false));
  };

  const loadMissingPeople = () => {
    setLoadingMissing(true);
    fetch(`${API_BASE_URL}/api/missing-persons`)
      .then((res) => res.json())
      .then((data: MissingPerson[]) => {
        setMissingPeople(data);
        setLoadingMissing(false);
      })
      .catch(() => setLoadingMissing(false));
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/hotspots`)
      .then((res) => res.json())
      .then((data) => {
        setHotspots(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    loadReports();
    loadNews();
    loadMissingPeople();

    const interval = setInterval(loadNews, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!formState.video) {
      setUploadError('Selecione um vídeo gravado no celular antes de enviar.');
      return;
    }

    setUploading(true);
    const payload = new FormData();
    payload.append('locationName', formState.locationName);
    payload.append('latitude', formState.latitude);
    payload.append('longitude', formState.longitude);
    payload.append('description', formState.description);
    payload.append('reporterName', formState.reporterName);
    payload.append('reporterPhone', formState.reporterPhone);
    payload.append('video', formState.video);

    try {
      const response = await fetch(`${API_BASE_URL}/api/collapse-reports`, {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        const errorPayload = await response.json();
        throw new Error(errorPayload.error ?? 'Falha ao fazer upload do vídeo.');
      }

      setUploadSuccess('Upload recebido! O vídeo entrou na fila para gaussian-splatting.');
      setFormState(initialFormState);
      loadReports();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Erro inesperado no envio.');
    } finally {
      setUploading(false);
    }
  };

  const handleMissingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMissingError('');
    setMissingSuccess('');
    setSavingMissing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/missing-persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personName: missingForm.personName,
          age: missingForm.age ? Number(missingForm.age) : null,
          city: missingForm.city,
          lastSeenLocation: missingForm.lastSeenLocation,
          physicalDescription: missingForm.physicalDescription,
          additionalInfo: missingForm.additionalInfo,
          contactName: missingForm.contactName,
          contactPhone: missingForm.contactPhone,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json();
        throw new Error(errorPayload.error ?? 'Falha ao cadastrar desaparecido.');
      }

      setMissingSuccess('Cadastro realizado com sucesso.');
      setMissingForm(initialMissingForm);
      loadMissingPeople();
    } catch (error) {
      setMissingError(error instanceof Error ? error.message : 'Erro inesperado no cadastro.');
    } finally {
      setSavingMissing(false);
    }
  };

  const openPanel = (panel: { hotspot?: Hotspot; report?: CollapseReport; mode: 'sim' | 'splat' }) => {
    setSelectedPanel(panel);
    setIsPanelFullscreen(true);
  };

  return (
    <>
      <div className="flex h-screen w-full bg-slate-900 text-slate-200 font-sans overflow-hidden">
        <div className="w-1/3 h-full border-r border-slate-700 bg-slate-800 flex flex-col z-20 shadow-2xl">
          <div className="p-6 border-b border-slate-700 bg-slate-800/80 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="text-red-500 w-8 h-8" />
              <h1 className="text-2xl font-bold tracking-tight text-white">Centro de Comando</h1>
            </div>
            <p className="text-sm text-slate-400">Triagem tática: onde agir primeiro para maximizar vidas salvas.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowUploadModal(true);
                  setUploadError('');
                  setUploadSuccess('');
                }}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors"
              >
                <Upload className="w-4 h-4" /> Enviar vídeo
              </button>
              <button
                onClick={() => {
                  setShowMissingModal(true);
                  setMissingError('');
                  setMissingSuccess('');
                }}
                className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors"
              >
                <Users className="w-4 h-4" /> Cadastrar desaparecido
              </button>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2"><Newspaper className="w-3 h-3" />Crawler de notícias (Ubá/JF/Matias Barbosa)</h2>
            {loadingNews ? (
              <p className="text-xs text-slate-500">Buscando atualizações...</p>
            ) : (
              <ul className="space-y-2 max-h-28 overflow-y-auto pr-1">
                {newsUpdates.slice(0, 4).map((news) => (
                  <li key={news.id} className="text-xs bg-slate-900/60 border border-slate-700 rounded-md p-2">
                    <p className="font-semibold text-white truncate">{news.city}: {news.title}</p>
                    <a href={news.url} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-200 underline">{news.source}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Pessoas desaparecidas</h2>
            {loadingMissing ? (
              <p className="text-xs text-slate-500">Carregando cadastros...</p>
            ) : (
              <ul className="space-y-2 max-h-28 overflow-y-auto pr-1">
                {missingPeople.slice(0, 4).map((person) => (
                  <li key={person.id} className="text-xs bg-slate-900/60 border border-slate-700 rounded-md p-2">
                    <p className="font-semibold text-white">{person.personName} ({person.city})</p>
                    <p className="text-slate-400">Contato: {person.contactName} - {person.contactPhone}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Fila de uploads para Gaussian Splatting</h2>
            {loadingReports ? (
              <p className="text-xs text-slate-500">Carregando uploads...</p>
            ) : reports.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum vídeo enviado até agora.</p>
            ) : (
              <ul className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {reports.slice(0, 4).map((report) => (
                  <li key={report.id} className="text-xs bg-slate-900/60 border border-slate-700 rounded-md p-2">
                    <p className="font-semibold text-white truncate">{report.locationName}</p>
                    <p className="text-slate-400 truncate">{report.videoFileName}</p>
                    <p className="text-emerald-400">Status: {report.processingStatus}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full"><Activity className="w-8 h-8 text-blue-500 animate-spin" /></div>
            ) : (
              hotspots.map((hs, i) => (
                <div key={hs.id} className={`rounded-xl p-4 border transition-all ${hs.score > 90 ? 'bg-red-950/40 border-red-500/50 hover:bg-red-900/40' : 'bg-slate-700/50 border-orange-500/30 hover:bg-slate-700'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${hs.score > 90 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>{i + 1}</span>
                      <h3 className="font-bold text-lg">{hs.type === 'Flood' ? 'Enchente' : 'Deslizamento'}</h3>
                    </div>
                    <div className="bg-slate-900 px-2 py-1 rounded-md border border-slate-600"><span className="text-xs font-mono text-slate-300">Score: {hs.score.toFixed(1)}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <p className="text-slate-400 mb-0.5">Potencial Vítimas</p>
                      <p className="font-semibold text-white flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-yellow-500" /> {hs.estimatedAffected}</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700"><p className="text-slate-400 mb-0.5">Confiança IA</p><p className="font-semibold text-white">{(hs.confidence * 100).toFixed(0)}%</p></div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Evidências / Gatilhos:</p>
                    <ul className="text-sm space-y-1">{hs.riskFactors.map((r, idx) => <li key={idx} className="flex items-start gap-1.5 text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{r}</span></li>)}</ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-2/3 h-full relative z-10">
          <MapContainer center={[-21.1215, -42.9427]} zoom={14} className="h-full w-full" zoomControl={false}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Mapa em relevo">
                <TileLayer attribution='Map data: &copy; OpenStreetMap contributors | Style: OpenTopoMap' url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Mapa escuro tático">
                <TileLayer attribution='&copy; <a href="https://carto.com/">CartoDB</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              </LayersControl.BaseLayer>
            </LayersControl>

            {hotspots.map((hs, i) => (
              <Marker key={hs.id} position={[hs.lat, hs.lng]} icon={hs.score > 90 ? iconCritical : hs.type === 'Flood' ? iconFlood : iconLandslide}>
                <Popup className="custom-popup">
                  <div className="text-slate-900 font-sans">
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">{hs.type === 'Flood' ? <Waves className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-orange-500" />}{hs.type}</h3>
                    <p className="text-sm font-semibold mb-2">Rank: #{i + 1} | Urgência: {hs.urgency}</p>
                    <div className="bg-slate-100 p-2 rounded text-xs mb-2"><strong>Pessoas Risco:</strong> {hs.estimatedAffected}<br /><strong>Exposição:</strong> {hs.humanExposure}</div>
                    {hs.type === 'Landslide' && (
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => openPanel({ hotspot: hs, mode: 'sim' })} className="w-full flex justify-center items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white py-1.5 px-2 rounded text-xs font-bold transition-colors"><ExternalLink className="w-3 h-3" /> Ver Simulação 3D</button>
                        <button onClick={() => openPanel({ hotspot: hs, mode: 'splat' })} className="w-full flex justify-center items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 rounded text-xs font-bold transition-colors"><Camera className="w-3 h-3" /> Ver Drone Splatting</button>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {reports.map((report) => (
              <CircleMarker
                key={`report-${report.id}`}
                center={[report.latitude, report.longitude]}
                radius={8}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.35, weight: 2 }}
              >
                <Popup className="custom-popup">
                  <div className="text-slate-900 font-sans">
                    <h3 className="font-bold text-base mb-1 flex items-center gap-2"><Film className="w-4 h-4 text-blue-600" /> Upload: {report.locationName}</h3>
                    <p className="text-xs mb-2 text-slate-700">Arquivo: {report.videoFileName}</p>
                    <p className="text-xs mb-2 text-slate-700">Status: {report.processingStatus}</p>
                    <button onClick={() => openPanel({ report, mode: 'splat' })} className="w-full flex justify-center items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 rounded text-xs font-bold transition-colors"><Camera className="w-3 h-3" /> Abrir Splatting deste vídeo</button>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {hotspots.map((hs) => (
              <CircleMarker
                key={`circle-${hs.id}`}
                center={[hs.lat, hs.lng]}
                radius={hs.score > 90 ? 30 : 20}
                pathOptions={{ color: hs.score > 90 ? '#ef4444' : '#f97316', fillColor: hs.score > 90 ? '#ef4444' : '#f97316', fillOpacity: 0.2, weight: 1 }}
              />
            ))}
          </MapContainer>

          <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-md border border-slate-700 shadow-xl rounded-xl p-4 w-64 z-[400] text-sm">
            <h4 className="font-bold text-white mb-2 uppercase tracking-wide text-xs">Status Global</h4>
            <div className="flex justify-between items-center mb-1"><span className="text-slate-400">Total Hotspots:</span><span className="font-semibold">{hotspots.length}</span></div>
            <div className="flex justify-between items-center mb-1"><span className="text-slate-400">Pop. em Perigo:</span><span className="font-semibold text-yellow-500">{hotspots.reduce((a, b) => a + b.estimatedAffected, 0)}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-400">Desaparecidos:</span><span className="font-semibold text-amber-400">{missingPeople.length}</span></div>
          </div>

          {selectedPanel && (
            <div className={`absolute z-50 bg-slate-900 shadow-2xl border border-slate-600 flex flex-col overflow-hidden animate-in fade-in ${isPanelFullscreen ? 'inset-0 rounded-none' : 'bottom-4 left-4 w-96 h-80 rounded-xl slide-in-from-bottom-4'}`}>
              <div className="flex justify-between items-center p-2 border-b border-slate-700 bg-slate-800">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">{selectedPanel.mode === 'sim' ? <MapPin className="w-3 h-3 text-orange-500" /> : <Camera className="w-3 h-3 text-blue-500" />}{selectedPanel.mode === 'sim' ? 'Simulação' : 'Drone (Splat)'}: {selectedPanel.hotspot?.id ?? selectedPanel.report?.id}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsPanelFullscreen((prev) => !prev)} className="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded p-0.5 transition-colors" title={isPanelFullscreen ? 'Sair de tela cheia' : 'Tela cheia'}>{isPanelFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
                  <button onClick={() => setSelectedPanel(null)} className="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded p-0.5 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-1 w-full h-full relative">{selectedPanel.mode === 'sim' ? <LandslideSimulation /> : <PostDisasterSplat splatUrl={selectedPanel.report?.splatUrl} sourceVideoUrl={selectedPanel.report?.sourceVideoUrl ? `${API_BASE_URL}${selectedPanel.report.sourceVideoUrl}` : undefined} />}</div>
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex items-start justify-between">
              <div><h3 className="text-lg font-bold text-white flex items-center gap-2"><Smartphone className="w-5 h-5 text-blue-400" /> Upload de vídeo de desabamento</h3></div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form className="p-4 space-y-3" onSubmit={handleUpload}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required value={formState.locationName} onChange={(event) => setFormState((prev) => ({ ...prev, locationName: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Nome do local" />
                <input value={formState.reporterName} onChange={(event) => setFormState((prev) => ({ ...prev, reporterName: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Seu nome (opcional)" />
                <input required value={formState.latitude} onChange={(event) => setFormState((prev) => ({ ...prev, latitude: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Latitude" />
                <input required value={formState.longitude} onChange={(event) => setFormState((prev) => ({ ...prev, longitude: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Longitude" />
              </div>
              <textarea value={formState.description} onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))} className="w-full min-h-20 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Descreva o desabamento" />
              <input value={formState.reporterPhone} onChange={(event) => setFormState((prev) => ({ ...prev, reporterPhone: event.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Contato (opcional)" />
              <input required type="file" accept="video/*" capture="environment" onChange={(event) => setFormState((prev) => ({ ...prev, video: event.target.files && event.target.files.length > 0 ? event.target.files[0] : null }))} className="text-xs w-full" />
              {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
              {uploadSuccess && <p className="text-xs text-emerald-400">{uploadSuccess}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-3 py-2 text-sm rounded border border-slate-600 text-slate-300 hover:text-white">Fechar</button>
                <button type="submit" disabled={uploading} className="px-3 py-2 text-sm rounded bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-70">{uploading ? 'Enviando...' : 'Enviar para análise'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMissingModal && (
        <div className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex items-start justify-between">
              <div><h3 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-amber-400" /> Cadastro de pessoa desaparecida</h3></div>
              <button onClick={() => setShowMissingModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form className="p-4 space-y-3" onSubmit={handleMissingSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required value={missingForm.personName} onChange={(event) => setMissingForm((prev) => ({ ...prev, personName: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Nome da pessoa" />
                <input value={missingForm.age} onChange={(event) => setMissingForm((prev) => ({ ...prev, age: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Idade (opcional)" />
                <select value={missingForm.city} onChange={(event) => setMissingForm((prev) => ({ ...prev, city: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm">
                  <option>Ubá</option><option>Juiz de Fora</option><option>Matias Barbosa</option>
                </select>
                <input required value={missingForm.lastSeenLocation} onChange={(event) => setMissingForm((prev) => ({ ...prev, lastSeenLocation: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Último local visto" />
              </div>
              <textarea value={missingForm.physicalDescription} onChange={(event) => setMissingForm((prev) => ({ ...prev, physicalDescription: event.target.value }))} className="w-full min-h-20 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Descrição física (roupas, características)" />
              <textarea value={missingForm.additionalInfo} onChange={(event) => setMissingForm((prev) => ({ ...prev, additionalInfo: event.target.value }))} className="w-full min-h-16 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Informações adicionais" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required value={missingForm.contactName} onChange={(event) => setMissingForm((prev) => ({ ...prev, contactName: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Nome do contato" />
                <input required value={missingForm.contactPhone} onChange={(event) => setMissingForm((prev) => ({ ...prev, contactPhone: event.target.value }))} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="Telefone do contato" />
              </div>
              {missingError && <p className="text-xs text-red-400">{missingError}</p>}
              {missingSuccess && <p className="text-xs text-emerald-400">{missingSuccess}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowMissingModal(false)} className="px-3 py-2 text-sm rounded border border-slate-600 text-slate-300 hover:text-white">Fechar</button>
                <button type="submit" disabled={savingMissing} className="px-3 py-2 text-sm rounded bg-amber-600 text-white font-semibold hover:bg-amber-500 disabled:opacity-70">{savingMissing ? 'Salvando...' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
