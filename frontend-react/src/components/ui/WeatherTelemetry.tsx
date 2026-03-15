import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { CloudRain } from 'lucide-react';

interface WeatherTelemetryProps {
  summary: string;
}

export function WeatherTelemetry({ summary }: WeatherTelemetryProps) {
  return (
    <Box bg="whiteAlpha.50" p={6} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
      <Flex align="center" gap={3} mb={4}>
        <Icon as={CloudRain} size={16} color="sos.blue.400" />
        <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="widest">Weather Telemetry</Text>
      </Flex>
      <Box bg="sos.blue.500/10" p={4} borderRadius="xl" border="1px solid" borderColor="sos.blue.500/20">
        <Text fontSize="11px" fontWeight="black" color="sos.blue.400" fontFamily="mono" letterSpacing="tight">
          {summary}
        </Text>
      </Box>
    </Box>
  );
}
