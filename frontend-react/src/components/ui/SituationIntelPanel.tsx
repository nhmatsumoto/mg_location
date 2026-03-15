import { Box, VStack, HStack, Text, Flex, Badge, Icon } from '@chakra-ui/react';
import { Crosshair } from 'lucide-react';
import { DraggablePanel } from '../map/DraggablePanel';

interface SituationIntelPanelProps {
  event: any;
  onClose: () => void;
}

export function SituationIntelPanel({ event, onClose }: SituationIntelPanelProps) {
  if (!event) return null;

  return (
    <DraggablePanel
      title="SITUATION INTEL"
      position={{ top: 112, left: 340 }}
      onDragStart={() => {}}
      onToggleDock={onClose}
    >
      <Box p={4} bg="whiteAlpha.100" backdropFilter="blur(10px)">
        <VStack align="stretch" spacing={4}>
          <HStack spacing={1}>
            <Icon as={Crosshair} size={10} color="#4FD1C5" />
            <Text fontSize="9px" color="whiteAlpha.500" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
              ANÁLISE_TÁTICA
            </Text>
          </HStack>
          <Text fontSize="sm" fontWeight="black" color="white">
            {event.title || event.id}
          </Text>
          <Box bg="whiteAlpha.50" p={3} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="10px" fontFamily="mono" color="whiteAlpha.800" lineHeight="relaxed">
              {event.description || 'Nenhuma análise adicional disponível.'}
            </Text>
          </Box>
          <Flex justify="space-between" align="center">
            <Text fontSize="10px" color="whiteAlpha.500" fontWeight="black" textTransform="uppercase">
              Severidade
            </Text>
            <Badge variant="solid" colorScheme="red" fontSize="9px">
              LVL_{event.severity || 1}
            </Badge>
          </Flex>
        </VStack>
      </Box>
    </DraggablePanel>
  );
}
