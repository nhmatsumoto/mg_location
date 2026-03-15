import type { ReactNode } from 'react';
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button
} from '@chakra-ui/react';

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  return (
    <ChakraModal isOpen={open} onClose={onClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.700" />
      <ModalContent bg="slate.950" border="1px solid" borderColor="whiteAlpha.200" borderRadius="2xl">
        <ModalHeader fontSize="md" fontWeight="bold" color="white" borderBottom="1px solid" borderColor="whiteAlpha.100">
          {title}
        </ModalHeader>
        <ModalCloseButton color="whiteAlpha.700" />
        <ModalBody p={0}>
          {children}
        </ModalBody>
        <ModalFooter bg="blackAlpha.400" borderBottomRadius="2xl">
          <Button size="sm" variant="ghost" colorScheme="whiteAlpha" onClick={onClose}>
            FECHAR
          </Button>
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  );
}
