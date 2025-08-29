import { TaxPartner, TaxCalculationResult, JointTaxData } from '../types/tax-models';

export class TaxCalculator {
  /**
   * Berechnet die Einkommensteuer für einen Partner
   */
  static calculateIndividualTax(partner: TaxPartner): { fee: number; fse: number } {
    // Vereinfachte Steuerberechnung (in der Praxis würde hier die offizielle Formel stehen)
    const taxableIncome = partner.sek;

    if (taxableIncome <= 0) {
      return { fee: 0, fse: 0 };
    }

    // Grundfreibetrag 2024: 11.604€
    const basicAllowance = 11604;
    const taxableAmount = Math.max(0, taxableIncome - basicAllowance);

    // Vereinfachte Steuerberechnung (linearer Ansatz für Demo)
    // In der Praxis würde hier die offizielle Steuertabelle verwendet
    let taxRate = 0.14; // 14% Grundsatz
    if (taxableAmount > 10908) taxRate = 0.24; // 24% für höhere Einkommen
    if (taxableAmount > 62809) taxRate = 0.42; // 42% für sehr hohe Einkommen

    const fee = Math.round(taxableAmount * taxRate);
    const fse = Math.round(fee * 0.055); // 5,5% Soli

    return { fee, fse };
  }



  /**
   * Berechnet die gemeinsame Einkommensteuer
   */
  static calculateJointTax(jointData: JointTaxData): { gfe: number; gfs: number } {
    // Vereinfachte gemeinsame Steuerberechnung
    const taxableIncome = jointData.gsek;

    if (taxableIncome <= 0) {
      return { gfe: 0, gfs: 0 };
    }

    // Grundfreibetrag für Ehepaare 2024: 23.208€
    const basicAllowance = 23208;
    const taxableAmount = Math.max(0, taxableIncome - basicAllowance);

    // Vereinfachte Steuerberechnung für Ehepaare
    let taxRate = 0.14; // 14% Grundsatz
    if (taxableAmount > 21816) taxRate = 0.24; // 24% für höhere Einkommen
    if (taxableAmount > 125618) taxRate = 0.42; // 42% für sehr hohe Einkommen

    const gfe = Math.round(taxableAmount * taxRate);
    const gfs = Math.round(gfe * 0.055); // 5,5% Soli

    return { gfe, gfs };
  }


  /**
   * Berechnet die faire Aufteilung basierend auf festgesetzten Werten aus dem Steuerbescheid
   */
  static calculateFairSplit(
    partnerA: TaxPartner,
    partnerB: TaxPartner,
    jointData: JointTaxData
  ): TaxCalculationResult {

    // Plausibilitätsprüfung: FEEa+FEEb+FSEa+FSEb > GFE+GFS
    const totalIndividualTaxes = (partnerA.fee + partnerA.fse) + (partnerB.fee + partnerB.fse);
    const totalJointTaxes = jointData.gfe + jointData.gfs;

    if (totalIndividualTaxes <= totalJointTaxes) {
      return {
        plausibilityCheck: false,
        plausibilityError: `Plausibilitätsprüfung fehlgeschlagen: Einzelsteuern (${totalIndividualTaxes.toFixed(2)}€) müssen höher sein als gemeinsame Steuern (${totalJointTaxes.toFixed(2)}€)`,
        factorA: 0,
        factorB: 0,
        gzz: 0,
        partnerA: { haetteZahlenMuessen: 0, mussNunZahlen: 0, hatGezahlt: 0, differenz: 0 },
        partnerB: { haetteZahlenMuessen: 0, mussNunZahlen: 0, hatGezahlt: 0, differenz: 0 }
      };
    }

    // Berechne Faktoren
    const factorA = (partnerA.fee + partnerA.fse) / totalIndividualTaxes;
    const factorB = (partnerB.fee + partnerB.fse) / totalIndividualTaxes;

    // Gemeinsame zu zahlende Steuer
    const gzz = jointData.gfe + jointData.gfs;

    // Berechne Ergebnisse für Partner A
    const partnerAHaetteZahlenMuessen = partnerA.fee + partnerA.fse;
    const partnerAMussNunZahlen = factorA * gzz;
    const partnerAHatGezahlt = partnerA.gl + partnerA.gve + partnerA.gs;
    const partnerADifferenz = partnerAMussNunZahlen - partnerAHatGezahlt;

    // Berechne Ergebnisse für Partner B
    const partnerBHaetteZahlenMuessen = partnerB.fee + partnerB.fse;
    const partnerBMussNunZahlen = factorB * gzz;
    const partnerBHatGezahlt = partnerB.gl + partnerB.gve + partnerB.gs;
    const partnerBDifferenz = partnerBMussNunZahlen - partnerBHatGezahlt;

    return {
      plausibilityCheck: true,
      factorA: Math.round(factorA * 10000) / 10000, // 4 Dezimalstellen
      factorB: Math.round(factorB * 10000) / 10000, // 4 Dezimalstellen
      gzz: Math.round(gzz * 100) / 100,
      partnerA: {
        haetteZahlenMuessen: Math.round(partnerAHaetteZahlenMuessen * 100) / 100,
        mussNunZahlen: Math.round(partnerAMussNunZahlen * 100) / 100,
        hatGezahlt: Math.round(partnerAHatGezahlt * 100) / 100,
        differenz: Math.round(partnerADifferenz * 100) / 100
      },
      partnerB: {
        haetteZahlenMuessen: Math.round(partnerBHaetteZahlenMuessen * 100) / 100,
        mussNunZahlen: Math.round(partnerBMussNunZahlen * 100) / 100,
        hatGezahlt: Math.round(partnerBHatGezahlt * 100) / 100,
        differenz: Math.round(partnerBDifferenz * 100) / 100
      }
    };
  }



  /**
   * Validiert die Eingabedaten
   */
  static validatePartners(partnerA: TaxPartner, partnerB: TaxPartner, jointData: JointTaxData): string[] {
    const errors: string[] = [];

    // Partner A Validierung
    if (partnerA.sek < 0) errors.push('Partner A: Steuerpflichtiges Einkommen muss positiv sein');
    if (partnerA.taxClass < 1 || partnerA.taxClass > 6) errors.push('Partner A: Steuerklasse muss zwischen 1 und 6 liegen');
    if (partnerA.gl < 0) errors.push('Partner A: Bereits gezahlte Lohnsteuer muss positiv sein');
    if (partnerA.gve < 0) errors.push('Partner A: Bereits gezahlte Vorauszahlung muss positiv sein');
    if (partnerA.gs < 0) errors.push('Partner A: Bereits gezahlter Soli muss positiv sein');

    // Partner B Validierung
    if (partnerB.sek < 0) errors.push('Partner B: Steuerpflichtiges Einkommen muss positiv sein');
    if (partnerB.taxClass < 1 || partnerB.taxClass > 6) errors.push('Partner B: Steuerklasse muss zwischen 1 und 6 liegen');
    if (partnerB.gl < 0) errors.push('Partner B: Bereits gezahlte Lohnsteuer muss positiv sein');
    if (partnerB.gve < 0) errors.push('Partner B: Bereits gezahlte Vorauszahlung muss positiv sein');
    if (partnerB.gs < 0) errors.push('Partner B: Bereits gezahlter Soli muss positiv sein');

    // Gemeinsame Daten Validierung
    if (jointData.gsek < 0) errors.push('Gemeinsames steuerpflichtiges Einkommen muss positiv sein');

    return errors;
  }
}
