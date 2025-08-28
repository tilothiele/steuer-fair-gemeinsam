import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://auth.swingdog.home64.de',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'TTSOFT',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'steuer-fair-web'
};

// Singleton Pattern für Keycloak-Instanz
let keycloakInstance: Keycloak | null = null;

export const getKeycloak = (): Keycloak | null => {
  // Nur im Browser ausführen
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
};

export const keycloak = getKeycloak();

let initPromise: Promise<boolean> | null = null;

export const initKeycloak = () => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise<boolean>((resolve, reject) => {
    const keycloakInstance = getKeycloak();
    
    if (!keycloakInstance) {
      reject(new Error('Keycloak ist nur im Browser verfügbar'));
      return;
    }
    
    // Einfachere Konfiguration für die Entwicklung
    keycloakInstance
      .init({
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        enableLogging: true
      })
      .then((authenticated) => {
        console.log('Keycloak initialisiert:', authenticated);
        resolve(authenticated);
      })
      .catch((error) => {
        console.error('Keycloak Initialisierungsfehler:', error);
        initPromise = null; // Reset promise on error
        reject(error);
      });
  });

  return initPromise;
};

export const login = () => {
  const keycloakInstance = getKeycloak();
  if (keycloakInstance) {
    keycloakInstance.login({
      redirectUri: window.location.origin
    });
  }
};

export const logout = () => {
  const keycloakInstance = getKeycloak();
  if (keycloakInstance) {
    keycloakInstance.logout({
      redirectUri: window.location.origin
    });
  }
};

export const getToken = () => {
  const keycloakInstance = getKeycloak();
  return keycloakInstance?.token || null;
};

export const getUsername = () => {
  const keycloakInstance = getKeycloak();
  return keycloakInstance?.tokenParsed?.preferred_username || keycloakInstance?.tokenParsed?.sub || 'Unbekannter Benutzer';
};

export const getLoginId = () => {
  const keycloakInstance = getKeycloak();
  return keycloakInstance?.tokenParsed?.preferred_username || keycloakInstance?.tokenParsed?.sub || '';
};

export const getUserEmail = () => {
  const keycloakInstance = getKeycloak();
  return keycloakInstance?.tokenParsed?.email || '';
};

export const isAuthenticated = () => {
  const keycloakInstance = getKeycloak();
  return !!keycloakInstance?.authenticated;
};

export const updateToken = (minValidity: number = 30) => {
  return new Promise<boolean>((resolve, reject) => {
    const keycloakInstance = getKeycloak();
    if (!keycloakInstance) {
      reject(new Error('Keycloak ist nicht verfügbar'));
      return;
    }
    
    keycloakInstance
      .updateToken(minValidity)
      .then((refreshed) => {
        if (refreshed) {
          console.log('Token wurde erneuert');
        }
        resolve(refreshed);
      })
      .catch((error) => {
        console.error('Token-Erneuerung fehlgeschlagen:', error);
        reject(error);
      });
  });
};
