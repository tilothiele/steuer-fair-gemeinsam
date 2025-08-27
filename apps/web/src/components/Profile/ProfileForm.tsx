'use client';

import { useState, useEffect } from 'react';
import { User } from '@steuer-fair/shared';

interface ProfileFormProps {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
}

export default function ProfileForm({ user, onProfileUpdate }: ProfileFormProps) {
  const [name, setName] = useState(user.name || '');
  const [steuernummer, setSteuernummer] = useState(user.steuernummer || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setName(user.name || '');
    setSteuernummer(user.steuernummer || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updatedUser = {
        ...user,
        name: name.trim() || undefined,
        steuernummer: steuernummer.trim() || undefined
      };

      // Hier würde normalerweise ein API-Call stehen
      // Für jetzt simulieren wir das Update
      onProfileUpdate(updatedUser);
      
      setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert!' });
      
      // Kurze Verzögerung, damit die Nachricht sichtbar ist
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Aktualisieren des Profils' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Profil bearbeiten
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Login-ID (unveränderbar) */}
        <div>
          <label className="form-label">
            Login-ID <span className="text-gray-500">(unveränderbar)</span>
          </label>
          <input
            type="text"
            value={user.loginId}
            disabled
            className="input-field bg-gray-100 cursor-not-allowed"
            placeholder="Login-ID"
          />
        </div>

        {/* Name */}
        <div>
          <label className="form-label">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Ihr vollständiger Name"
          />
        </div>

        {/* Steuernummer */}
        <div>
          <label className="form-label">
            Steuernummer
          </label>
          <input
            type="text"
            value={steuernummer}
            onChange={(e) => setSteuernummer(e.target.value)}
            className="input-field"
            placeholder="Ihre Steuernummer"
          />
        </div>

        {/* Nachricht */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Speichern...' : 'Profil speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
