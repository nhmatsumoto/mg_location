import { Box, Flex, Text, HStack, Badge, Progress, Icon } from '@chakra-ui/react';
import { Zap } from 'lucide-react';
import { NewsFeed } from '../public/NewsFeed';
import type { NewsNotification } from '../../services/newsApi';

interface TacticalFeedSidebarProps {
  news: NewsNotification[];
  isLoading: boolean;
}

export function TacticalFeedSidebar({ news, isLoading }: TacticalFeedSidebarProps) {
  return (
    <Box
      position="absolute"
      left={6}
      top="112px"
      bottom={6}
      w="400px"
      zIndex={50}
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
      bg="whiteAlpha.50"
      backdropFilter="blur(20px)"
      borderRadius="3xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      boxShadow="2xl"
    >
      <Box p={8} pb={4} borderBottom="1px solid" borderColor="whiteAlpha.50">
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="10px" fontWeight="black" color="sos.blue.400" textTransform="uppercase" letterSpacing="widest">
              Live Intelligence
            </Text>
            <Text fontSize="xl" fontWeight="black" color="white" lineHeight="shorter">
              Situation Feed
            </Text>
          </Box>
          <Box
            p={3}
            borderRadius="2xl"
            bg="whiteAlpha.100"
            color="sos.blue.400"
            border="1px solid"
            borderColor="whiteAlpha.100"
          >
            <Icon as={Zap} size={20} fill="currentColor" />
          </Box>
        </Flex>

        <HStack spacing={2}>
          <Badge colorScheme="sosBlue" variant="solid" fontSize="9px" px={2} borderRadius="full">
            LIVE_STREAM
          </Badge>
          <Badge
            variant="outline"
            colorScheme="red"
            color="sos.red.400"
            borderColor="sos.red.500/20"
            fontSize="9px"
            px={2}
            borderRadius="full"
          >
            CRITICAL
          </Badge>
        </HStack>
      </Box>

      <Box flex={1} overflowY="auto" px={6} py={6} className="custom-scrollbar">
        <NewsFeed news={news} isLoading={isLoading} />
      </Box>

      <Box p={8} bg="whiteAlpha.50" borderTop="1px solid" borderColor="whiteAlpha.100">
        <Flex justify="space-between" mb={2}>
          <Text fontSize="9px" color="whiteAlpha.400" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
            System Integrity
          </Text>
          <Text fontSize="9px" color="sos.green.400" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
            Stable
          </Text>
        </Flex>
        <Progress value={92} size="xs" borderRadius="full" bg="whiteAlpha.100" colorScheme="emerald" h="4px" />
        <Text
          mt={4}
          fontSize="8px"
          color="whiteAlpha.300"
          textAlign="center"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="widest"
        >
          Guardian Public Portal // V3.0
        </Text>
      </Box>
    </Box>
  );
}
