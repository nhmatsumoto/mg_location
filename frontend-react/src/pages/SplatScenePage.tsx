import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SplatSceneViewer from '../components/splat/SplatSceneViewer';
import { SplatControlPanel } from '../components/splat/SplatControlPanel';
import { useSplatStore } from '../store/useSplatStore';
import { ArrowLeft, Share2 } from 'lucide-react';

export function SplatScenePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { splats, fetchSplats, setActiveSplat } = useSplatStore();

  useEffect(() => {
    void fetchSplats();
  }, [fetchSplats]);

  useEffect(() => {
    if (id) setActiveSplat(id);
  }, [id, setActiveSplat]);

  const activeSplat = splats.find(s => s.id === id) || splats[0];

  if (!activeSplat && !id) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Identifying Neural Radiance Field...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        <button 
          onClick={() => navigate(-1 as any)}
          className="bg-slate-900/80 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-2xl"
        >
          <ArrowLeft size={14} /> Back to Map
        </button>
        <button className="bg-slate-900/80 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-cyan-400 transition-all shadow-2xl">
          <Share2 size={14} /> Share Scene
        </button>
      </div>

      {/* Main Viewer */}
      <div className="flex-1 relative">
        <SplatSceneViewer 
          url={activeSplat?.file_url || 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k.splat'} 
          scale={activeSplat?.scale || 1}
        />
        
        <SplatControlPanel 
          title={activeSplat?.title || "SITUATIONAL RECONSTRUCTION"} 
        />
      </div>

      {/* Bottom Overlay - Event Link */}
      {activeSplat?.event_id && (
        <div className="absolute bottom-6 right-6 z-40">
           <div className="bg-slate-900/40 border border-white/5 p-3 px-5 rounded-2xl backdrop-blur-md flex items-center gap-4 shadow-2xl">
              <div className="flex flex-col">
                 <span className="text-[8px] text-slate-500 font-mono uppercase">Linked Event</span>
                 <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">#{activeSplat.event_id}</span>
              </div>
              <button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-cyan-500 hover:text-slate-950 transition-all">
                View Reports
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
