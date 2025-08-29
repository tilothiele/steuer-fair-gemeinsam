'use client';

import React from 'react';
import { TaxPartner } from '@steuer-fair/shared';

interface CalculatedValuesFormProps {
  partner: TaxPartner;
  title: string;
}

export const CalculatedValuesForm: React.FC<CalculatedValuesFormProps> = ({
  partner,
  title
}) => {
  // Berechnete Werte
  const haetteZahlenMuessen = partner.fee + partner.fse; // FEE + FSE
  const hatGezahlt = partner.gl + partner.gve + partner.gs; // GL + GVE + GS

  return (
    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
      <h4 className="text-sm font-medium text-purple-800 mb-3">
        {title} - Berechnete Werte
      </h4>
      
      <div className="space-y-3">
        {/* Hätte zahlen müssen */}
        <div>
          <label className="form-label text-purple-800">Hätte zahlen müssen (€)</label>
          <input
            type="number"
            value={haetteZahlenMuessen.toFixed(2)}
            readOnly
            className="input-field bg-white text-purple-800 font-medium"
          />
          <p className="text-xs text-purple-600 mt-1">
            FEE + FSE (Festgesetzte Einkommensteuer + Soli)
          </p>
        </div>

        {/* Hat gezahlt */}
        <div>
          <label className="form-label text-purple-800">Hat gezahlt (€)</label>
          <input
            type="number"
            value={hatGezahlt.toFixed(2)}
            readOnly
            className="input-field bg-white text-purple-800 font-medium"
          />
          <p className="text-xs text-purple-600 mt-1">
            GL + GVE + GS (Lohnsteuer + Vorauszahlung + Soli)
          </p>
        </div>

        {/* Differenz */}
        <div>
          <label className="form-label text-purple-800">Differenz (€)</label>
          <input
            type="number"
            value={(haetteZahlenMuessen - hatGezahlt).toFixed(2)}
            readOnly
            className={`input-field bg-white font-medium ${
              haetteZahlenMuessen - hatGezahlt > 0 
                ? 'text-red-800' 
                : haetteZahlenMuessen - hatGezahlt < 0 
                ? 'text-green-800' 
                : 'text-purple-800'
            }`}
          />
          <p className="text-xs text-purple-600 mt-1">
            Hätte zahlen müssen - Hat gezahlt
          </p>
        </div>
      </div>
    </div>
  );
};
