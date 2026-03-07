import React, { useRef, useEffect } from 'react';
import { useSimulationStore } from '../../../store/useSimulationStore';

export const FocalIntelligence: React.FC = () => {
  const focalPoint = useSimulationStore(state => state.focalPoint);
  const setFocalWeather = useSimulationStore(state => state.setFocalWeather);
  const lastUpdate = useRef(0);

  useEffect(() => {
    if (!focalPoint) return;
    
    const now = Date.now();
    if (now - lastUpdate.current < 3000) return;
    lastUpdate.current = now;

    const fetchFocalData = async () => {
      setFocalWeather({ loading: true });
      await new Promise(r => setTimeout(r, 800));
      const [lat, lon] = focalPoint;
      const baseTemp = 22 + Math.sin(lat * 10) * 5;
      const humidity = 40 + Math.cos(lon * 10) * 30;
      
      setFocalWeather({
        temp: Math.round(baseTemp * 10) / 10,
        humidity: Math.round(humidity),
        windSpeed: Math.round(5 + Math.random() * 15),
        description: baseTemp > 25 ? 'Céu Limpo' : 'Parcialmente Nublado',
        loading: false
      });
    };

    void fetchFocalData();
  }, [focalPoint, setFocalWeather]);

  return null;
};
