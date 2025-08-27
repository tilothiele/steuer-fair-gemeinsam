'use client';

import React from 'react';
import { User } from '@steuer-fair/shared';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import Link from 'next/link';

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
            <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              Steuer-Fair Gemeinsam
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <UserIcon className="w-4 h-4" />
              <span className="font-medium">{user.name || user.loginId}</span>
            </div>
            
            <Link
              href="/profile"
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Profil</span>
            </Link>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
