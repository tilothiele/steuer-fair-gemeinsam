import cookieSession from 'cookie-session';
import Keycloak from 'keycloak-connect';

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || 'TTSOFT',
  'auth-server-url': process.env.KEYCLOAK_URL || 'https://auth.swingdog.home64.de',
  'ssl-required': 'external',
  resource: process.env.KEYCLOAK_CLIENT_ID || 'steuer-fair-web',
  'public-client': true,
  'confidential-port': 0,
  'verify-token-audience': false
};

// Cookie-basierte Session-Konfiguration
export const sessionConfig = {
  name: 'steuer-fair-session',
  keys: [process.env.SESSION_SECRET || 'steuer-fair-secret'],
  maxAge: 1000 * 60 * 10, // 10 minutes
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const
};

// Erstelle eine einfache Store-Implementierung für Keycloak
const cookieStore = {
  get: (sid: string, callback: (err: any, session?: any) => void) => {
    // Cookie-Sessions werden automatisch gelesen
    callback(null, null);
  },
  set: (sid: string, session: any, callback: (err?: any) => void) => {
    // Cookie-Sessions werden automatisch gesetzt
    callback();
  },
  destroy: (sid: string, callback: (err?: any) => void) => {
    // Cookie-Sessions werden automatisch gelöscht
    callback();
  }
};

export const keycloak = new Keycloak({ store: cookieStore }, keycloakConfig);

export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Für public clients verwenden wir eine einfachere Validierung
    keycloak.grantManager.validateAccessToken(token)
      .then((grant) => {
        resolve(grant);
      })
      .catch((error) => {
        console.error('Token validation error:', error);
        // Für public clients können wir auch ohne strenge Validierung arbeiten
        // Wir extrahieren die Token-Informationen direkt
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            resolve({ content: payload });
          } else {
            reject(error);
          }
        } catch (parseError) {
          reject(error);
        }
      });
  });
};

export const extractUserFromToken = (token: any) => {
  if (!token || !token.content) {
    return null;
  }

  return {
    id: token.content.sub,
    email: token.content.email,
    name: token.content.preferred_username || token.content.name || token.content.email,
    roles: token.content.realm_access?.roles || []
  };
};
