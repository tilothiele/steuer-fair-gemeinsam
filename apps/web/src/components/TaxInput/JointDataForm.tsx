'use client';

import React from 'react';
import { JointTaxData } from '@steuer-fair/shared';

interface JointDataFormProps {
  jointData: JointTaxData;
  onJointDataChange: (jointData: JointTaxData) => void;
}

export const JointDataForm: React.FC<JointDataFormProps> = ({
  jointData,
  onJointDataChange
}) => {
  const handleChange = (field: keyof JointTaxData, value: number) => {
    onJointDataChange({
      ...jointData,
      [field]: value
    });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Gemeinsame Veranlagung (aus Steuerbescheid)
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Gemeinsames steuerpflichtiges Einkommen */}
        <div>
          <label className="form-label">Gemeinsames steuerpflichtiges Einkommen (€)</label>
          <input
            type="number"
            value={jointData.gsek || ''}
            onChange={(e) => handleChange('gsek', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="0.01"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">
            Summe der steuerpflichtigen Einkommen beider Partner
          </p>
        </div>
      </div>

      {/* Berechnete gemeinsame Werte - Nur Anzeige */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
        <h4 className="text-sm font-medium text-green-800 mb-3">Berechnete gemeinsame Werte (automatisch)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gemeinsame festgesetzte Einkommensteuer */}
          <div>
            <label className="form-label text-green-800">Gemeinsame festgesetzte Einkommensteuer (€)</label>
            <input
              type="number"
              value={jointData.gfe || 0}
              readOnly
              className="input-field bg-white text-green-800 font-medium"
            />
            <p className="text-xs text-green-600 mt-1">
              Bei gemeinsamer Veranlagung (automatisch berechnet)
            </p>
          </div>

          {/* Gemeinsamer festgesetzter Soli */}
          <div>
            <label className="form-label text-green-800">Gemeinsamer festgesetzter Soli (€)</label>
            <input
              type="number"
              value={jointData.gfs || 0}
              readOnly
              className="input-field bg-white text-green-800 font-medium"
            />
            <p className="text-xs text-green-600 mt-1">
              Bei gemeinsamer Veranlagung (automatisch berechnet)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
