'use client';

import React from 'react';
import { User } from '@steuer-fair/shared';
import { LogOut, User as UserIcon } from 'lucide-react';

interface UserHeaderProps {
  user: User;
  onLogout: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ user, onLogout }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Steuer-Fair Gemeinsam
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <UserIcon className="w-4 h-4" />
              <span className="font-medium">{user.name || user.loginId}</span>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
