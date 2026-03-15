import { VStack, Flex, HStack, Badge, Text } from '@chakra-ui/react';

interface StreamStep {
  step: number;
  lat: number;
  lng: number;
  depth: number;
  risk: string;
}

interface EventTimelineProps {
  steps: StreamStep[];
}

export function EventTimeline({ steps }: EventTimelineProps) {
  if (steps.length === 0) return null;

  return (
    <VStack flex={1} overflowY="auto" spacing={2} align="stretch" mt={4} className="custom-scrollbar">
      <Text fontSize="9px" fontWeight="black" color="whiteAlpha.300" textTransform="uppercase">
        Event Timeline
      </Text>
      {steps.map((step) => (
        <Flex
          key={`${step.step}-${step.lat}`}
          justify="space-between"
          bg="whiteAlpha.50"
          p={2}
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.50"
        >
          <HStack spacing={3}>
            <Badge colorScheme="sosBlue" variant="solid" fontSize="8px">
              #{step.step}
            </Badge>
            <Text fontSize="10px" color="whiteAlpha.600" fontFamily="mono">
              {step.lat.toFixed(4)}, {step.lng.toFixed(4)}
            </Text>
          </HStack>
          <Text fontSize="10px" fontWeight="black" color="sos.blue.400">
            {step.depth.toFixed(2)}M
          </Text>
        </Flex>
      ))}
    </VStack>
  );
}
