import { Circle } from 'react-leaflet';

interface MapAreaProps {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
}

export function MapArea({ id, latitude, longitude, category }: MapAreaProps) {
  const styles = getCategoryStyles(category);

  return (
    <Circle
      key={`area-${id}`}
      center={[latitude, longitude]}
      radius={styles.radius}
      pathOptions={{
        color: styles.color,
        fillColor: styles.color,
        fillOpacity: styles.opacity,
        weight: 1,
        className: styles.className,
      }}
    />
  );
}

const getCategoryStyles = (category: string) => {
  const cat = category.toLowerCase();
  switch (cat) {
    case 'flood':
      return { color: 'var(--chakra-colors-sos-blue-500)', radius: 15000, opacity: 0.2, className: 'glow-pulse' };
    case 'earthquake':
      return { color: 'var(--chakra-colors-sos-red-500)', radius: 40000, opacity: 0.25, className: 'glow-pulse' };
    case 'wildfire':
      return { color: 'var(--chakra-colors-orange-500)', radius: 10000, opacity: 0.2, className: 'glow-pulse' };
    case 'tsunami':
      return { color: 'var(--chakra-colors-cyan-500)', radius: 50000, opacity: 0.25, className: 'glow-pulse' };
    case 'storm':
      return { color: 'var(--chakra-colors-purple-500)', radius: 25000, opacity: 0.25, className: 'glow-pulse' };
    case 'weather':
      return { color: 'var(--chakra-colors-yellow-500)', radius: 12000, opacity: 0.2, className: 'glow-pulse' };
    default:
      return { color: 'var(--chakra-colors-whiteAlpha-400)', radius: 20000, opacity: 0.1, className: '' };
  }
};
