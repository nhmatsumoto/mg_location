import { Bell, Bolt, Moon, Search, Sun } from 'lucide-react';
import { Box, Flex, HStack, IconButton, Input, InputGroup, InputLeftElement, Select, Badge, Button } from '@chakra-ui/react';

interface TopbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  notificationCount: number;
  onOpenNotifications: () => void;
  minimal?: boolean;
}

export function Topbar({ theme, onToggleTheme, notificationCount, onOpenNotifications, minimal }: TopbarProps) {

  if (minimal) {
    return (
      <Box as="header" p={2} bg="whiteAlpha.50" backdropFilter="blur(16px)" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl">
        <HStack spacing={2}>
          <Box position="relative">
            <IconButton
              size="sm"
              icon={<Bell size={14} />}
              aria-label="Notificações"
              onClick={onOpenNotifications}
              variant="tactical"
              bg="sos.blue.500"
              _hover={{ bg: 'sos.blue.600' }}
            />
            {notificationCount > 0 && (
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                bg="sos.red.500"
                color="white"
                borderRadius="full"
                fontSize="2xs"
                px={1}
              >
                {notificationCount}
              </Badge>
            )}
          </Box>
          <IconButton
            size="sm"
            icon={theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            aria-label="Alternar tema"
            onClick={onToggleTheme}
            variant="ghost"
            _hover={{ bg: 'whiteAlpha.100' }}
          />
        </HStack>
      </Box>
    );
  }

  return (
    <Box as="header" p={3} bg="whiteAlpha.50" backdropFilter="blur(16px)" border="1px solid" borderColor="whiteAlpha.100" borderRadius="2xl" boxShadow="xl">
      <Flex direction={{ base: 'column', xl: 'row' }} justify="space-between" align={{ base: 'stretch', xl: 'center' }} gap={2}>
        <HStack spacing={2} wrap="wrap">
          <Select 
            size="sm" 
            maxW="250px" 
            bg="sos.dark" 
            borderColor="whiteAlpha.200"
            color="white"
            borderRadius="md"
            _hover={{ borderColor: 'sos.blue.400' }}
          >
            <option>Evento: Enchente Zona da Mata</option>
            <option>Evento: Deslizamento Serra Azul</option>
          </Select>
          <InputGroup size="sm" maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Search size={14} color="gray" />
            </InputLeftElement>
            <Input 
              placeholder="Busca tática..." 
              bg="sos.dark" 
              borderColor="whiteAlpha.200"
              _placeholder={{ color: 'whiteAlpha.400' }}
              _focus={{ borderColor: 'sos.blue.400' }}
            />
          </InputGroup>
        </HStack>

        <HStack spacing={2}>
          <Box position="relative">
            <IconButton
              icon={<Bell size={16} />}
              aria-label="Abrir notificações"
              onClick={onOpenNotifications}
              bg="sos.dark"
              borderColor="whiteAlpha.200"
              _hover={{ bg: 'whiteAlpha.100' }}
            />
            {notificationCount > 0 && (
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                bg="sos.red.500"
                color="white"
                borderRadius="full"
                px={1.5}
                fontSize="xs"
              >
                {notificationCount}
              </Badge>
            )}
          </Box>
          <Button 
            leftIcon={<Bolt size={14} />} 
            variant="tactical"
            size="sm" 
            fontSize="xs"
          >
            AÇÕES RÁPIDAS
          </Button>
          <IconButton
            icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            aria-label="Alternar tema"
            onClick={onToggleTheme}
            bg="sos.dark"
            borderColor="whiteAlpha.200"
            _hover={{ bg: 'whiteAlpha.100' }}
          />
        </HStack>
      </Flex>
    </Box>
  );
}
