import { useEffect, useState, Suspense, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { StatusStrip } from './StatusStrip';
import { ToastStack } from '../feedback/ToastStack';
import { NotificationCenter } from '../feedback/NotificationCenter';
import { useNotifications } from '../../context/NotificationsContext';
import { setApiNotifier } from '../../services/apiClient';
import { Box, Flex, Grid, Spinner, Center } from '@chakra-ui/react';

interface AppShellProps {
  children: ReactNode;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  variant?: 'default' | 'tactical';
}

export function AppShell({ children, theme, onToggleTheme, variant = 'default' }: AppShellProps) {
  const { notices, pushNotice } = useNotifications();
  const [openCenter, setOpenCenter] = useState(false);

  useEffect(() => {
    setApiNotifier((title, message) => pushNotice({ title, message, type: 'error' }));
  }, [pushNotice]);

  if (variant === 'tactical') {
    return (
      <Box minH="100vh" bg="sos.dark" color="white">
        <Flex h="100vh" w="full" overflow="hidden">
          <Sidebar h="full" w="72" borderRight="1px solid" borderColor="whiteAlpha.100" />
          <Box as="main" flex="1" position="relative" overflow="hidden">
            <Suspense fallback={
              <Center h="full" flexDir="column">
                <Spinner size="xl" color="sos.blue.500" thickness="4px" />
                <Box mt={4} fontWeight="bold" color="whiteAlpha.700" fontFamily="mono" textTransform="uppercase" letterSpacing="widest">
                  Inicializando Guardian Network...
                </Box>
              </Center>
            }>
              {children}
            </Suspense>
            <Box position="absolute" top={4} right={4} zIndex={40}>
              <Topbar
                theme={theme}
                onToggleTheme={onToggleTheme}
                notificationCount={notices.length}
                onOpenNotifications={() => setOpenCenter(true)}
                minimal
              />
            </Box>
          </Box>
        </Flex>
        <NotificationCenter open={openCenter} onClose={() => setOpenCenter(false)} />
        <ToastStack />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="sos.dark">
      <Grid 
        templateColumns={{ base: '1fr', lg: '300px 1fr' }} 
        gap={4} 
        p={4} 
        maxW="1800px" 
        mx="auto" 
        minH="100vh"
      >
        <Sidebar />
        <Box as="main" display="flex" flexDirection="column" gap={4}>
          <Topbar
            theme={theme}
            onToggleTheme={onToggleTheme}
            notificationCount={notices.length}
            onOpenNotifications={() => setOpenCenter(true)}
          />
          <StatusStrip />
          <Box flex="1" position="relative">
            {children}
          </Box>
        </Box>
      </Grid>
      <NotificationCenter open={openCenter} onClose={() => setOpenCenter(false)} />
      <ToastStack />
    </Box>
  );
}
