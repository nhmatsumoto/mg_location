import { Box, Text, VStack, HStack, Circle, type BoxProps } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

interface AlertCardProps extends BoxProps {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp?: string;
  onClick?: () => void;
}

const severityConfig = {
  critical: { color: 'sos.red.500', label: 'Critical' },
  warning: { color: 'orange.400', label: 'Warning' },
  info: { color: 'sos.blue.400', label: 'Info' },
};

const pulseAnimation = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

export function AlertCard({ title, description, severity, timestamp, onClick, ...props }: AlertCardProps) {
  const config = severityConfig[severity];

  return (
    <Box 
      p={4} 
      bg="whiteAlpha.50" 
      borderRadius="2xl" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      transition="all 0.3s"
      _hover={{ transform: 'translateX(4px)', bg: 'whiteAlpha.100', borderColor: config.color }}
      onClick={onClick}
      {...props}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Circle 
              size="8px" 
              bg={config.color} 
              animation={`${pulseAnimation} 2s infinite ease-in-out`}
              boxShadow={`0 0 10px ${config.color}`}
            />
            <Text fontSize="10px" fontWeight="black" color={config.color} textTransform="uppercase" letterSpacing="widest">
              {config.label}
            </Text>
          </HStack>
          {timestamp && (
            <Text fontSize="9px" color="whiteAlpha.400" fontWeight="bold">
              {timestamp}
            </Text>
          )}
        </HStack>
        
        <Box>
          <Text fontSize="xs" fontWeight="black" color="white" mb={1} noOfLines={1}>
            {title}
          </Text>
          <Text fontSize="10px" color="whiteAlpha.600" noOfLines={2} lineHeight="relaxed">
            {description}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
