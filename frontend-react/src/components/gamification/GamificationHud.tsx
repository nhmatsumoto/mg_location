import { Trophy, Shield } from 'lucide-react';
import { Box, Flex, Text, Progress, Circle, VStack, HStack, type BoxProps } from '@chakra-ui/react';

interface GamificationHudProps extends BoxProps {
  xp: number;
  level: number;
  rank: string;
  nextLevelXp: number;
}

export function GamificationHud({ xp, level, rank, nextLevelXp, ...props }: GamificationHudProps) {
  const progress = (xp / nextLevelXp) * 100;

  return (
    <Box 
      bg="whiteAlpha.50" 
      backdropFilter="blur(20px)" 
      p={4} 
      borderRadius="2xl" 
      border="1px solid"
      borderColor="whiteAlpha.100"
      boxShadow="xl"
      {...props}
    >
      <HStack spacing={4}>
        <Box position="relative">
          <Circle 
            size="52px" 
            bg="sos.blue.500" 
            color="white" 
            fontWeight="black" 
            fontSize="xl"
            border="4px solid"
            borderColor="whiteAlpha.200"
            boxShadow="0 0 20px rgba(0, 51, 102, 0.4)"
          >
            {level}
          </Circle>
          <Circle 
            position="absolute" 
            bottom="-1" 
            right="-1" 
            bg="sos.red.500" 
            size="22px" 
            boxShadow="lg"
            border="2px solid"
            borderColor="sos.dark"
          >
            <Shield size={12} color="white" />
          </Circle>
        </Box>

        <VStack flex={1} align="stretch" spacing={2}>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <Text fontSize="11px" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="widest" lineHeight="shorter">
                {rank}
              </Text>
              <Text fontSize="8px" fontWeight="bold" color="whiteAlpha.400" textTransform="uppercase">
                Sentinel Class IV
              </Text>
            </VStack>
            <Text fontSize="9px" fontWeight="bold" color="sos.blue.400" fontFamily="mono">
              {xp} / {nextLevelXp} XP
            </Text>
          </Flex>
          
          <Box position="relative" pt={1}>
            <Progress 
              value={progress} 
              size="xs" 
              borderRadius="full" 
              bg="whiteAlpha.100" 
              colorScheme="sosBlue" 
              h="6px"
            />
          </Box>
        </VStack>

        <Box pl={4} borderLeft="1px solid" borderColor="whiteAlpha.100" display={{ base: 'none', lg: 'block' }}>
          <VStack spacing={0} align="center">
            <Trophy size={16} color="#4FD1C5" />
            <Text fontSize="8px" fontWeight="black" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="tighter" mt={1}>Badges</Text>
            <Text fontSize="xs" fontWeight="black" color="white">12</Text>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
}
