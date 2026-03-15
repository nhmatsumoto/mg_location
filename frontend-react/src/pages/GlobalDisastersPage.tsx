import { Globe, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  SimpleGrid, 
  Badge, 
  Button, 
  Icon,
  Center,
  Divider,
  Container
} from '@chakra-ui/react';

export function GlobalDisastersPage() {
  const globalEvents = [
    { id: 1, name: 'Ciclone Tropical - Pacífico Sul', status: 'Monitorando', severity: 'Alta', lastUpdate: '10m atrás' },
    { id: 2, name: 'Sismo 6.2 - Indonésia', status: 'Avaliação de Impacto', severity: 'Crítica', lastUpdate: '1h atrás' },
    { id: 3, name: 'Incêndios Florestais - Austrália', status: 'Ativo', severity: 'Média', lastUpdate: '4h atrás' },
  ];

  return (
    <Box minH="100vh" bg="sos.dark" py={12}>
      <Container maxW="container.xl">
        <VStack align="stretch" spacing={10}>
          {/* Header */}
          <VStack align="flex-start" spacing={3}>
            <HStack spacing={4}>
              <Box p={3} bg="sos.blue.500" borderRadius="2xl" boxShadow="xl">
                <Icon as={Globe} boxSize={6} color="white" />
              </Box>
              <Box>
                <Heading size="lg" color="white" textTransform="uppercase" letterSpacing="tighter">
                  Eventos Globais <Text as="span" color="sos.blue.400">de Desastre</Text>
                </Heading>
                <HStack spacing={2} mt={1}>
                  <Box w={2} h={2} borderRadius="full" bg="sos.green.500" />
                  <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="widest" fontFamily="mono">
                    GDACS INTEGRATED // LIVE_FEED
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <Text color="whiteAlpha.600" maxW="2xl" fontSize="md">
              Monitoramento estratégico de crises internacionais em tempo real. Padrão de dados sincronizado com sistemas de inteligência global.
            </Text>
          </VStack>

          <Divider borderColor="whiteAlpha.100" />

          {/* Grid of Event Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {globalEvents.map(event => (
              <Box 
                key={event.id}
                role="group"
                bg="rgba(15, 23, 42, 0.4)"
                backdropFilter="blur(16px)"
                borderRadius="3xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
                p={6}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  transform: 'translateY(-4px)', 
                  borderColor: 'sos.blue.500', 
                  bg: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: '0 12px 40px rgba(0, 51, 102, 0.3)'
                }}
              >
                <HStack justify="space-between" mb={4}>
                  <Badge 
                    px={3} 
                    py={1} 
                    borderRadius="full" 
                    bg={
                      event.severity === 'Crítica' ? 'sos.red.500' : 
                      event.severity === 'Alta' ? 'orange.500' : 'sos.blue.500'
                    }
                    color="white"
                    fontSize="9px"
                    fontWeight="black"
                    letterSpacing="widest"
                  >
                    {event.severity}
                  </Badge>
                  <HStack spacing={1.5}>
                    <Icon as={Clock} boxSize={3} color="whiteAlpha.400" />
                    <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.400" fontFamily="mono">
                      {event.lastUpdate}
                    </Text>
                  </HStack>
                </HStack>

                <Heading size="md" color="white" mb={2} lineHeight="tight">
                  {event.name}
                </Heading>
                
                <HStack spacing={2} mb={6} opacity={0.6}>
                  <Icon as={AlertCircle} boxSize={3.5} color="sos.blue.400" />
                  <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="wider">
                    {event.status}
                  </Text>
                </HStack>

                <Button 
                  variant="tactical" 
                  w="full" 
                  size="md" 
                  h="44px"
                  rightIcon={<Icon as={ExternalLink} boxSize={3.5} />}
                  borderRadius="xl"
                  fontSize="xs"
                  fontWeight="black"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  Ver Detalhes
                </Button>
              </Box>
            ))}
          </SimpleGrid>

          {/* Map Preview Placeholder Section */}
          <Box 
            p={10} 
            borderRadius="3xl" 
            border="1px dashed" 
            borderColor="whiteAlpha.200"
            bg="whiteAlpha.50"
            textAlign="center"
          >
            <VStack spacing={6}>
              <Center w={20} h={20} bg="sos.blue.500" borderRadius="full" color="white" boxShadow="0 0 30px rgba(0, 122, 255, 0.3)">
                <Icon as={Globe} boxSize={10} />
              </Center>
              <VStack spacing={2}>
                <Heading size="md" color="white">MAPA GLOBAL INTERATIVIVO</Heading>
                <Text color="whiteAlpha.500" maxW="md" fontSize="sm">
                  Integração com Mapbox e camadas do Sentinel-2 pendente. O monitoramento tático nacional tem prioridade sobre a visualização global no momento.
                </Text>
              </VStack>
              <Button variant="ghost" color="sos.blue.300" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
                Visualizar Prototipagem Global
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
