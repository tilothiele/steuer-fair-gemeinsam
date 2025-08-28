'use client';

import React, { useState, useEffect } from 'react';
import { TaxPartner, TaxCalculationResult, JointTaxData, User } from '@steuer-fair/shared';
import { TaxCalculator as TaxCalc } from '@steuer-fair/shared';
import { TaxPartnerForm } from '../TaxInput/TaxPartnerForm';
import { JointDataForm } from '../TaxInput/JointDataForm';
import { CalculationModeToggle } from '../TaxInput/CalculationModeToggle';
import { PaidAmountsForm } from '../TaxInput/PaidAmountsForm';
import { CalculatedValuesForm } from '../TaxInput/CalculatedValuesForm';
import { TaxCalculationResult as TaxResultComponent } from './TaxCalculationResult';
import { TaxApiService } from '../../services/api';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';
import { Calculator, Save, FileDown } from 'lucide-react';

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
    fee: 0,
    fse: 0,
    gl: 0,
    gve: 0,
    gs: 0
  });

  const [jointData, setJointData] = useState<JointTaxData>({
    gsek: 0,
    gfe: 0,
    gfs: 0,
    calculationMode: 'manual'
  });

  const [calculationMode, setCalculationMode] = useState<'manual' | 'calculated'>('manual');

  const [year, setYear] = useState<number>(2024);

  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatische Berechnung der Steuern bei Änderung der Eingabewerte (nur im calculated Mode)
  useEffect(() => {
    if (calculationMode === 'calculated') {
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
    }
  }, [calculationMode, partnerA.sek, partnerB.sek, jointData.gsek]);

  const handleCalculate = async () => {
    if (!user) {
      setError('Benutzer nicht angemeldet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const calculationResult = await TaxApiService.calculateTax(partnerA, partnerB, jointData, year, user.id);
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError('Benutzer nicht angemeldet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
              await TaxApiService.saveTaxData(partnerA, partnerB, jointData, year, user.loginId);
      setError(null);
      // Optional: Erfolgsmeldung anzeigen
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  // Lade Daten beim Jahrwechsel
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          const savedData = await TaxApiService.loadTaxData(user.loginId, year);
          if (savedData) {
            setPartnerA(savedData.partnerA);
            setPartnerB(savedData.partnerB);
            setJointData(savedData.jointData);
          } else {
            // Keine Daten für dieses Jahr - Formular zurücksetzen
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
          }
        } catch (err) {
          console.error('Fehler beim Laden der Daten:', err);
        }
      };

      loadData();
    }
  }, [year, user]);

  const handleReset = () => {
    setPartnerA({
      id: 'A',
      name: '',
      steuerId: '',
      sek: 0,
      taxClass: 1,
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
      fee: 0,
      fse: 0,
      gl: 0,
      gve: 0,
      gs: 0
    });
    setJointData({
      gsek: 0,
      gfe: 0,
      gfs: 0,
      calculationMode: 'manual'
    });
    setCalculationMode('manual');
    setYear(2024);
    setResult(null);
    setError(null);
  };

  const handlePdfDownload = async () => {
    if (!user) {
      setError('Benutzer nicht angemeldet');
      return;
    }

    if (!partnerA.sek && !partnerB.sek) {
      setError('Bitte geben Sie mindestens ein steuerpflichtiges Einkommen ein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await TaxApiService.downloadPdf(
        partnerA,
        partnerB,
        jointData,
        year,
        user.loginId
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'PDF-Download fehlgeschlagen');
    } finally {
      setLoading(false);
    }
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

          {/* Berechnungsmodus Toggle */}
          <div className="mb-6">
            <CalculationModeToggle
              mode={calculationMode}
              onModeChange={setCalculationMode}
            />
          </div>

          {/* Infobox für automatische Berechnung */}
          {calculationMode === 'calculated' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Hinweis zur automatischen Berechnung
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Bei der automatischen Berechnung wird nur eine sehr grobe Steuerformel verwendet, 
                      die nicht der offiziellen Ermittlungsmethode entspricht. Es handelt sich nur um Näherungswerte.
                    </p>
                    <p className="mt-2 font-medium">
                      Empfehlung: Werte manuell aus der Steuererklärung übernehmen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        
        {/* Partner-Formulare - Grüne Blöcke (Festgesetzte Werte) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TaxPartnerForm
            partner={partnerA}
            onPartnerChange={setPartnerA}
            title="Partner A"
            calculationMode={calculationMode}
          />
          <TaxPartnerForm
            partner={partnerB}
            onPartnerChange={setPartnerB}
            title="Partner B"
            calculationMode={calculationMode}
          />
        </div>

        {/* Gemeinsame Daten */}
        <div className="mb-6">
          <JointDataForm
            jointData={jointData}
            onJointDataChange={setJointData}
            calculationMode={calculationMode}
          />
        </div>

        {/* Bereits gezahlte Beträge - Blaue Blöcke */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <PaidAmountsForm
            partner={partnerA}
            onPartnerChange={setPartnerA}
            title="Partner A"
          />
          <PaidAmountsForm
            partner={partnerB}
            onPartnerChange={setPartnerB}
            title="Partner B"
          />
        </div>

        {/* Berechnete Werte - Lila Blöcke */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CalculatedValuesForm
            partner={partnerA}
            title="Partner A"
          />
          <CalculatedValuesForm
            partner={partnerB}
            title="Partner B"
          />
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Speichere...
              </>
            ) : (
              'Speichern'
            )}
          </button>
          
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
          
          <button
            onClick={handlePdfDownload}
            disabled={loading || (!partnerA.sek && !partnerB.sek)}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Generiere PDF...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                PDF Download
              </>
            )}
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
