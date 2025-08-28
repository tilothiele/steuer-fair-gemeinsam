'use client';

import React from 'react';

interface CalculationModeToggleProps {
  mode: 'manual' | 'calculated';
  onModeChange: (mode: 'manual' | 'calculated') => void;
}

export const CalculationModeToggle: React.FC<CalculationModeToggleProps> = ({
  mode,
  onModeChange
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">
          Berechnungsmodus:
        </span>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${mode === 'manual' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            Manuell eingeben
          </span>
          <button
            type="button"
            onClick={() => onModeChange(mode === 'manual' ? 'calculated' : 'manual')}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${mode === 'calculated' ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${mode === 'calculated' ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
          <span className={`text-sm ${mode === 'calculated' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            Automatisch berechnen
          </span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        {mode === 'manual' ? (
          <span>Steuer und Soli werden manuell eingegeben</span>
        ) : (
          <span>Steuer und Soli werden automatisch berechnet</span>
        )}
      </div>
    </div>
  );
};
