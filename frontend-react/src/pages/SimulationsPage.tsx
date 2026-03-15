import { useEffect, useMemo, useState } from 'react';
import LandslideSimulation from '../LandslideSimulation';
import { simulationsApi } from '../services/simulationsApi';
import { dataHubApi } from '../services/dataHubApi';
import { 
  Box, 
  VStack, 
  Text, 
  SimpleGrid, 
  Badge,
  Center,
  Icon
} from '@chakra-ui/react';
import { Activity } from 'lucide-react';
import { StatBoard } from '../components/ui/StatBoard';

// Atomic Components
import { SimControlUnit } from '../components/ui/SimControlUnit';
import { WeatherTelemetry } from '../components/ui/WeatherTelemetry';
import { EventTimeline } from '../components/ui/EventTimeline';

interface StreamStep {
  step: number;
  lat: number;
  lng: number;
  depth: number;
  risk: string;
}

export function SimulationsPage() {
  const [lat, setLat] = useState('-21.1215');
  const [lng, setLng] = useState('-42.9427');
  const [resultData, setResultData] = useState<any>(null);
  const [streamSteps, setStreamSteps] = useState<StreamStep[]>([]);
  const [rainSummary, setRainSummary] = useState('CALIBRATING WEATHER_STATIONS...');
  const [isSimulating, setIsSimulating] = useState(false);

  const numericLat = useMemo(() => Number(lat), [lat]);
  const numericLng = useMemo(() => Number(lng), [lng]);

  const run = async () => {
    setIsSimulating(true);
    const payload = await simulationsApi.runFlow({ lat: numericLat, lng: numericLng });
    setResultData(payload);
    setIsSimulating(false);
  };

  const startRealtime = () => {
    setStreamSteps([]);
    const params = new URLSearchParams({ lat: String(numericLat), lng: String(numericLng), steps: '10' });
    const source = new EventSource(`/api/location/flow-simulation/stream?${params.toString()}`);

    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type: string } & Partial<StreamStep>;
      if (payload.type === 'done') {
        source.close();
        return;
      }
      if (payload.type === 'flow-step') {
        setStreamSteps((prev) => [
          ...prev,
          {
            step: payload.step ?? prev.length,
            lat: payload.lat ?? numericLat,
            lng: payload.lng ?? numericLng,
            depth: payload.depth ?? 0,
            risk: payload.risk ?? 'unknown',
          },
        ]);
      }
    };

    source.onerror = () => {
      source.close();
    };
  };

  useEffect(() => {
    void dataHubApi
      .weatherForecast(numericLat, numericLng)
      .then((response) => {
        const hours = response.data?.hourly?.time?.length ?? 0;
        const precipitation = response.data?.hourly?.precipitation ?? [];
        const peakRain = Array.isArray(precipitation) && precipitation.length > 0 ? Math.max(...precipitation) : 0;
        setRainSummary(`PEAK_PRECIPITATION: ${Number(peakRain).toFixed(1)} MM/H // WIN_WINDOW: ${hours}H`);
      })
      .catch(() => setRainSummary('ERROR: DATA_FETCH_FAILED')); 
  }, [numericLat, numericLng]);

  return (
    <Box h="100vh" w="100vw" position="relative" overflow="hidden" bg="sos.dark">
      {/* Primary Simulation Map View (Background) */}
      <Box position="absolute" inset={0} zIndex={0}>
        <LandslideSimulation sourceLat={numericLat} sourceLng={numericLng} />
      </Box>

      {/* Floating HUD - Left Side */}
      <VStack 
        position="absolute" 
        top={6} 
        left={6} 
        bottom={6} 
        w="360px" 
        zIndex={10} 
        spacing={6} 
        align="stretch"
        display={{ base: 'none', lg: 'flex' }}
      >
        <SimControlUnit 
          lat={lat}
          setLat={setLat}
          lng={lng}
          setLng={setLng}
          isSimulating={isSimulating}
          onRun={() => void run()}
          onRealtime={startRealtime}
        />

        <WeatherTelemetry summary={rainSummary} />

        {/* Results Visualizer - Floating Tactical Panel */}
        <Box 
          flex={1} 
          bg="rgba(15, 23, 42, 0.6)" 
          backdropFilter="blur(20px)"
          p={6} 
          borderRadius="3xl" 
          border="1px solid" 
          borderColor="whiteAlpha.100" 
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.4)"
          display="flex" 
          flexDirection="column"
          overflow="hidden"
        >
          <Text fontSize="10px" fontWeight="black" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="widest" mb={4}>Simulation Output</Text>
          
          {resultData ? (
            <SimpleGrid columns={3} spacing={4} mb={6}>
              <StatBoard label="Affected Area" value={`${(resultData?.estimatedAffectedAreaM2 / 1_000_000 || 0).toFixed(2)}`} unit="KM²" />
              <StatBoard label="Max Depth" value={`${resultData?.maxDepth || 0}`} unit="METERS" />
              <StatBoard label="Active Cells" value={`${resultData?.floodedCells?.length || 0}`} unit="PX" />
            </SimpleGrid>
          ) : (
            <Center flex={1} flexDirection="column" opacity={0.3}>
              <Icon as={Activity} size={32} />
              <Text mt={4} fontSize="xs" fontWeight="bold">AWATING_INPUT...</Text>
            </Center>
          )}

          <EventTimeline steps={streamSteps} />
        </Box>
      </VStack>

      {/* Floating Status - Top Right */}
      <Box position="absolute" top={6} right={6} zIndex={10}>
         <Badge 
           variant="solid" 
           bg="sos.red.500" 
           color="white" 
           borderRadius="full" 
           px={4} 
           py={1}
           fontSize="10px"
           fontWeight="black"
           letterSpacing="widest"
           boxShadow="0 0 20px rgba(255, 59, 48, 0.4)"
         >
           LIVE_TELEMETRY
         </Badge>
      </Box>
    </Box>
  );
}
