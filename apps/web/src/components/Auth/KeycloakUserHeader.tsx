'use client';

import React from 'react';
import { logout, getUsername, getUserEmail } from '../../config/keycloak';

interface KeycloakUserHeaderProps {
  onLogout: () => void;
}

export const KeycloakUserHeader: React.FC<KeycloakUserHeaderProps> = ({ onLogout }) => {
  const username = getUsername();
  const email = getUserEmail();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Steuer-Fair Gemeinsam
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{username}</p>
              {email && (
                <p className="text-xs text-gray-500">{email}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <a
                href="/profile"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Profil
              </a>
              
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
