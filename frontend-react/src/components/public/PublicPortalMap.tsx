import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { NewsNotification } from '../../services/newsApi';
import { useEffect } from 'react';

// Fix Leaflet marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to handle automatic map bounds based on markers
function AutoBounds({ news }: { news: NewsNotification[] }) {
  const map = useMap();

  useEffect(() => {
    if (news.length === 0) return;

    const bounds = L.latLngBounds(
      news
        .filter(n => n.latitude && n.longitude)
        .map(n => [n.latitude!, n.longitude!] as [number, number])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [news, map]);

  return null;
}

interface PublicPortalMapProps {
  news: NewsNotification[];
}

export function PublicPortalMap({ news }: PublicPortalMapProps) {
  const defaultCenter: [number, number] = [-15.7801, -47.9292]; // Brazil center
  
  const getCategoryStyles = (category: string) => {
    const cat = category.toLowerCase();
    switch (cat) {
      case 'flood': 
        return { color: '#3b82f6', radius: 15000, opacity: 0.15 }; 
      case 'earthquake': 
        return { color: '#ef4444', radius: 40000, opacity: 0.2 }; 
      case 'wildfire': 
        return { color: '#f97316', radius: 10000, opacity: 0.15 }; 
      case 'tsunami': 
        return { color: '#06b6d4', radius: 50000, opacity: 0.2 }; 
      case 'storm': 
        return { color: '#8b5cf6', radius: 25000, opacity: 0.2 }; // purple
      case 'weather': 
        return { color: '#eab308', radius: 12000, opacity: 0.15 }; // yellow
      case 'history': 
        return { color: '#64748b', radius: 30000, opacity: 0.1 }; // slate
      default: 
        return { color: '#6366f1', radius: 20000, opacity: 0.1 };
    }
  };

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={4} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <AutoBounds news={news} />
        
        {news.map((item) => {
          if (!item.latitude || !item.longitude) return null;
          const styles = getCategoryStyles(item.category);
          
          return (
            <div key={item.id}>
              {/* Core Marker */}
              <Marker position={[item.latitude, item.longitude]}>
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-slate-900 text-white">
                        {item.category}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{item.title}</h4>
                    <p className="text-xs text-slate-500 mb-3">{item.source} • {item.location}</p>
                    <a 
                      href={item.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      Acessar Detalhes
                    </a>
                  </div>
                </Popup>
              </Marker>
              
              {/* Outer Glow Area */}
              <Circle 
                center={[item.latitude, item.longitude]}
                radius={styles.radius}
                pathOptions={{ 
                  color: styles.color,
                  fillColor: styles.color,
                  fillOpacity: styles.opacity,
                  weight: 0
                }}
              />

              {/* Inner Risk Core */}
              <Circle 
                center={[item.latitude, item.longitude]}
                radius={styles.radius * 0.4}
                pathOptions={{ 
                  color: styles.color,
                  fillColor: styles.color,
                  fillOpacity: styles.opacity * 2.5,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            </div>
          );
        })}
      </MapContainer>
      
      {/* Map Legend/Overlay */}
      <div className="absolute bottom-6 right-6 z-40 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xl pointer-events-none">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Legenda de Risco</h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Sismo / Terremoto
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Inundação
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-orange-500" /> Incêndio
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-cyan-500" /> Tsunami
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-purple-500" /> Tempestade
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-yellow-500" /> Clima / Calor
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-slate-500" /> Histórico
          </div>
        </div>
      </div>
    </div>
  );
}
