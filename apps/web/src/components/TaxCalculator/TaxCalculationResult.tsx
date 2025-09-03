'use client';

import React from 'react';
import { TaxCalculationResult as TaxCalculationResultType, TaxPartner, JointTaxData } from '@steuer-fair/shared';
import { formatCurrency } from '../../utils/formatters';
import { Download, BarChart3 } from 'lucide-react';

interface TaxCalculationResultProps {
  result: TaxCalculationResultType;
  partnerA: TaxPartner;
  partnerB: TaxPartner;
  jointData: JointTaxData;
}

// Neue wiederverwendbare PartnerCard-Komponente
interface PartnerCardProps {
  partner: TaxPartner;
  partnerResult: {
    haetteZahlenMuessen: number;
    mussNunZahlen: number;
    hatGezahlt: number;
    differenz: number;
  };
  partnerName: string;
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, partnerResult, partnerName }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h4 className="font-medium text-gray-900 mb-2">
      {partner.name || partnerName}
    </h4>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Hätte zahlen müssen:</span>
        <span className="font-medium">{formatCurrency(partnerResult.haetteZahlenMuessen)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Muss nun zahlen:</span>
        <span className="font-medium">{formatCurrency(partnerResult.mussNunZahlen)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Hat gezahlt:</span>
        <span className="font-medium">{formatCurrency(partnerResult.hatGezahlt)}</span>
      </div>
      <div className="flex justify-between border-t border-gray-200 pt-2">
        <span className="text-gray-900 font-medium">Differenz:</span>
        <span className={`font-bold ${partnerResult.differenz >= 0 ? 'text-success-600' : 'text-red-600'}`}>
          {formatCurrency(partnerResult.differenz)}
        </span>
      </div>
    </div>
  </div>
);

export const TaxCalculationResult: React.FC<TaxCalculationResultProps> = ({
  result,
  partnerA,
  partnerB,
  jointData
}) => {
  const handleExport = () => {
    const data = {
      partnerA: { name: partnerA.name || 'Partner A', ...partnerA },
      partnerB: { name: partnerB.name || 'Partner B', ...partnerB },
      jointData,
      calculation: result,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `steuer-berechnung-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Übersicht */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Berechnungsergebnis
          </h2>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Plausibilitätsprüfung */}
        {!result.plausibilityCheck ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-red-700 mb-1">Plausibilitätsprüfung fehlgeschlagen</p>
              <p className="text-lg font-bold text-red-900">
                {result.plausibilityError}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-success-700 mb-1">Plausibilitätsprüfung erfolgreich</p>
              <p className="text-2xl font-bold text-success-900">
                Gemeinsame zu zahlende Steuer: {formatCurrency(result.gzz)}
              </p>
            </div>
          </div>
        )}

        {/* Berechnete Faktoren */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Faktor Partner A</p>
            <p className="text-lg font-medium">{(result.factorA * 100).toFixed(2)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Faktor Partner B</p>
            <p className="text-lg font-medium">{(result.factorB * 100).toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* Faire Aufteilung */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Faire Aufteilung der Steuerlast
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner A */}
          <PartnerCard
            partner={partnerA}
            partnerResult={result.partnerA}
            partnerName="Partner A"
          />

          {/* Partner B */}
          <PartnerCard
            partner={partnerB}
            partnerResult={result.partnerB}
            partnerName="Partner B"
          />
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Berechnungsdetails
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Steuerpflichtiges Einkommen A</p>
            <p className="text-lg font-medium">{formatCurrency(partnerA.sek)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Steuerpflichtiges Einkommen B</p>
            <p className="text-lg font-medium">{formatCurrency(partnerB.sek)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Gemeinsames steuerpflichtiges Einkommen</p>
            <p className="text-lg font-medium">{formatCurrency(jointData.gsek)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
