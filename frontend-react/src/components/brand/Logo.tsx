import { Icon, type IconProps } from '@chakra-ui/react';

export const Logo = (props: IconProps) => (
  <Icon viewBox="0 0 100 100" fill="none" {...props}>
    {/* Map Pin base */}
    <path
      d="M50 90C50 90 20 62 20 40C20 23.4315 33.4315 10 50 10C66.5685 10 80 23.4315 80 40C80 62 50 90 50 90Z"
      fill="currentColor"
    />
    
    {/* Center dot/eye */}
    <circle cx="50" cy="40" r="10" fill="sos.dark" />
    
    {/* Radar Waves / Pulse */}
    <path
      d="M50 40C50 40 60 40 70 40M50 40C50 40 40 40 30 40"
      stroke="accent.emergency"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.8"
    />
    
    <circle
      cx="50"
      cy="40"
      r="25"
      stroke="accent.emergency"
      strokeWidth="2"
      strokeDasharray="4 8"
      opacity="0.5"
    />
    
    <circle
      cx="50"
      cy="40"
      r="35"
      stroke="accent.emergency"
      strokeWidth="1"
      strokeDasharray="2 6"
      opacity="0.3"
    />
  </Icon>
);

export const LogoFull = ({ showText = true, ...props }: { showText?: boolean } & IconProps) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <Logo w="32px" h="32px" {...props} />
    {showText && (
      <span style={{ 
        fontWeight: 800, 
        fontSize: '1.2rem', 
        letterSpacing: '1px', 
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        SOS <span style={{ color: '#FF3B30' }}>LOCATION</span>
      </span>
    )}
  </div>
);
