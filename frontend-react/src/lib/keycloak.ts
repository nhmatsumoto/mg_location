import Keycloak from 'keycloak-js';
import { frontendLogger } from './logger';

const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'sos-location',
  clientId: 'sos-location-frontend'
};

export const keycloak = new Keycloak(keycloakConfig);

export const initKeycloak = async (onAuthenticatedCallback: () => void) => {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256',
    });

    if (authenticated) {
      frontendLogger.info('Keycloak authenticated successfully');
      
      // Store token for legacy/existing apiClient uses
      if (keycloak.token) {
        localStorage.setItem('sos_location_token', keycloak.token);
      }
      
      // Token refresh logic
      keycloak.onTokenExpired = () => {
        keycloak.updateToken(30).then((refreshed) => {
          if (refreshed) {
            frontendLogger.info('Token refreshed successfully');
            localStorage.setItem('sos_location_token', keycloak.token!);
          }
        }).catch(() => {
          frontendLogger.error('Failed to refresh token');
          keycloak.login();
        });
      };

      onAuthenticatedCallback();
    } else {
      frontendLogger.warn('Keycloak authentication failed - redirecting to login');
      keycloak.login();
    }
  } catch (error) {
    frontendLogger.error('Failed to initialize Keycloak', { error });
  }
};

export const doLogout = () => {
  localStorage.removeItem('sos_location_token');
  keycloak.logout();
};
