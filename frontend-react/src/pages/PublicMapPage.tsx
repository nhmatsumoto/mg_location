import { useEffect, useState } from 'react';
import { MapPin, Plus, Minus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { newsApi } from '../services/newsApi';
import type { NewsNotification } from '../services/newsApi';
import { PublicPortalMap } from '../components/public/PublicPortalMap';
import { GamificationHud } from '../components/gamification/GamificationHud';
import { LogoFull } from '../components/brand/Logo';
import { 
  Box, 
  Flex, 
  HStack, 
  VStack, 
  Text, 
  IconButton, 
  Portal,
  Tooltip
} from '@chakra-ui/react';

// Atomic Components
import { TacticalFeedSidebar } from '../components/ui/TacticalFeedSidebar';
import { PublicFilterBar } from '../components/ui/PublicFilterBar';

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
  }, [countryFilter, locationFilter]);

  return (
    <Box h="100vh" w="full" bg="sos.dark" color="white" overflow="hidden" position="relative">
      {/* Guardian Public Header */}
      <Portal>
        <Box 
          position="fixed" 
          top={6} 
          left="50%" 
          transform="translateX(-50%)" 
          zIndex={100} 
          w="calc(100% - 3rem)" 
          maxW="1400px"
        >
          <Flex 
            bg="whiteAlpha.50" 
            backdropFilter="blur(20px)"
            px={8} 
            h="80px" 
            align="center" 
            justify="space-between" 
            borderRadius="3xl" 
            border="1px solid" 
            borderColor="whiteAlpha.100"
            boxShadow="2xl"
          >
            {/* Logo Section */}
            <Box>
              <LogoFull />
              <HStack spacing={1.5} mt={1}>
                <Box h="6px" w="6px" borderRadius="full" bg="sos.green.500" boxShadow="0 0 8px rgba(0, 255, 102, 0.4)" />
                <Text fontSize="8px" color="whiteAlpha.500" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
                  Guardian Network Active
                </Text>
              </HStack>
            </Box>

            {/* Tactical Filter Bar */}
            <PublicFilterBar 
              countryFilter={countryFilter}
              setCountryFilter={setCountryFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
            />

            <HStack spacing={6}>
              <GamificationHud 
                xp={3420} 
                level={42} 
                rank="Sentinel III" 
                nextLevelXp={5000} 
                display={{ base: 'none', xl: 'flex' }}
                bg="transparent"
                border="none"
                boxShadow="none"
                p={0}
              />
              <Tooltip label="Acesso Restrito">
                <IconButton
                  aria-label="Login"
                  icon={<LogIn size={20} />}
                  variant="tactical"
                  onClick={() => navigate('/login')}
                  h="50px"
                  w="50px"
                />
              </Tooltip>
            </HStack>
          </Flex>
        </Box>
      </Portal>

      <Flex as="main" h="full" w="full">
        {/* Sidebar - Tactical Feed */}
        <TacticalFeedSidebar news={news} isLoading={isLoading} />

        {/* Full Screen Map Container */}
        <Box flex={1} position="relative">
          <PublicPortalMap news={news} />
          
          {/* Tactical Map Controls */}
          <VStack position="absolute" bottom={10} right={10} zIndex={50} spacing={3}>
             <IconButton 
              aria-label="Localização" 
              icon={<MapPin size={20} />} 
              variant="tactical"
              h="50px"
              w="50px"
             />
             <VStack spacing={0} bg="whiteAlpha.50" backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" boxShadow="xl">
               <IconButton 
                aria-label="Zoom In" 
                icon={<Plus size={20} />} 
                variant="ghost"
                h="50px"
                w="50px"
                color="whiteAlpha.600"
                _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
               />
               <Box w="100%" h="1px" bg="whiteAlpha.100" />
               <IconButton 
                aria-label="Zoom Out" 
                icon={<Minus size={20} />} 
                variant="ghost"
                h="50px"
                w="50px"
                color="whiteAlpha.600"
                _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
               />
             </VStack>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}

