'use client';

import { useState, useEffect } from 'react';
import ProfileForm from '../../components/Profile/ProfileForm';
import { KeycloakUserHeader } from '../../components/Auth/KeycloakUserHeader';
import { initKeycloak, isAuthenticated, getUsername, getUserEmail, getLoginId } from '../../config/keycloak';
import { User } from '@steuer-fair/shared';
import { ProfileApiService } from '../../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initKeycloak();
        
        if (isAuthenticated()) {
          const loginId = getLoginId();
          
          // Versuche Profil aus der Datenbank zu laden
          let userData: User;
          
          try {
            const dbUser = await ProfileApiService.getProfile(loginId);
            
            if (dbUser) {
              // Verwende Daten aus der Datenbank
              userData = {
                ...dbUser,
                // Fallback auf Keycloak-Daten falls DB-Daten unvollständig
                name: dbUser.name || getUsername(),
                loginId: dbUser.loginId || loginId
              };
            } else {
              // Erstelle neuen User mit Keycloak-Daten
              userData = {
                id: 'keycloak-user',
                loginId: loginId,
                name: getUsername(),
                steuernummer: undefined,
                createdAt: new Date(),
                lastLogin: new Date()
              };
            }
          } catch (dbError) {
            console.warn('Fehler beim Laden des Profils aus der Datenbank:', dbError);
            // Fallback auf Keycloak-Daten
            userData = {
              id: 'keycloak-user',
              loginId: loginId,
              name: getUsername(),
              steuernummer: undefined,
              createdAt: new Date(),
              lastLogin: new Date()
            };
          }
          
          setUser(userData);
        } else {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Fehler bei der Authentifizierung:', error);
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    window.location.href = '/';
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <KeycloakUserHeader onLogout={handleLogout} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mein Profil
              </h1>
              <p className="text-gray-600">
                Verwalten Sie Ihre persönlichen Daten und Steuerinformationen
              </p>
            </div>
            <div className="flex space-x-3">
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Zurück zur Hauptseite
              </a>
              <a 
                href="https://auth.swingdog.home64.de/realms/TTSOFT/account/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Keycloak Profil
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hauptinhalt - Profilformular */}
          <div className="lg:col-span-2">
            <ProfileForm user={user} onProfileUpdate={handleProfileUpdate} />
          </div>

          {/* Sidebar - Steuernummer Anzeige */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Steuerinformationen
              </h3>
              
              {user.steuernummer ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Steuernummer
                    </label>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="font-mono text-blue-900">{user.steuernummer}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Diese Steuernummer wird bei allen Berechnungen verwendet und über dem Veranlagungsjahr angezeigt.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Keine Steuernummer hinterlegt
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Tragen Sie Ihre Steuernummer im Profil ein
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
