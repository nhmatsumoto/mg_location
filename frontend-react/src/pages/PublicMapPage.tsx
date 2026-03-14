import { useEffect, useState } from 'react';
import { Shield, Search, LogIn, Globe, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { newsApi } from '../services/newsApi';
import type { NewsNotification } from '../services/newsApi';
import { NewsFeed } from '../components/public/NewsFeed';
import { PublicPortalMap } from '../components/public/PublicPortalMap';
import { GamificationHud } from '../components/gamification/GamificationHud';

export function PublicMapPage() {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [timeWindow] = useState('');

  const fetchNews = async () => {
    setIsLoading(true);
    const data = await newsApi.getNews(countryFilter, locationFilter, timeWindow);
    setNews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, [countryFilter, locationFilter]); // Removed timeWindow dependency if it's constant for now or unused

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-100 flex flex-col font-sans overflow-hidden antialiased">
      {/* Floating Glass Header */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-7xl animate-fade-in">
        <header className="glass-panel px-6 h-20 flex items-center justify-between gap-4 rounded-3xl overflow-hidden border border-white/10 ring-1 ring-white/5 ring-inset">
          {/* Logo Section */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-900/40 border border-white/20">
              <Shield size={22} fill="rgba(255,255,255,0.2)" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-white leading-none">
                SOS<span className="text-blue-400 font-black">PORTAL</span>
              </h1>
              <div className="flex items-center gap-2 text-[9px] text-blue-300 font-black uppercase tracking-[0.2em] mt-1 opacity-80">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Live Network
              </div>
            </div>
          </div>

          {/* Integrated Minimalist Search */}
          <div className="flex-1 max-w-2xl flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all duration-300 group">
             <div className="flex items-center flex-1 px-3 gap-3">
               <Globe className="text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" size={18} />
               <select 
                 className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold appearance-none cursor-pointer text-slate-200"
                 value={countryFilter}
                 onChange={(e) => setCountryFilter(e.target.value)}
               >
                 <option value="" className="bg-slate-900">Todos Países</option>
                 <option value="Brasil" className="bg-slate-900">Brasil</option>
                 <option value="Japão" className="bg-slate-900">Japão</option>
               </select>
             </div>

             <div className="w-px h-6 bg-white/10" />

             <div className="flex items-center flex-1 px-3 gap-3">
               <MapPin className="text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" size={18} />
               <input 
                 type="text" 
                 placeholder="Cidade..."
                 className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-slate-500 text-slate-200"
                 value={locationFilter}
                 onChange={(e) => setLocationFilter(e.target.value)}
               />
             </div>

             <button 
               onClick={fetchNews}
               className="h-11 w-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-blue-600/20 shrink-0"
             >
               <Search size={18} />
             </button>
          </div>

          {/* Gamification Hud Integration */}
          <GamificationHud 
            xp={3420} 
            level={42} 
            rank="Sentinel III" 
            nextLevelXp={5000} 
            className="hidden md:flex border-none shadow-none bg-transparent py-0 h-14" 
          />

          {/* Action Section */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all shadow-xl hover:border-blue-500/50 group"
              title="Acesso Restrito"
            >
              <LogIn size={20} className="group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
        </header>
      </div>

      {/* Main Split Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Latest Notifications (35%) */}
        <aside className="fixed left-6 top-32 bottom-6 w-[380px] z-40 hidden lg:flex flex-col bg-slate-950/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-panel">
          <div className="p-8 pb-4">
             <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                   <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">Ocorrências</h3>
                   <p className="text-xl font-black text-white">Central de Alertas</p>
                </div>
                <div className="h-10 w-10 glass-card rounded-xl flex items-center justify-center text-blue-400 animate-pulse">
                   <Zap size={18} fill="currentColor" />
                </div>
             </div>
             
             <div className="flex gap-2">
                <span className="px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-[10px] font-black text-blue-400 tracking-wider cursor-pointer hover:bg-blue-600/30 transition-colors">LIVE</span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 tracking-wider cursor-pointer hover:bg-white/10 transition-colors">CRITICAL</span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 tracking-wider cursor-pointer hover:bg-white/10 transition-colors">NEARBY</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
            <NewsFeed news={news} isLoading={isLoading} />
          </div>
          
          <div className="p-8 bg-black/40 border-t border-white/5">
             <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Status</div>
                <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">98.2% Active</div>
             </div>
             <div className="group relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className="absolute inset-0 bg-blue-500/20 blur-sm" />
               <div className="relative h-full w-[85%] bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             </div>
             <p className="mt-4 text-[9px] text-slate-500 font-bold text-center uppercase tracking-widest leading-relaxed">
               SOS Location Sentinel <br/>
               <span className="text-slate-600 font-medium">Decentralized Monitoring Protocol v2.4</span>
             </p>
          </div>
        </aside>

        {/* Main Content - Map (Full screen with sidebar overlay) */}
        <div className="flex-1 overflow-hidden relative">
          <PublicPortalMap news={news} />
          
          {/* Map Overlay Elements */}
          <div className="absolute bottom-10 right-10 z-30 flex flex-col gap-3">
             <button className="h-12 w-12 glass-panel rounded-2xl flex items-center justify-center text-white hover:bg-white/10 border border-white/10 shadow-2xl transition-all active:scale-90">
                <MapPin size={20} />
             </button>
             <button className="h-12 w-12 glass-panel rounded-2xl flex items-center justify-center text-white hover:bg-white/10 border border-white/10 shadow-2xl transition-all active:scale-90">
                <Plus size={20} />
             </button>
             <div className="h-0.5 w-6 bg-white/20 mx-auto" />
             <button className="h-12 w-12 glass-panel rounded-2xl flex items-center justify-center text-white hover:bg-white/10 border border-white/10 shadow-2xl transition-all active:scale-90">
                <Minus size={20} />
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Missing component imports/stubs needed for the above
function Plus({ size }: { size: number }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function Minus({ size }: { size: number }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>; }

