import { Flex, VStack, HStack, Text, Badge, Divider, Icon, Link, Box } from '@chakra-ui/react';
import { Calendar, Cloud, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { NewsNotification } from '../../services/newsApi';

interface IntelPopupContentProps {
  item: NewsNotification;
}

export function IntelPopupContent({ item }: IntelPopupContentProps) {
  return (
    <VStack align="stretch" spacing={3} minW="260px" p={1}>
      <Flex justify="space-between" align="start">
        <VStack align="start" spacing={1}>
          <Badge colorScheme="whiteAlpha" fontSize="9px" px={2}>
            {item.category.toUpperCase()}
          </Badge>
          <HStack spacing={1} color="whiteAlpha.400">
            <Icon as={Calendar} size={10} />
            <Text fontSize="9px" fontWeight="bold">
              {format(new Date(item.publishedAt), 'dd/MM/yyyy', { locale: ptBR })}
            </Text>
          </HStack>
        </VStack>
        <Badge
          variant="solid"
          colorScheme={item.riskScore > 80 ? 'red' : item.riskScore > 50 ? 'orange' : 'green'}
          fontSize="9px"
          px={2}
        >
          SCORE: {item.riskScore.toFixed(0)}
        </Badge>
      </Flex>

      <Text fontSize="sm" fontWeight="black" color="white" lineHeight="tight">
        {item.title}
      </Text>

      {item.climateInfo && (
        <Box bg="sos.blue.500/10" p={2} borderRadius="lg" border="1px solid" borderColor="sos.blue.500/20">
          <HStack align="start" spacing={2}>
            <Icon as={Cloud} size={14} color="sos.blue.400" mt={1} />
            <Text fontSize="10px" color="sos.blue.200" fontWeight="bold">
              {item.climateInfo}
            </Text>
          </HStack>
        </Box>
      )}

      <Text fontSize="11px" color="whiteAlpha.600" noOfLines={3}>
        {item.content}
      </Text>

      <Divider borderColor="whiteAlpha.100" />

      <Flex justify="space-between" align="center">
        <Text fontSize="9px" fontWeight="black" color="whiteAlpha.400" textTransform="uppercase">
          SOURCE: {item.source}
        </Text>
        {item.externalUrl && (
          <Link
            href={item.externalUrl}
            isExternal
            fontSize="9px"
            fontWeight="black"
            color="sos.blue.400"
            display="flex"
            alignItems="center"
            gap={1}
            textTransform="uppercase"
          >
            INTEL <Icon as={ExternalLink} size={10} />
          </Link>
        )}
      </Flex>
    </VStack>
  );
}
