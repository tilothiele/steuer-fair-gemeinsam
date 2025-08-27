'use client';

import { TaxCalculator } from '../components/TaxCalculator/TaxCalculator';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hauptinhalt */}
        <div className="lg:col-span-2">
          <TaxCalculator />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Wie funktioniert es?
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                1. Geben Sie die Einkommensdaten beider Partner ein
              </p>
              <p>
                2. Wählen Sie die Steuerklassen und Freibeträge
              </p>
              <p>
                3. Die App berechnet automatisch die faire Aufteilung
              </p>
              <p>
                4. Vergleichen Sie getrennte vs. gemeinsame Veranlagung
              </p>
            </div>
          </div>

          {/* Vorteile Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Vorteile der gemeinsamen Veranlagung
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Steuerersparnis durch Splitting-Tarif
              </li>
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Höhere Freibeträge möglich
              </li>
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Günstigere Steuerklassen
              </li>
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Einfache Verwaltung
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="card bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Wichtiger Hinweis
            </h3>
            <p className="text-sm text-yellow-700">
              Diese Berechnung dient nur zur Orientierung. Für die finale Steuererklärung 
              konsultieren Sie bitte einen Steuerberater oder das Finanzamt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
