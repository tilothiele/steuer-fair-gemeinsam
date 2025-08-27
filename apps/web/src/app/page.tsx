'use client';

import { useState, useEffect } from 'react';
import { User } from '@steuer-fair/shared';
import { TaxCalculator } from '../components/TaxCalculator/TaxCalculator';
import { LoginForm } from '../components/Auth/LoginForm';
import { UserHeader } from '../components/Auth/UserHeader';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prüfe ob ein Benutzer im localStorage gespeichert ist
    const savedUser = localStorage.getItem('steuer-fair-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Fehler beim Laden des gespeicherten Benutzers:', error);
        localStorage.removeItem('steuer-fair-user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Speichere Benutzer im localStorage
    localStorage.setItem('steuer-fair-user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    // Entferne Benutzer aus localStorage
    localStorage.removeItem('steuer-fair-user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <UserHeader user={user} onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hauptinhalt */}
          <div className="lg:col-span-2">
            <TaxCalculator />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Wie funktioniert es?
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  1. Geben Sie die Einkommensdaten beider Partner ein
                </p>
                <p>
                  2. Wählen Sie die Steuerklassen und Freibeträge
                </p>
                <p>
                  3. Die App berechnet automatisch die faire Aufteilung
                </p>
                <p>
                  4. Vergleichen Sie getrennte vs. gemeinsame Veranlagung
                </p>
              </div>
            </div>

            {/* Vorteile Card */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Vorteile der gemeinsamen Veranlagung
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Steuerersparnis durch Splitting-Tarif
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Höhere Freibeträge möglich
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Günstigere Steuerklassen
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Einfache Verwaltung
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="card bg-yellow-50 border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Wichtiger Hinweis
              </h3>
              <p className="text-sm text-yellow-700">
                Diese Berechnung dient nur zur Orientierung. Für die finale Steuererklärung 
                konsultieren Sie bitte einen Steuerberater oder das Finanzamt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
