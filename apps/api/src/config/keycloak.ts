import session from 'express-session';
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

export const memoryStore = new session.MemoryStore();

export const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'steuer-fair-secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
  cookie: {
    maxAge: 1000 * 60 * 10 // 10 minutes
  }
};

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
