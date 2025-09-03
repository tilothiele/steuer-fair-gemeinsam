import { TaxCalculator } from '../utils/tax-calculator';
import { TaxPartner, JointTaxData } from '../types/tax-models';

describe('TaxCalculator', () => {
  // Test-Daten für Partner A
  const mockPartnerA: TaxPartner = {
    id: 'A',
    name: 'Max Mustermann',
    steuerId: '12345678901',
    sek: 50000, // 50.000€ steuerpflichtiges Einkommen
    taxClass: 3,
    fee: 8000,  // 8.000€ festgesetzte Einkommensteuer
    fse: 440,   // 440€ festgesetzter Soli (8.000 * 0.055)
    gl: 6000,   // 6.000€ bereits gezahlte Lohnsteuer
    gve: 1500,  // 1.500€ bereits gezahlte Vorauszahlung
    gs: 330     // 330€ bereits gezahlter Soli (6.000 * 0.055)
  };

  // Test-Daten für Partner B
  const mockPartnerB: TaxPartner = {
    id: 'B',
    name: 'Maria Mustermann',
    steuerId: '12345678902',
    sek: 40000, // 40.000€ steuerpflichtiges Einkommen
    taxClass: 5,
    fee: 6000,  // 6.000€ festgesetzte Einkommensteuer
    fse: 330,   // 330€ festgesetzter Soli (6.000 * 0.055)
    gl: 4500,   // 4.500€ bereits gezahlte Lohnsteuer
    gve: 1200,  // 1.200€ bereits gezahlte Vorauszahlung
    gs: 247     // 247€ bereits gezahlter Soli (4.500 * 0.055)
  };

  // Test-Daten für gemeinsame Veranlagung
  const mockJointData: JointTaxData = {
    gsek: 90000, // 90.000€ gemeinsames steuerpflichtiges Einkommen
    gfe: 13000,  // 13.000€ gemeinsame festgesetzte Einkommensteuer
    gfs: 715,    // 715€ gemeinsamer festgesetzter Soli (13.000 * 0.055)
    calculationMode: 'manual'
  };

  describe('calculateIndividualTax', () => {
    it('sollte korrekte Einkommensteuer für niedriges Einkommen berechnen (14% Steuersatz)', () => {
      const lowIncomePartner: TaxPartner = { ...mockPartnerA, sek: 20000 }; // 20.000€
      const result = TaxCalculator.calculateIndividualTax(lowIncomePartner);
      
      // Grundfreibetrag: 11.604€
      // Steuerpflichtiges Einkommen: 20.000€ - 11.604€ = 8.396€
      // Steuer: 8.396€ * 0.14 = 1.175,44€ → gerundet: 1.175€
      // Soli: 1.175€ * 0.055 = 64,625€ → gerundet: 65€
      expect(result.fee).toBe(1175);
      expect(result.fse).toBe(65);
    });

    it('sollte korrekte Einkommensteuer für mittleres Einkommen berechnen (24% Steuersatz)', () => {
      const mediumIncomePartner: TaxPartner = { ...mockPartnerA, sek: 60000 }; // 60.000€
      const result = TaxCalculator.calculateIndividualTax(mediumIncomePartner);
      
      // Grundfreibetrag: 11.604€
      // Steuerpflichtiges Einkommen: 60.000€ - 11.604€ = 48.396€
      // Steuer: 48.396€ * 0.24 = 11.615,04€ → gerundet: 11.615€
      // Soli: 11.615€ * 0.055 = 638,825€ → gerundet: 639€
      expect(result.fee).toBe(11615);
      expect(result.fse).toBe(639);
    });

    it('sollte korrekte Einkommensteuer für hohes Einkommen berechnen (42% Steuersatz)', () => {
      const highIncomePartner: TaxPartner = { ...mockPartnerA, sek: 150000 }; // 150.000€
      const result = TaxCalculator.calculateIndividualTax(highIncomePartner);
      
      // Grundfreibetrag: 11.604€
      // Steuerpflichtiges Einkommen: 150.000€ - 11.604€ = 138.396€
      // Steuer: 138.396€ * 0.42 = 58.126,32€ → gerundet: 58.126€
      // Soli: 58.126€ * 0.055 = 3.196,93€ → gerundet: 3.197€
      expect(result.fee).toBe(58126);
      expect(result.fse).toBe(3197);
    });

    it('sollte 0 zurückgeben für Einkommen unter dem Grundfreibetrag', () => {
      const belowThresholdPartner: TaxPartner = { ...mockPartnerA, sek: 10000 }; // 10.000€
      const result = TaxCalculator.calculateIndividualTax(belowThresholdPartner);
      
      // 10.000€ < 11.604€ Grundfreibetrag
      expect(result.fee).toBe(0);
      expect(result.fse).toBe(0);
    });

    it('sollte 0 zurückgeben für negatives Einkommen', () => {
      const negativePartner: TaxPartner = { ...mockPartnerA, sek: -1000 };
      const result = TaxCalculator.calculateIndividualTax(negativePartner);
      
      expect(result.fee).toBe(0);
      expect(result.fse).toBe(0);
    });

    it('sollte 0 zurückgeben für 0 Einkommen', () => {
      const zeroPartner: TaxPartner = { ...mockPartnerA, sek: 0 };
      const result = TaxCalculator.calculateIndividualTax(zeroPartner);
      
      expect(result.fee).toBe(0);
      expect(result.fse).toBe(0);
    });

    it('sollte korrekte Steuersatz-Grenzen verwenden', () => {
      // Grenze bei 10.908€ (nach Grundfreibetrag)
      const atThreshold1Partner: TaxPartner = { ...mockPartnerA, sek: 11604 + 10908 }; // 22.512€
      const result1 = TaxCalculator.calculateIndividualTax(atThreshold1Partner);
      expect(result1.fee).toBe(Math.round(10908 * 0.14));
      
      // Grenze bei 62.809€ (nach Grundfreibetrag)
      const atThreshold2Partner: TaxPartner = { ...mockPartnerA, sek: 11604 + 62809 }; // 74.413€
      const result2 = TaxCalculator.calculateIndividualTax(atThreshold2Partner);
      expect(result2.fee).toBe(Math.round(62809 * 0.24));
    });
  });

  describe('calculateJointTax', () => {
    it('sollte korrekte gemeinsame Einkommensteuer für niedriges Einkommen berechnen (14% Steuersatz)', () => {
      const lowIncomeJointData: JointTaxData = { ...mockJointData, gsek: 40000 }; // 40.000€
      const result = TaxCalculator.calculateJointTax(lowIncomeJointData);
      
      // Grundfreibetrag für Ehepaare: 23.208€
      // Steuerpflichtiges Einkommen: 40.000€ - 23.208€ = 16.792€
      // Steuer: 16.792€ * 0.14 = 2.350,88€ → gerundet: 2.351€
      // Soli: 2.351€ * 0.055 = 129,305€ → gerundet: 129€
      expect(result.gfe).toBe(2351);
      expect(result.gfs).toBe(129);
    });

    it('sollte korrekte gemeinsame Einkommensteuer für mittleres Einkommen berechnen (24% Steuersatz)', () => {
      const mediumIncomeJointData: JointTaxData = { ...mockJointData, gsek: 80000 }; // 80.000€
      const result = TaxCalculator.calculateJointTax(mediumIncomeJointData);
      
      // Grundfreibetrag für Ehepaare: 23.208€
      // Steuerpflichtiges Einkommen: 80.000€ - 23.208€ = 56.792€
      // Steuer: 56.792€ * 0.24 = 13.630,08€ → gerundet: 13.630€
      // Soli: 13.630€ * 0.055 = 749,65€ → gerundet: 750€
      expect(result.gfe).toBe(13630);
      expect(result.gfs).toBe(750);
    });

    it('sollte korrekte gemeinsame Einkommensteuer für hohes Einkommen berechnen (42% Steuersatz)', () => {
      const highIncomeJointData: JointTaxData = { ...mockJointData, gsek: 200000 }; // 200.000€
      const result = TaxCalculator.calculateJointTax(highIncomeJointData);
      
      // Grundfreibetrag für Ehepaare: 23.208€
      // Steuerpflichtiges Einkommen: 200.000€ - 23.208€ = 176.792€
      // Steuer: 176.792€ * 0.42 = 74.252,64€ → gerundet: 74.253€
      // Soli: 74.253€ * 0.055 = 4.083,915€ → gerundet: 4.084€
      expect(result.gfe).toBe(74253);
      expect(result.gfs).toBe(4084);
    });

    it('sollte 0 zurückgeben für Einkommen unter dem Grundfreibetrag', () => {
      const belowThresholdJointData: JointTaxData = { ...mockJointData, gsek: 20000 }; // 20.000€
      const result = TaxCalculator.calculateJointTax(belowThresholdJointData);
      
      // 20.000€ < 23.208€ Grundfreibetrag für Ehepaare
      expect(result.gfe).toBe(0);
      expect(result.gfs).toBe(0);
    });

    it('sollte 0 zurückgeben für negatives Einkommen', () => {
      const negativeJointData: JointTaxData = { ...mockJointData, gsek: -1000 };
      const result = TaxCalculator.calculateJointTax(negativeJointData);
      
      expect(result.gfe).toBe(0);
      expect(result.gfs).toBe(0);
    });

    it('sollte korrekte Steuersatz-Grenzen für Ehepaare verwenden', () => {
      // Grenze bei 21.816€ (nach Grundfreibetrag)
      const atThreshold1JointData: JointTaxData = { ...mockJointData, gsek: 23208 + 21816 }; // 45.024€
      const result1 = TaxCalculator.calculateJointTax(atThreshold1JointData);
      expect(result1.gfe).toBe(Math.round(21816 * 0.14));
      
      // Grenze bei 125.618€ (nach Grundfreibetrag)
      const atThreshold2JointData: JointTaxData = { ...mockJointData, gsek: 23208 + 125618 }; // 148.826€
      const result2 = TaxCalculator.calculateJointTax(atThreshold2JointData);
      expect(result2.gfe).toBe(Math.round(125618 * 0.24));
    });
  });

  describe('calculateFairSplit', () => {
    it('sollte erfolgreiche Plausibilitätsprüfung durchführen', () => {
      const result = TaxCalculator.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);
      
      expect(result.plausibilityCheck).toBe(true);
      expect(result.plausibilityError).toBeUndefined();
    });

    it('sollte korrekte Faktoren berechnen', () => {
      const result = TaxCalculator.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);
      
      // Partner A: (8000 + 440) / (8000 + 440 + 6000 + 330) = 8440 / 14770 ≈ 0.5714
      // Partner B: (6000 + 330) / (8000 + 440 + 6000 + 330) = 6330 / 14770 ≈ 0.4286
      expect(result.factorA).toBeCloseTo(0.5714, 3);
      expect(result.factorB).toBeCloseTo(0.4286, 3);
      expect(result.factorA + result.factorB).toBeCloseTo(1, 4);
    });

    it('sollte korrekte "Muss nun zahlen" Werte berechnen', () => {
      const result = TaxCalculator.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);
      
      const gzz = mockJointData.gfe + mockJointData.gfs; // 13000 + 715 = 13715
      
      // Partner A: 0.5714 * 13715 ≈ 7837.14
      // Partner B: 0.4286 * 13715 ≈ 5877.85
      expect(result.partnerA.mussNunZahlen).toBeCloseTo(7837.14, 1);
      expect(result.partnerB.mussNunZahlen).toBeCloseTo(5877.85, 1);
    });

    it('sollte korrekte Differenz-Werte berechnen', () => {
      const result = TaxCalculator.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);
      
      // Partner A: 7837.14 - (6000 + 1500 + 330) = 7837.14 - 7830 = 7.14
      // Partner B: 5877.85 - (4500 + 1200 + 247) = 5877.85 - 5947 = -69.15
      expect(result.partnerA.differenz).toBeCloseTo(7.14, 1);
      expect(result.partnerB.differenz).toBeCloseTo(-69.15, 1);
    });

    it('sollte Plausibilitätsprüfung fehlschlagen lassen bei ungültigen Daten', () => {
      // Gemeinsame Steuern sind höher als Einzelsteuern (ungültig)
      const invalidJointData: JointTaxData = {
        ...mockJointData,
        gfe: 20000, // Höher als Einzelsteuern
        gfs: 1100
      };
      
      const result = TaxCalculator.calculateFairSplit(mockPartnerA, mockPartnerB, invalidJointData);
      
      expect(result.plausibilityCheck).toBe(false);
      expect(result.plausibilityError).toContain('Plausibilitätsprüfung fehlgeschlagen');
      expect(result.factorA).toBe(0);
      expect(result.factorB).toBe(0);
    });

    it('sollte korrekte "Hätte zahlen müssen" Werte setzen', () => {
      const result = TaxCalculator.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);
      
      expect(result.partnerA.haetteZahlenMuessen).toBe(mockPartnerA.fee + mockPartnerA.fse);
      expect(result.partnerB.haetteZahlenMuessen).toBe(mockPartnerB.fee + mockPartnerB.fse);
    });

    it('sollte korrekte "Hat gezahlt" Werte setzen', () => {
      const result = TaxCalculator.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);
      
      expect(result.partnerA.hatGezahlt).toBe(mockPartnerA.gl + mockPartnerA.gve + mockPartnerA.gs);
      expect(result.partnerB.hatGezahlt).toBe(mockPartnerB.gl + mockPartnerB.gve + mockPartnerB.gs);
    });

    it('sollte korrekte Rundung auf 4 Dezimalstellen für Faktoren durchführen', () => {
      const result = TaxCalculator.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);
      
      // Faktoren sollten auf 4 Dezimalstellen gerundet sein
      expect(Number.isInteger(result.factorA * 10000)).toBe(true);
      expect(Number.isInteger(result.factorB * 10000)).toBe(true);
    });

    it('sollte korrekte Rundung auf 2 Dezimalstellen für andere Werte durchführen', () => {
      const result = TaxCalculator.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);
      
      // Alle anderen Werte sollten auf 2 Dezimalstellen gerundet sein
      expect(Number.isInteger(result.gzz * 100)).toBe(true);
      expect(Number.isInteger(result.partnerA.mussNunZahlen * 100)).toBe(true);
      expect(Number.isInteger(result.partnerB.mussNunZahlen * 100)).toBe(true);
      expect(Number.isInteger(result.partnerA.differenz * 100)).toBe(true);
      expect(Number.isInteger(result.partnerB.differenz * 100)).toBe(true);
    });
  });

  describe('validatePartners', () => {
    it('sollte gültige Partner-Daten akzeptieren', () => {
      const errors = TaxCalculator.validatePartners(mockPartnerA, mockPartnerB, mockJointData);
      
      expect(errors).toHaveLength(0);
    });

    it('sollte Fehler bei negativem steuerpflichtigem Einkommen melden', () => {
      const invalidPartnerA = { ...mockPartnerA, sek: -1000 };
      const errors = TaxCalculator.validatePartners(invalidPartnerA, mockPartnerB, mockJointData);
      
      expect(errors).toContain('Partner A: Steuerpflichtiges Einkommen muss positiv sein');
    });

    it('sollte Fehler bei ungültiger Steuerklasse melden', () => {
      const invalidPartnerA = { ...mockPartnerA, taxClass: 0 };
      const invalidPartnerB = { ...mockPartnerB, taxClass: 7 };
      const errors = TaxCalculator.validatePartners(invalidPartnerA, invalidPartnerB, mockJointData);
      
      expect(errors).toContain('Partner A: Steuerklasse muss zwischen 1 und 6 liegen');
      expect(errors).toContain('Partner B: Steuerklasse muss zwischen 1 und 6 liegen');
    });

    it('sollte Fehler bei negativen Zahlungen melden', () => {
      const invalidPartnerA = { ...mockPartnerA, gl: -100 };
      const invalidPartnerB = { ...mockPartnerB, gve: -200 };
      const errors = TaxCalculator.validatePartners(invalidPartnerA, invalidPartnerB, mockJointData);
      
      expect(errors).toContain('Partner A: Bereits gezahlte Lohnsteuer muss positiv sein');
      expect(errors).toContain('Partner B: Bereits gezahlte Vorauszahlung muss positiv sein');
    });

    it('sollte Fehler bei negativem gemeinsamen Einkommen melden', () => {
      const invalidJointData = { ...mockJointData, gsek: -1000 };
      const errors = TaxCalculator.validatePartners(mockPartnerA, mockPartnerB, invalidJointData);
      
      expect(errors).toContain('Gemeinsames steuerpflichtiges Einkommen muss positiv sein');
    });

    it('sollte mehrere Fehler gleichzeitig melden', () => {
      const invalidPartnerA = { ...mockPartnerA, sek: -1000, taxClass: 0, gl: -100 };
      const invalidPartnerB = { ...mockPartnerB, sek: -500, taxClass: 7, gve: -200 };
      const invalidJointData = { ...mockJointData, gsek: -1000 };
      
      const errors = TaxCalculator.validatePartners(invalidPartnerA, invalidPartnerB, invalidJointData);
      
      expect(errors.length).toBeGreaterThan(5);
      expect(errors).toContain('Partner A: Steuerpflichtiges Einkommen muss positiv sein');
      expect(errors).toContain('Partner A: Steuerklasse muss zwischen 1 und 6 liegen');
      expect(errors).toContain('Partner A: Bereits gezahlte Lohnsteuer muss positiv sein');
    });
  });

  describe('Steuersatz-Berechnungen und Grenzwerte', () => {
    it('sollte korrekte Steuersätze für verschiedene Einkommensstufen verwenden', () => {
      // Test für 14% Steuersatz
      const lowIncomePartner: TaxPartner = { ...mockPartnerA, sek: 25000 };
      const lowResult = TaxCalculator.calculateIndividualTax(lowIncomePartner);
      expect(lowResult.fee).toBeGreaterThan(0);
      
      // Test für 24% Steuersatz
      const mediumIncomePartner: TaxPartner = { ...mockPartnerA, sek: 70000 };
      const mediumResult = TaxCalculator.calculateIndividualTax(mediumIncomePartner);
      expect(mediumResult.fee).toBeGreaterThan(0);
      
      // Test für 42% Steuersatz
      const highIncomePartner: TaxPartner = { ...mockPartnerA, sek: 150000 };
      const highResult = TaxCalculator.calculateIndividualTax(highIncomePartner);
      expect(highResult.fee).toBeGreaterThan(0);
    });

    it('sollte korrekte Grundfreibeträge verwenden', () => {
      // Einzelveranlagung: 11.604€
      const singlePartner: TaxPartner = { ...mockPartnerA, sek: 11604 };
      const singleResult = TaxCalculator.calculateIndividualTax(singlePartner);
      expect(singleResult.fee).toBe(0); // Keine Steuer unter Grundfreibetrag
      
      // Gemeinsame Veranlagung: 23.208€
      const jointData: JointTaxData = { ...mockJointData, gsek: 23208 };
      const jointResult = TaxCalculator.calculateJointTax(jointData);
      expect(jointResult.gfe).toBe(0); // Keine Steuer unter Grundfreibetrag
    });

    it('sollte mit sehr kleinen Werten umgehen können', () => {
      const smallPartner: TaxPartner = {
        ...mockPartnerA,
        sek: 0.01,
        fee: 0.01,
        fse: 0.001,
        gl: 0.01,
        gve: 0.01,
        gs: 0.001
      };
      
      const result = TaxCalculator.calculateIndividualTax(smallPartner);
      expect(result.fee).toBeGreaterThanOrEqual(0);
      expect(result.fse).toBeGreaterThanOrEqual(0);
    });

    it('sollte mit sehr großen Werten umgehen können', () => {
      const largePartner: TaxPartner = {
        ...mockPartnerA,
        sek: 1000000, // 1 Million €
        fee: 400000,  // 400.000€ Steuer
        fse: 22000    // 22.000€ Soli
      };
      
      const result = TaxCalculator.calculateIndividualTax(largePartner);
      expect(result.fee).toBeGreaterThan(0);
      expect(result.fse).toBeGreaterThan(0);
    });
  });
});
