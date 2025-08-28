'use client';

import React from 'react';
import { TaxPartner } from '@steuer-fair/shared';

interface PaidAmountsFormProps {
  partner: TaxPartner;
  onPartnerChange: (partner: TaxPartner) => void;
  title: string;
}

export const PaidAmountsForm: React.FC<PaidAmountsFormProps> = ({
  partner,
  onPartnerChange,
  title
}) => {
  const handleChange = (field: keyof TaxPartner, value: string | number) => {
    onPartnerChange({
      ...partner,
      [field]: value
    });
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="text-sm font-medium text-blue-800 mb-3">
        {title} - Bereits gezahlte Beträge
      </h4>
      
      <div className="space-y-3">
        {/* Bereits gezahlte Lohnsteuer */}
        <div>
          <label className="form-label text-blue-800">Bereits gezahlte Lohnsteuer (€)</label>
          <input
            type="number"
            value={partner.gl || ''}
            onChange={(e) => handleChange('gl', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="0.01"
            className="input-field bg-white"
          />
        </div>

        {/* Bereits gezahlte Vorauszahlung */}
        <div>
          <label className="form-label text-blue-800">Bereits gezahlte Vorauszahlung (€)</label>
          <input
            type="number"
            value={partner.gve || ''}
            onChange={(e) => handleChange('gve', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="0.01"
            className="input-field bg-white"
          />
        </div>

        {/* Bereits gezahlter Soli */}
        <div>
          <label className="form-label text-blue-800">Bereits gezahlter Soli (€)</label>
          <input
            type="number"
            value={partner.gs || ''}
            onChange={(e) => handleChange('gs', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="0.01"
            className="input-field bg-white"
          />
        </div>
      </div>
    </div>
  );
};
