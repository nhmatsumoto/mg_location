import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    sos: {
      blue: {
        50: '#e1f0ff',
        100: '#b3d4ff',
        200: '#82b7ff',
        300: '#4f9bff',
        400: '#217eff',
        500: '#003366', // Brand Primary - Deep Blue
        600: '#002952',
        700: '#001e3d',
        800: '#001429',
        900: '#000a14',
      },
      red: {
        50: '#ffebee',
        100: '#ffcdd2',
        200: '#ef9a9a',
        300: '#e57373',
        400: '#ef5350',
        500: '#FF3B30', // Emergency Accent
        600: '#e53935',
        700: '#d32f2f',
        800: '#c62828',
        900: '#b71c1c',
      },
      green: {
        50: '#e8f5e9',
        500: '#28A745', // Success/Safe
        900: '#1b5e20',
      },
      dark: '#020617',
      slate: '#0f172a',
    }
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    mono: `'JetBrains Mono', 'Roboto Mono', monospace`,
  },
  semanticTokens: {
    colors: {
      'bg.canvas': { default: 'sos.dark' },
      'bg.surface': { default: 'whiteAlpha.50', _dark: 'whiteAlpha.50' },
      'border.subtle': { default: 'whiteAlpha.100', _dark: 'whiteAlpha.100' },
      'brand.primary': { default: 'sos.blue.500' },
      'accent.emergency': { default: 'sos.red.500' },
    }
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md',
        fontWeight: 'semibold',
        textTransform: 'none',
      },
      variants: {
        tactical: {
          bg: 'sos.blue.500',
          color: 'white',
          _hover: {
            bg: 'sos.blue.600',
            _disabled: {
              bg: 'sos.blue.500',
            }
          },
        },
        ghost: {
          _hover: {
            bg: 'whiteAlpha.100',
          }
        }
      },
    },
    Card: {
      baseStyle: {
        container: {
          backgroundColor: 'whiteAlpha.50',
          backdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: 'whiteAlpha.100',
          borderRadius: 'xl',
        }
      }
    },
    Stat: {
      baseStyle: {
        label: {
          color: 'whiteAlpha.600',
          fontSize: 'xs',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 'wider',
        },
        number: {
          fontFamily: 'mono',
          fontSize: '2xl',
          color: 'white',
        },
        helpText: {
          fontSize: 'xs',
          color: 'whiteAlpha.500',
        }
      }
    },
    // Custom Recipe for Tactical Glass Panels
    TacticalPanel: {
      baseStyle: {
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: 'whiteAlpha.100',
        borderRadius: '3xl',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }
    }
  },
  styles: {
    global: {
      body: {
        bg: 'sos.dark',
        color: 'white',
      }
    }
  }
});

export default theme;
