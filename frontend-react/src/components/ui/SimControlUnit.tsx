import { Box, Flex, VStack, HStack, Text, Input, Button, Icon, SimpleGrid } from '@chakra-ui/react';
import { Activity, Play, RefreshCw } from 'lucide-react';

interface SimControlUnitProps {
  lat: string;
  setLat: (val: string) => void;
  lng: string;
  setLng: (val: string) => void;
  isSimulating: boolean;
  onRun: () => void;
  onRealtime: () => void;
}

export function SimControlUnit({ lat, setLat, lng, setLng, isSimulating, onRun, onRealtime }: SimControlUnitProps) {
  return (
    <Box 
      bg="whiteAlpha.50" 
      p={6} 
      borderRadius="2xl" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      position="relative"
      overflow="hidden"
    >
      <Flex align="center" justify="space-between" mb={6}>
        <VStack align="start" spacing={0}>
          <Text fontSize="10px" fontWeight="black" color="sos.blue.400" textTransform="uppercase" letterSpacing="widest">
            Simulation Unit
          </Text>
          <Text fontSize="xl" fontWeight="black" color="white">Tactical Forecaster</Text>
        </VStack>
        <Box p={3} bg="whiteAlpha.100" borderRadius="xl" color="sos.blue.400">
          <Icon as={Activity} size={20} />
        </Box>
      </Flex>

      <SimpleGrid columns={2} spacing={4} mb={6}>
        <Box>
          <Text fontSize="9px" fontWeight="black" color="whiteAlpha.400" mb={1} textTransform="uppercase">Latitude Origin</Text>
          <Input 
            value={lat} 
            onChange={(e) => setLat(e.target.value)} 
            bg="blackAlpha.400" 
            border="1px solid" 
            borderColor="whiteAlpha.100" 
            fontSize="xs" 
            h="44px"
            fontWeight="bold"
            _focus={{ borderColor: 'sos.blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-sos-blue-500)' }}
          />
        </Box>
        <Box>
          <Text fontSize="9px" fontWeight="black" color="whiteAlpha.400" mb={1} textTransform="uppercase">Longitude Origin</Text>
          <Input 
            value={lng} 
            onChange={(e) => setLng(e.target.value)} 
            bg="blackAlpha.400" 
            border="1px solid" 
            borderColor="whiteAlpha.100" 
            fontSize="xs" 
            h="44px"
            fontWeight="bold"
            _focus={{ borderColor: 'sos.blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-sos-blue-500)' }}
          />
        </Box>
      </SimpleGrid>

      <HStack spacing={3}>
        <Button 
          leftIcon={<Play size={16} />} 
          variant="tactical" 
          flex={1} 
          h="48px"
          isLoading={isSimulating}
          onClick={onRun}
        >
          RUN ANALYTICAL
        </Button>
        <Button 
          leftIcon={<RefreshCw size={16} />} 
          variant="outline" 
          flex={1} 
          h="48px"
          borderColor="whiteAlpha.200"
          color="whiteAlpha.700"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
          onClick={onRealtime}
        >
          REALTIME REPLAY
        </Button>
      </HStack>
    </Box>
  );
}
