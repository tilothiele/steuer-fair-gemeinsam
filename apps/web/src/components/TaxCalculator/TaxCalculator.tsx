'use client';

import React, { useState, useEffect } from 'react';
import { TaxPartner, TaxCalculationResult, JointTaxData, User } from '@steuer-fair/shared';
import { TaxCalculator as TaxCalc } from '@steuer-fair/shared';
import { TaxPartnerForm } from '../TaxInput/TaxPartnerForm';
import { JointDataForm } from '../TaxInput/JointDataForm';
import { TaxCalculationResult as TaxResultComponent } from './TaxCalculationResult';
import { TaxApiService } from '../../services/api';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';

interface TaxCalculatorProps {
  user?: User;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ user }) => {
  const [partnerA, setPartnerA] = useState<TaxPartner>({
    id: 'A',
    name: '',
    steuerId: '',
    sek: 0,
    taxClass: 1,
    allowances: 0,
    specialExpenses: 0,
    extraordinaryExpenses: 0,
    childAllowance: 0,
    fee: 0,
    fse: 0,
    gl: 0,
    gve: 0,
    gs: 0
  });

  const [partnerB, setPartnerB] = useState<TaxPartner>({
    id: 'B',
    name: '',
    steuerId: '',
    sek: 0,
    taxClass: 1,
    allowances: 0,
    specialExpenses: 0,
    extraordinaryExpenses: 0,
    childAllowance: 0,
    fee: 0,
    fse: 0,
    gl: 0,
    gve: 0,
    gs: 0
  });

  const [jointData, setJointData] = useState<JointTaxData>({
    gsek: 0,
    gfe: 0,
    gfs: 0
  });

  const [year, setYear] = useState<number>(2024);

  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatische Berechnung der Steuern bei Änderung der Eingabewerte
  useEffect(() => {
    // Berechne Steuern für Partner A
    const partnerATaxes = TaxCalc.calculateIndividualTax(partnerA);
    setPartnerA(prev => ({
      ...prev,
      fee: partnerATaxes.fee,
      fse: partnerATaxes.fse
    }));

    // Berechne Steuern für Partner B
    const partnerBTaxes = TaxCalc.calculateIndividualTax(partnerB);
    setPartnerB(prev => ({
      ...prev,
      fee: partnerBTaxes.fee,
      fse: partnerBTaxes.fse
    }));

    // Berechne gemeinsame Steuern
    const jointTaxes = TaxCalc.calculateJointTax(jointData);
    setJointData(prev => ({
      ...prev,
      gfe: jointTaxes.gfe,
      gfs: jointTaxes.gfs
    }));
  }, [partnerA.sek, partnerA.allowances, partnerA.specialExpenses, partnerA.extraordinaryExpenses, partnerA.childAllowance,
      partnerB.sek, partnerB.allowances, partnerB.specialExpenses, partnerB.extraordinaryExpenses, partnerB.childAllowance,
      jointData.gsek]);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);

    try {
      const calculationResult = await TaxApiService.calculateTax(partnerA, partnerB, jointData, year);
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPartnerA({
      id: 'A',
      name: '',
      steuerId: '',
      sek: 0,
      taxClass: 1,
      allowances: 0,
      specialExpenses: 0,
      extraordinaryExpenses: 0,
      childAllowance: 0,
      fee: 0,
      fse: 0,
      gl: 0,
      gve: 0,
      gs: 0
    });
    setPartnerB({
      id: 'B',
      name: '',
      steuerId: '',
      sek: 0,
      taxClass: 1,
      allowances: 0,
      specialExpenses: 0,
      extraordinaryExpenses: 0,
      childAllowance: 0,
      fee: 0,
      fse: 0,
      gl: 0,
      gve: 0,
      gs: 0
    });
    setJointData({
      gsek: 0,
      gfe: 0,
      gfs: 0
    });
    setYear(2024);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Eingabeformular */}
      <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Steuerdaten eingeben
          </h2>
          
          {/* Steuernummer Anzeige */}
          {user?.steuernummer && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Steuernummer:</span>
                <span className="font-mono text-gray-900">{user.steuernummer}</span>
              </div>
            </div>
          )}
          
          {/* Veranlagungsjahr über beide Spalten */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="form-label text-lg font-medium text-blue-800">Veranlagungsjahr</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input-field w-full bg-white"
            >
              {[2024, 2023, 2022, 2021, 2020].map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>
        
        {/* Partner-Formulare in 2-spaltigem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TaxPartnerForm
            partner={partnerA}
            onPartnerChange={setPartnerA}
            title="Partner A"
          />
          <TaxPartnerForm
            partner={partnerB}
            onPartnerChange={setPartnerB}
            title="Partner B"
          />
        </div>

        {/* Gemeinsame Daten */}
        <div className="mt-6">
          <JointDataForm
            jointData={jointData}
            onJointDataChange={setJointData}
          />
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Berechne...
              </>
            ) : (
              'Berechnung starten'
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="btn-secondary"
          >
            Zurücksetzen
          </button>
        </div>

        {error && (
          <ErrorMessage message={error} />
        )}
      </div>

      {/* Ergebnis */}
      {result && (
        <TaxResultComponent result={result} partnerA={partnerA} partnerB={partnerB} jointData={jointData} />
      )}
    </div>
  );
};
