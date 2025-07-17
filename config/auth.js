// config/auth.js
module.exports = {
    local: {
      jwtSecret: process.env.JWT_SECRET || 'ef125d2b-8e2b-4b4b-8e2b-4b4b8e2b4b4b',
      tokenExpiration: process.env.TOKEN_EXPIRE || '1h',
    },
    keycloak: {
      realm: process.env.KEYCLOAK_REALM || 'notation',
      authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'natation_backend',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '4d0d8d9d-6d0d-4d0d-6d0d-4d0d6d0d4d0d',
      publicKey: process.env.KEYCLOAK_PUBLIC_KEY, 
    },
  };