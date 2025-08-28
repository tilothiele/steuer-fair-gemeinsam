'use client';

import React, { useEffect, useState } from 'react';
import { initKeycloak, login, isAuthenticated, getUsername, getUserEmail, getLoginId } from '../../config/keycloak';

interface KeycloakLoginProps {
  onLogin: (user: { id: string; loginId: string; name: string; email: string }) => void;
}

export const KeycloakLogin: React.FC<KeycloakLoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Prüfe ob wir im Browser sind
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        
        const authenticated = await initKeycloak();
        
        if (authenticated) {
          const user = {
            id: 'keycloak-user',
            loginId: getLoginId(),
            name: getUsername(),
            email: getUserEmail()
          };
          onLogin(user);
        }
      } catch (err) {
        console.error('Authentifizierungsfehler:', err);
        setError('Fehler bei der Authentifizierung. Bitte versuchen Sie es erneut.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [onLogin]);

  const handleLogin = () => {
    login();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Initialisiere Authentifizierung...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Steuer-Fair Gemeinsam
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Faire Aufteilung der Steuererstattung
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>

          <div>
            <button
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Steuer-Fair Gemeinsam
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faire Aufteilung der Steuererstattung
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              Anmelden
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Sie werden zur sicheren Anmeldeseite weitergeleitet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
