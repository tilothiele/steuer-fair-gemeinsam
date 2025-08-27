'use client';

import { useState, useEffect } from 'react';
import { User } from '@steuer-fair/shared';
import ProfileForm from '../../components/Profile/ProfileForm';
import { UserHeader } from '../../components/Auth/UserHeader';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('steuer-fair-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('steuer-fair-user');
    window.location.href = '/';
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('steuer-fair-user', JSON.stringify(updatedUser));
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
    window.location.href = '/';
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <UserHeader user={user} onLogout={handleLogout} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mein Profil
          </h1>
          <p className="text-gray-600">
            Verwalten Sie Ihre persönlichen Daten und Steuerinformationen
          </p>
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
