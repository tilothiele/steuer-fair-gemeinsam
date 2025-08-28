'use client';

import React from 'react';
import { TaxPartner } from '@steuer-fair/shared';

interface TaxPartnerFormProps {
  partner: TaxPartner;
  onPartnerChange: (partner: TaxPartner) => void;
  title: string;
}

export const TaxPartnerForm: React.FC<TaxPartnerFormProps> = ({
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
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      
      {/* Name */}
      <div>
        <label className="form-label">Name (optional)</label>
        <input
          type="text"
          value={partner.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Name des Partners"
          className="input-field"
        />
      </div>

      {/* Steuer-ID */}
      <div>
        <label className="form-label">Steuer-ID (optional)</label>
        <input
          type="text"
          value={partner.steuerId || ''}
          onChange={(e) => handleChange('steuerId', e.target.value)}
          placeholder="Steuer-ID"
          className="input-field"
        />
      </div>

      {/* Steuerpflichtiges Einkommen */}
      <div>
        <label className="form-label">Steuerpflichtiges Einkommen (€)</label>
        <input
          type="number"
          value={partner.sek || ''}
          onChange={(e) => handleChange('sek', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="0.01"
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">
          Bruttoeinkommen vor Abzügen
        </p>
      </div>

      {/* Steuerklasse */}
      <div>
        <label className="form-label">Steuerklasse</label>
        <select
          value={partner.taxClass || 1}
          onChange={(e) => handleChange('taxClass', parseInt(e.target.value) || 1)}
          className="input-field"
        >
          <option value={1}>Steuerklasse 1</option>
          <option value={2}>Steuerklasse 2</option>
          <option value={3}>Steuerklasse 3</option>
          <option value={4}>Steuerklasse 4</option>
          <option value={5}>Steuerklasse 5</option>
          <option value={6}>Steuerklasse 6</option>
        </select>
      </div>

      {/* Werbungskosten */}
      <div>
        <label className="form-label">Werbungskosten (€)</label>
        <input
          type="number"
          value={partner.allowances || ''}
          onChange={(e) => handleChange('allowances', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="0.01"
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">
          Fahrtkosten, Arbeitsmittel, etc.
        </p>
      </div>

      {/* Sonderausgaben */}
      <div>
        <label className="form-label">Sonderausgaben (€)</label>
        <input
          type="number"
          value={partner.specialExpenses || ''}
          onChange={(e) => handleChange('specialExpenses', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="0.01"
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">
          Kirchensteuer, Versicherungen, etc.
        </p>
      </div>

      {/* Außergewöhnliche Belastungen */}
      <div>
        <label className="form-label">Außergewöhnliche Belastungen (€)</label>
        <input
          type="number"
          value={partner.extraordinaryExpenses || ''}
          onChange={(e) => handleChange('extraordinaryExpenses', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="0.01"
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">
          Krankheitskosten, etc.
        </p>
      </div>

      {/* Kinderfreibetrag */}
      <div>
        <label className="form-label">Kinderfreibetrag (€)</label>
        <input
          type="number"
          value={partner.childAllowance || ''}
          onChange={(e) => handleChange('childAllowance', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="0.01"
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">
          Pro Kind: 8.952€ (2024)
        </p>
      </div>

      {/* Berechnete Werte - Nur Anzeige */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="text-sm font-medium text-green-800 mb-3">Berechnete Werte (automatisch)</h4>
        
        <div className="space-y-3">
          {/* Festgesetzte Einkommensteuer */}
          <div>
            <label className="form-label text-green-800">Festgesetzte Einkommensteuer (€)</label>
            <input
              type="number"
              value={partner.fee || 0}
              readOnly
              className="input-field bg-white text-green-800 font-medium"
            />
            <p className="text-xs text-green-600 mt-1">
              Bei Einzelveranlagung (automatisch berechnet)
            </p>
          </div>

          {/* Festgesetzter Soli */}
          <div>
            <label className="form-label text-green-800">Festgesetzter Soli (€)</label>
            <input
              type="number"
              value={partner.fse || 0}
              readOnly
              className="input-field bg-white text-green-800 font-medium"
            />
            <p className="text-xs text-green-600 mt-1">
              Bei Einzelveranlagung (automatisch berechnet)
            </p>
          </div>
        </div>
      </div>

      {/* Bereits gezahlte Beträge - Gemeinsame farblich abgesetzte Fläche */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-3">Bereits gezahlte Beträge</h4>
        
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
    </div>
  );
};
