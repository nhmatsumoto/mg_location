import { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  SimpleGrid, 
  Switch, 
  FormControl, 
  FormLabel,
  Input,
  Button,
  Icon,
  Badge,
  Divider,
  Container,
  Circle
} from '@chakra-ui/react';
import { Settings, ShieldCheck, Activity, Database, Satellite, Save, Key } from 'lucide-react';
import { authApi } from '../services/authApi';

export function SettingsPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('SYSTEM_IDLE // NO_SESSION');

  const register = async () => {
    try {
      const payload = await authApi.register({ username, password, email });
      setToken(payload.token);
      setStatus(`USER_REGISTERED: ${payload.user.username}`);
    } catch {
      setStatus('REGISTER_FAILED: SERVER_ERROR');
    }
  };

  const login = async () => {
    try {
      const payload = await authApi.login({ username, password });
      setToken(payload.token);
      setStatus(`SESSION_ESTABLISHED // ${payload.user.username}`);
    } catch {
      setStatus('AUTH_FAILED: INVALID_CREDENTIALS');
    }
  };

  const validateSession = async () => {
    try {
      const me = await authApi.me(token);
      setStatus(`SESSION_VALID // ${me.user.username}`);
    } catch {
      setStatus('TOKEN_INVALID // EXPIRED');
    }
  };

  const services = [
    { name: 'GIS Data Engine', status: 'Operational', icon: Satellite, color: 'sos.green.500' },
    { name: 'SignalR Hub', status: 'Active', icon: Activity, color: 'sos.green.500' },
    { name: 'Primary DB (Postgraphile)', status: 'Operational', icon: Database, color: 'sos.green.500' },
    { name: 'Risk Analytics AI', status: 'Calibrating', icon: ShieldCheck, color: 'orange.400' },
  ];

  return (
    <Box minH="100vh" bg="sos.dark" py={8}>
      <Container maxW="container.xl">
        <VStack align="stretch" spacing={8}>
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="flex-start" spacing={1}>
              <HStack>
                <Icon as={Settings} color="sos.blue.500" />
                <Heading size="md" color="white" textTransform="uppercase" letterSpacing="widest">
                  Centro de <Text as="span" color="sos.blue.400">Configurações</Text>
                </Heading>
              </HStack>
              <Text fontSize="xs" color="whiteAlpha.500" fontFamily="mono">TERMINAL_VERSION: 1.2.0-PRO</Text>
            </VStack>
            <Button variant="tactical" leftIcon={<Save size={16} />}>Salvar Alterações</Button>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
            {/* Column 1: Operational Config */}
            <Box 
              bg="rgba(15, 23, 42, 0.4)" 
              backdropFilter="blur(16px)" 
              borderRadius="3xl" 
              border="1px solid" 
              borderColor="whiteAlpha.100" 
              p={6}
            >
              <VStack align="stretch" spacing={6}>
                <Heading size="xs" color="white" textTransform="uppercase" letterSpacing="widest">Configurações Base</Heading>
                <VStack align="stretch" spacing={4}>
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel mb="0" fontSize="sm" color="whiteAlpha.800">Atualização Automática</FormLabel>
                    <Switch colorScheme="blue" defaultChecked />
                  </FormControl>
                  <Divider borderColor="whiteAlpha.100" />
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel mb="0" fontSize="sm" color="whiteAlpha.800">Notificações Críticas</FormLabel>
                    <Switch colorScheme="red" defaultChecked />
                  </FormControl>
                  <Divider borderColor="whiteAlpha.100" />
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel mb="0" fontSize="sm" color="whiteAlpha.800">Modo de Alta Precisão</FormLabel>
                    <Switch colorScheme="teal" />
                  </FormControl>
                </VStack>
                <Box pt={4}>
                  <Text fontSize="10px" color="whiteAlpha.400" mb={2}>ALERT_SOUND_ENGINE</Text>
                  <Button size="xs" variant="ghost" color="sos.blue.300">Testar Audibilidade</Button>
                </Box>
              </VStack>
            </Box>

            {/* Column 2: Authentication */}
            <Box 
              bg="rgba(15, 23, 42, 0.4)" 
              backdropFilter="blur(16px)" 
              borderRadius="3xl" 
              border="1px solid" 
              borderColor="whiteAlpha.100" 
              p={6}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="xs" color="white" textTransform="uppercase" letterSpacing="widest" mb={2}>Comando e Controle</Heading>
                <Input placeholder="Usuário" bg="whiteAlpha.50" border="none" _focus={{ bg: 'whiteAlpha.100' }} value={username} onChange={e => setUsername(e.target.value)} />
                <Input placeholder="E-mail" bg="whiteAlpha.50" border="none" _focus={{ bg: 'whiteAlpha.100' }} value={email} onChange={e => setEmail(e.target.value)} />
                <Input type="password" placeholder="Senha" bg="whiteAlpha.50" border="none" _focus={{ bg: 'whiteAlpha.100' }} value={password} onChange={e => setPassword(e.target.value)} />
                
                <SimpleGrid columns={2} spacing={2} pt={2}>
                  <Button size="sm" variant="tactical" onClick={login}>Entrar</Button>
                  <Button size="sm" variant="ghost" onClick={register}>Registrar</Button>
                </SimpleGrid>

                <Box mt={4} p={3} bg="whiteAlpha.50" borderRadius="xl">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.400">ACCESS_TOKEN</Text>
                    <Icon as={Key} size={12} color="sos.blue.400" />
                  </HStack>
                  <Text fontSize="9px" color="sos.blue.200" isTruncated>{token || 'NO_REMOTE_TOKEN'}</Text>
                  <Button size="xs" mt={2} variant="ghost" w="full" onClick={validateSession}>Validar Sessão</Button>
                </Box>
                <Badge textAlign="center" py={1} borderRadius="md" bg="sos.blue.900" color="sos.blue.100" fontSize="9px" fontFamily="mono">{status}</Badge>
              </VStack>
            </Box>

            {/* Column 3: Service Health */}
            <Box 
              bg="rgba(15, 23, 42, 0.4)" 
              backdropFilter="blur(16px)" 
              borderRadius="3xl" 
              border="1px solid" 
              borderColor="whiteAlpha.100" 
              p={6}
            >
              <VStack align="stretch" spacing={6}>
                <Heading size="xs" color="white" textTransform="uppercase" letterSpacing="widest">Status dos Sistemas</Heading>
                <VStack align="stretch" spacing={4}>
                  {services.map((service, idx) => (
                    <HStack key={idx} justify="space-between" p={3} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                      <HStack spacing={3}>
                        <Circle size="32px" bg="whiteAlpha.50">
                          <Icon as={service.icon} boxSize={4} color={service.color} />
                        </Circle>
                        <VStack align="flex-start" spacing={0}>
                          <Text fontSize="xs" fontWeight="bold" color="white">{service.name}</Text>
                          <Text fontSize="9px" color="whiteAlpha.500" fontFamily="mono">ESTABLISHED</Text>
                        </VStack>
                      </HStack>
                      <Badge variant="subtle" colorScheme={service.status === 'Operational' || service.status === 'Active' ? 'green' : 'orange'} fontSize="9px">{service.status}</Badge>
                    </HStack>
                  ))}
                </VStack>
                <HStack p={4} bg="sos.blue.900" borderRadius="2xl" justify="space-between">
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="10px" fontWeight="black" color="sos.blue.100">DASHBOARD_UPTIME</Text>
                    <Text fontSize="14px" fontWeight="black" color="white" fontFamily="mono">99.98%</Text>
                  </VStack>
                  <Icon as={Activity} color="sos.blue.300" />
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
