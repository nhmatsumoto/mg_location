import React from 'react';
import { ShieldAlert, Crosshair, MousePointer2, MapPin, Camera, Activity, Users, PackageOpen, CloudRain, Globe, LogOut } from 'lucide-react';
import { Box, Flex, HStack, Text, IconButton, Button, Divider, Tooltip, Circle, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { CitySearch } from './CitySearch';
import { CountryDropdown } from './CountryDropdown';
import { ToolButton } from './ToolButton';
import { Logo } from '../brand/Logo';

interface SOSHeaderHUDProps {
  country: string;
  setCountry: (val: string) => void;
  onReset: () => void;
  activeTool: string;
  setTool: (tool: any) => void;
  stats?: {
    activeTeams: string | number;
    criticalAlerts: string | number;
    supplies: string | number;
    missingPersons?: string | number;
    climate?: {
      temp: number;
      humidity: number;
      windSpeed: number;
      description: string;
    };
  };
  onSearchSelect?: (lat: number, lon: number, displayName: string) => void;
}

export const SOSHeaderHUD: React.FC<SOSHeaderHUDProps> = ({
  country, setCountry, onReset, activeTool, setTool, stats, onSearchSelect
}) => {
  const navigate = useNavigate();
  const { clearAuth, user } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Box
      position="absolute"
      top={4}
      left={4}
      right={4}
      zIndex={50}
      px={6}
      h="80px"
      bg="rgba(15, 23, 42, 0.6)"
      backdropFilter="blur(24px)"
      borderRadius="full"
      border="1px solid"
      borderColor="whiteAlpha.100"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      boxShadow="2xl"
    >
      {/* Brand & Search Section */}
      <HStack spacing={6}>
        <Flex align="center" gap={3}>
          <Box p={2.5} bg="sos.blue.500" borderRadius="xl" boxShadow="lg">
            <Logo w="24px" h="24px" color="white" />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="widest" lineHeight="shorter">
              SOS <Text as="span" color="sos.red.500">GUARDIAN</Text>
            </Text>
            <HStack spacing={1.5} align="center" opacity={0.6}>
              <Box w={1.5} h={1.5} borderRadius="full" bg="sos.green.500" />
              <Text fontSize="9px" fontWeight="bold" color="whiteAlpha.700" fontFamily="mono" textTransform="uppercase" letterSpacing="wider">
                {user?.preferredUsername || 'OPERATOR'} // PRO
              </Text>
            </HStack>
          </Box>
        </Flex>

        <Divider orientation="vertical" h="40px" borderColor="whiteAlpha.200" />

        <HStack spacing={3}>
          <CitySearch onSelect={onSearchSelect} />
          <CountryDropdown value={country} onChange={setCountry} />
        </HStack>

        <Button 
          variant="ghost" 
          leftIcon={<Globe size={16} />} 
          size="sm" 
          fontSize="10px" 
          fontWeight="black" 
          color="sos.blue.400" 
          textTransform="uppercase" 
          letterSpacing="widest"
          onClick={() => navigate('/map')}
          _hover={{ bg: 'sos.blue.500/10' }}
        >
          Ir para Mapa Público
        </Button>
      </HStack>

      {/* Center Section: KPIs */}
      <HStack spacing={10} px={8} py={2.5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" display={{ base: 'none', '2xl': 'flex' }}>
        {[
          { label: 'Equipes', value: stats?.activeTeams, icon: Users, color: 'sos.blue.400' },
          { label: 'Alertas', value: stats?.criticalAlerts, icon: Activity, color: 'sos.red.400' },
          { label: 'Logística', value: stats?.supplies, icon: PackageOpen, color: 'sos.green.400' },
          { label: 'Buscas', value: stats?.missingPersons, icon: MapPin, color: 'orange.400' }
        ].map((kpi, idx) => (
          <HStack key={idx} spacing={4}>
            <Circle size="40px" bg="whiteAlpha.100">
               <Icon as={kpi.icon} size={18} color={kpi.color} />
            </Circle>
            <Box>
              <Text fontSize="8px" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="widest" mb={0.5}>
                {kpi.label}
              </Text>
              <Text fontSize="md" fontWeight="black" color="white" lineHeight="none">
                {kpi.value || '0'}
              </Text>
            </Box>
          </HStack>
        ))}
      </HStack>

      {/* Right Section: Tools & Account */}
      <HStack spacing={4}>
        {/* Climate */}
        <HStack spacing={3} bg="whiteAlpha.50" px={4} py={3} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" display={{ base: 'none', lg: 'flex' }}>
          <CloudRain size={16} color="#4FD1C5" />
          <Box>
            <Text fontSize="8px" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="widest" mb={0.5}>
              Ambiente
            </Text>
            <Text fontSize="xs" fontWeight="black" color="white" lineHeight="none">
              {stats?.climate?.temp ?? '24'}°C
            </Text>
          </Box>
        </HStack>

        <HStack spacing={1.5} p={1.5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
          <ToolButton active={activeTool === 'inspect'} onClick={() => setTool('inspect')} icon={<MousePointer2 size={18} />} label="Inspecionar" hideLabel />
          <ToolButton active={activeTool === 'point'} onClick={() => setTool('point')} icon={<MapPin size={18} />} label="Marcar Ponto" hideLabel />
          <ToolButton active={activeTool === 'area'} onClick={() => setTool('area')} icon={<ShieldAlert size={18} />} label="Área de Risco" hideLabel />
          <ToolButton active={activeTool === 'snapshot'} onClick={() => setTool('snapshot')} icon={<Camera size={18} />} label="Captura" hideLabel />
        </HStack>

        <HStack spacing={2}>
          <Tooltip label="Centralizar Mapa">
            <IconButton
              icon={<Crosshair size={20} />}
              aria-label="Reset Map"
              variant="tactical"
              onClick={onReset}
              borderRadius="xl"
              w="44px"
              h="44px"
            />
          </Tooltip>
          <Tooltip label="Encerrar Sessão">
            <IconButton
              icon={<LogOut size={20} />}
              aria-label="Logout"
              variant="ghost"
              color="sos.red.400"
              onClick={handleLogout}
              borderRadius="xl"
              w="44px"
              h="44px"
              _hover={{ bg: 'sos.red.500/10' }}
            />
          </Tooltip>
        </HStack>
      </HStack>
    </Box>
  );
};
