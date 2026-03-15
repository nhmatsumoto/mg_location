import { VStack, SimpleGrid, Button, Text, FormControl, FormLabel, Input } from '@chakra-ui/react';

interface TacticalOpsFormProps {
  opsForm: any;
  setOpsForm: (form: any) => void;
  onSave: () => void;
}

export function TacticalOpsForm({ opsForm, setOpsForm, onSave }: TacticalOpsFormProps) {
  const modes = [
    { id: 'voluntario', label: 'Voluntário' },
    { id: 'doacao', label: 'Doação' },
    { id: 'resgate', label: 'Equipe Resgate' },
    { id: 'bombeiros', label: 'Bombeiros' },
    { id: 'exercito', label: 'Exército' },
    { id: 'risk_area', label: 'Área de Risco' },
    { id: 'missing_person', label: 'Busca Pessoa' },
  ];

  return (
    <VStack spacing={4} p={6} align="stretch" bg="sos.dark" borderRadius="2xl">
      <SimpleGrid columns={2} spacing={3}>
        {modes.map((mode) => (
          <Button
            key={mode.id}
            onClick={() => setOpsForm({ ...opsForm, recordType: mode.id as any })}
            h="60px"
            variant="outline"
            borderColor={opsForm.recordType === mode.id ? 'sos.blue.500' : 'whiteAlpha.100'}
            bg={opsForm.recordType === mode.id ? 'whiteAlpha.100' : 'transparent'}
            color={opsForm.recordType === mode.id ? 'white' : 'whiteAlpha.600'}
            _hover={{ borderColor: 'sos.blue.400', bg: 'whiteAlpha.50' }}
            borderRadius="xl"
          >
            <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
              {mode.label}
            </Text>
          </Button>
        ))}
      </SimpleGrid>
      <FormControl>
        <FormLabel fontSize="9px" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="widest" ml={1}>
          Descrição do Registro
        </FormLabel>
        <Input
          placeholder="Digite os detalhes da operação..."
          value={opsForm.incidentTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpsForm({ ...opsForm, incidentTitle: e.target.value })}
          bg="whiteAlpha.50"
          borderColor="whiteAlpha.100"
          fontSize="xs"
          borderRadius="xl"
          h="50px"
          _focus={{ borderColor: 'sos.blue.500' }}
        />
      </FormControl>
      <Button onClick={onSave} variant="tactical" w="full" h="56px">
        REGISTRAR NO MAPA TÁTICO
      </Button>
    </VStack>
  );
}
