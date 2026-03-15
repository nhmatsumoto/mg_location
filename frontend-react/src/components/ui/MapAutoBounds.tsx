import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import type { NewsNotification } from '../../services/newsApi';

interface MapAutoBoundsProps {
  news: NewsNotification[];
}

export function MapAutoBounds({ news }: MapAutoBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (news.length === 0) return;

    const bounds = L.latLngBounds(
      news
        .filter((n) => n.latitude && n.longitude)
        .map((n) => [n.latitude!, n.longitude!] as [number, number])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [news, map]);

  return null;
}
