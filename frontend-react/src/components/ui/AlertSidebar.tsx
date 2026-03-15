import React from 'react';
import { Bell, Info } from 'lucide-react';
import { Box, Flex, VStack, Text, Badge, Center, HStack, SimpleGrid } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCard } from './AlertCard';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: number | string;
  source: string;
  timestamp?: string;
  lat?: number;
  lon?: number;
  affectedPopulation?: number;
  sourceUrl?: string;
}

interface AlertSidebarProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  open?: boolean;
  kpis?: {
    criticalAlerts: number;
    activeTeams: number;
    missingPersons: number;
  };
}

export const AlertSidebar: React.FC<AlertSidebarProps> = ({ alerts, onAlertClick, open = true, kpis }) => {
  if (!open) return null;

  return (
    <Box
      position="absolute"
      top="120px"
      left={6}
      bottom={6}
      w="340px"
      bg="rgba(15, 23, 42, 0.6)"
      backdropFilter="blur(20px)"
      zIndex={40}
      display="flex"
      flexDirection="column"
      borderRadius="3xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.4)"
      overflow="hidden"
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <Box px={6} py={5} borderBottom="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.50">
        <Flex align="center" justify="space-between">
          <HStack spacing={3}>
            <Box p={2} bg="sos.blue.500" borderRadius="xl">
              <Bell size={18} color="white" />
            </Box>
            <Box>
              <Text fontSize="10px" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="widest" lineHeight="shorter">
                Command Feed
              </Text>
              <Text fontSize="9px" fontWeight="bold" color="sos.blue.400" fontFamily="mono">
                ENCRYPTED // LIVE
              </Text>
            </Box>
          </HStack>
          <Badge bg="sos.red.500" color="white" borderRadius="full" px={2} fontSize="10px" variant="solid">
            {alerts.length} ALERTS
          </Badge>
        </Flex>
      </Box>

      {kpis && (
        <SimpleGrid columns={3} spacing={3} p={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
          {[
            { val: kpis.criticalAlerts, label: 'Crítico', color: 'sos.red.400' },
            { val: kpis.activeTeams, label: 'Equipes', color: 'sos.blue.400' },
            { val: kpis.missingPersons, label: 'Buscas', color: 'orange.400' }
          ].map((kpiItem, idx) => (
            <VStack key={idx} spacing={0.5} p={3} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" transition="all 0.2s" _hover={{ bg: 'whiteAlpha.100' }}>
              <Text fontSize="md" fontWeight="black" color={kpiItem.color}>{kpiItem.val}</Text>
              <Text fontSize="8px" fontWeight="black" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="widest">{kpiItem.label}</Text>
            </VStack>
          ))}
        </SimpleGrid>
      )}

      <Box flex="1" overflowY="auto" p={4} className="custom-scrollbar">
        {alerts.length === 0 ? (
          <Center h="full" flexDir="column" opacity={0.3}>
            <Info size={32} color="white" />
            <Text mt={4} fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
              Silence Protocol
            </Text>
          </Center>
        ) : (
          <VStack spacing={4} align="stretch">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                title={alert.title}
                description={alert.description}
                severity={determineSeverity(alert.severity)}
                timestamp={alert.timestamp ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true, locale: ptBR }) : undefined}
                onClick={() => onAlertClick?.(alert)}
                cursor="pointer"
              />
            ))}
          </VStack>
        )}
      </Box>

      <Box p={4} bg="whiteAlpha.50" borderTop="1px solid" borderColor="whiteAlpha.100">
        <HStack justify="space-between" mb={2}>
          <Text fontSize="9px" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="widest">
            Telemetry Status
          </Text>
          <Text fontSize="9px" fontWeight="black" color="sos.green.400" fontFamily="mono">
            SECURE_LINK
          </Text>
        </HStack>
        <Box h="4px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
          <Box h="full" w="92%" bg="sos.blue.500" borderRadius="full" />
        </Box>
      </Box>
    </Box>
  );
};

const determineSeverity = (severity: number | string): 'critical' | 'warning' | 'info' => {
  const s = typeof severity === 'string' ? parseInt(severity) : severity;
  const lowerSeverity = severity.toString().toLowerCase();
  
  if (s >= 4 || lowerSeverity === 'perigo' || lowerSeverity === 'critical' || lowerSeverity === 'extremo') return 'critical';
  if (s >= 2 || lowerSeverity === 'atenção' || lowerSeverity === 'high' || lowerSeverity === 'warning') return 'warning';
  return 'info';
};
;
