import { Target, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { Box, Flex, VStack, Text, Icon, HStack, Progress } from '@chakra-ui/react';

interface Mission {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  type: 'report' | 'validate' | 'rescue';
}

const mockMissions: Mission[] = [
  { id: '1', title: 'VALIDAR_3_AREAS_RISCO', reward: 500, completed: false, type: 'validate' },
  { id: '2', title: 'REPORTAR_INUNDACAO_ATIVA', reward: 300, completed: true, type: 'report' },
  { id: '3', title: 'CONFIRMAR_EQUIPE_ZONA_B', reward: 200, completed: false, type: 'rescue' },
];

export function MissionsPanel() {
  return (
    <Box
      w="340px"
      bg="rgba(15, 23, 42, 0.4)"
      backdropFilter="blur(24px)"
      borderRadius="3xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      boxShadow="2xl"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Box p={6} pb={3}>
        <Flex align="center" justify="space-between">
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="9px" fontWeight="black" color="sos.blue.400" textTransform="uppercase" letterSpacing="widest">
              OBJETIVOS_TATICOS
            </Text>
            <Text fontSize="md" fontWeight="black" color="white">
              Missões de Campo
            </Text>
          </VStack>
          <Box
            w="32px"
            h="32px"
            borderRadius="full"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={Target} boxSize="14px" color="sos.blue.400" />
          </Box>
        </Flex>
      </Box>

      <VStack spacing={0} align="stretch" px={2} pb={4}>
        {mockMissions.map((mission) => (
          <HStack 
            key={mission.id} 
            px={4}
            py={3}
            borderRadius="2xl"
            cursor="pointer"
            role="group"
            transition="all 0.2s"
            _hover={{ bg: mission.completed ? 'transparent' : 'whiteAlpha.50' }}
            opacity={mission.completed ? 0.4 : 1}
          >
            <Icon 
              as={mission.completed ? CheckCircle2 : Circle} 
              size={18} 
              color={mission.completed ? 'sos.green.400' : 'whiteAlpha.400'} 
            />
            <VStack align="flex-start" spacing={0} flex={1}>
              <Text 
                fontSize="xs" 
                fontWeight="bold" 
                color="white" 
                fontFamily="mono"
                textDecoration={mission.completed ? 'line-through' : 'none'}
              >
                {mission.title}
              </Text>
              <Text fontSize="9px" fontWeight="black" color="sos.blue.500">
                RECOMPENSA: +{mission.reward} XP
              </Text>
            </VStack>
            {!mission.completed && (
              <Icon 
                as={ChevronRight} 
                size={14} 
                color="whiteAlpha.300" 
                _groupHover={{ color: 'sos.blue.400', transform: 'translateX(2px)' }} 
                transition="all 0.2s"
              />
            )}
          </HStack>
        ))}
      </VStack>

      <Box p={6} pt={2} bg="blackAlpha.300">
         <Flex align="center" justify="space-between" mb={2}>
            <Text fontSize="9px" fontWeight="black" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="widest">
              EFICENCIA_OPERACIONAL
            </Text>
            <Text fontSize="10px" fontWeight="bold" color="sos.blue.400" fontFamily="mono">80.4%</Text>
         </Flex>
         <Progress 
           value={80.4} 
           size="xs" 
           colorScheme="blue" 
           bg="whiteAlpha.50" 
           borderRadius="full" 
           boxShadow="0 0 15px rgba(0, 102, 255, 0.2)"
         />
      </Box>
    </Box>
  );
}
