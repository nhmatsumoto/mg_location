import React from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';

interface ToolButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement;
  label: string;
  disabled?: boolean;
  className?: string;
  hideLabel?: boolean;
}

export function ToolButton({ active, onClick, icon, label, disabled, hideLabel = false }: ToolButtonProps) {
  return (
    <Tooltip label={label} isDisabled={!hideLabel}>
      <IconButton
        icon={icon}
        aria-label={label}
        onClick={onClick}
        isDisabled={disabled}
        variant={active ? 'tactical' : 'ghost'}
        bg={active ? 'sos.blue.500' : 'transparent'}
        color={active ? 'white' : 'whiteAlpha.600'}
        _hover={{
          bg: active ? 'sos.blue.600' : 'whiteAlpha.100',
          color: 'white'
        }}
        fontSize="18px"
        borderRadius="xl"
        w="40px"
        h="40px"
      />
    </Tooltip>
  );
}
