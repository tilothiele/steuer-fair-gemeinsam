import { TaxCalculationService } from '../services/tax-calculation-service';
import { TaxPartner, JointTaxData } from '../types/tax-models';

describe('TaxCalculationService', () => {
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
    it('sollte korrekte Einkommensteuer für Partner A berechnen', () => {
      const result = TaxCalculationService.calculateIndividualTax(mockPartnerA);

      expect(result.fee).toBeGreaterThan(0);
      expect(result.fse).toBeGreaterThan(0);
      expect(result.fse).toBeCloseTo(result.fee * 0.055, 0); // Soli = 5,5% der Steuer
    });

    it('sollte korrekte Einkommensteuer für Partner B berechnen', () => {
      const result = TaxCalculationService.calculateIndividualTax(mockPartnerB);

      expect(result.fee).toBeGreaterThan(0);
      expect(result.fse).toBeGreaterThan(0);
      expect(result.fse).toBeCloseTo(result.fee * 0.055, 0);
    });

    it('sollte 0 zurückgeben für negatives Einkommen', () => {
      const negativePartner: TaxPartner = { ...mockPartnerA, sek: -1000 };
      const result = TaxCalculationService.calculateIndividualTax(negativePartner);

      expect(result.fee).toBe(0);
      expect(result.fse).toBe(0);
    });

    it('sollte 0 zurückgeben für 0 Einkommen', () => {
      const zeroPartner: TaxPartner = { ...mockPartnerA, sek: 0 };
      const result = TaxCalculationService.calculateIndividualTax(zeroPartner);

      expect(result.fee).toBe(0);
      expect(result.fse).toBe(0);
    });
  });

  describe('calculateJointTax', () => {
    it('sollte korrekte gemeinsame Einkommensteuer berechnen', () => {
      const result = TaxCalculationService.calculateJointTax(mockJointData);

      expect(result.gfe).toBeGreaterThan(0);
      expect(result.gfs).toBeGreaterThan(0);
      expect(result.gfs).toBeCloseTo(result.gfe * 0.055, 0);
    });

    it('sollte 0 zurückgeben für negatives Einkommen', () => {
      const negativeJointData: JointTaxData = { ...mockJointData, gsek: -1000 };
      const result = TaxCalculationService.calculateJointTax(negativeJointData);

      expect(result.gfe).toBe(0);
      expect(result.gfs).toBe(0);
    });
  });

  describe('calculateFairSplit', () => {
    it('sollte erfolgreiche Plausibilitätsprüfung durchführen', () => {
      const result = TaxCalculationService.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);

      expect(result.plausibilityCheck).toBe(true);
      expect(result.plausibilityError).toBeUndefined();
    });

    it('sollte korrekte Faktoren berechnen', () => {
      const result = TaxCalculationService.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);

      // Partner A: (8000 + 440) / (8000 + 440 + 6000 + 330) = 8440 / 14770 ≈ 0.5714
      // Partner B: (6000 + 330) / (8000 + 440 + 6000 + 330) = 6330 / 14770 ≈ 0.4286
      expect(result.factorA).toBeCloseTo(0.5714, 3);
      expect(result.factorB).toBeCloseTo(0.4286, 3);
      expect(result.factorA + result.factorB).toBeCloseTo(1, 4);
    });

    it('sollte korrekte "Muss nun zahlen" Werte berechnen', () => {
      const result = TaxCalculationService.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);

      const gzz = mockJointData.gfe + mockJointData.gfs; // 13000 + 715 = 13715

      // Partner A: 0.5714 * 13715 ≈ 7837.14
      // Partner B: 0.4286 * 13715 ≈ 5877.85
      expect(result.partnerA.mussNunZahlen).toBeCloseTo(7837.14, 1);
      expect(result.partnerB.mussNunZahlen).toBeCloseTo(5877.85, 1);
    });

    it('sollte korrekte Differenz-Werte berechnen', () => {
      const result = TaxCalculationService.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);

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

      const result = TaxCalculationService.calculateFairSplit(mockPartnerA, mockPartnerB, invalidJointData);

      expect(result.plausibilityCheck).toBe(false);
      expect(result.plausibilityError).toContain('Plausibilitätsprüfung fehlgeschlagen');
      expect(result.factorA).toBe(0);
      expect(result.factorB).toBe(0);
    });

    it('sollte korrekte "Hätte zahlen müssen" Werte setzen', () => {
      const result = TaxCalculationService.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);

      expect(result.partnerA.haetteZahlenMuessen).toBe(mockPartnerA.fee + mockPartnerA.fse);
      expect(result.partnerB.haetteZahlenMuessen).toBe(mockPartnerB.fee + mockPartnerB.fse);
    });

    it('sollte korrekte "Hat gezahlt" Werte setzen', () => {
      const result = TaxCalculationService.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);

      expect(result.partnerA.hatGezahlt).toBe(mockPartnerA.gl + mockPartnerA.gve + mockPartnerA.gs);
      expect(result.partnerB.hatGezahlt).toBe(mockPartnerB.gl + mockPartnerB.gve + mockPartnerB.gs);
    });
  });

  describe('calculatePartnerDisplayValues', () => {
    it('sollte korrekte Anzeigewerte für Partner A berechnen', () => {
      const result = TaxCalculationService.calculatePartnerDisplayValues(mockPartnerA);

      expect(result.haetteZahlenMuessen).toBe(mockPartnerA.fee + mockPartnerA.fse);
      expect(result.hatGezahlt).toBe(mockPartnerA.gl + mockPartnerA.gve + mockPartnerA.gs);
      expect(result.differenz).toBe(result.haetteZahlenMuessen - result.hatGezahlt);
    });

    it('sollte korrekte Anzeigewerte für Partner B berechnen', () => {
      const result = TaxCalculationService.calculatePartnerDisplayValues(mockPartnerB);

      expect(result.haetteZahlenMuessen).toBe(mockPartnerB.fee + mockPartnerB.fse);
      expect(result.hatGezahlt).toBe(mockPartnerB.gl + mockPartnerB.gve + mockPartnerB.gs);
      expect(result.differenz).toBe(result.haetteZahlenMuessen - result.hatGezahlt);
    });
  });

  describe('validatePartners', () => {
    it('sollte gültige Partner-Daten akzeptieren', () => {
      const errors = TaxCalculationService.validatePartners(mockPartnerA, mockPartnerB, mockJointData);

      expect(errors).toHaveLength(0);
    });

    it('sollte Fehler bei negativem steuerpflichtigem Einkommen melden', () => {
      const invalidPartnerA = { ...mockPartnerA, sek: -1000 };
      const errors = TaxCalculationService.validatePartners(invalidPartnerA, mockPartnerB, mockJointData);

      expect(errors).toContain('Partner A: Steuerpflichtiges Einkommen muss positiv sein');
    });

    it('sollte Fehler bei ungültiger Steuerklasse melden', () => {
      const invalidPartnerA = { ...mockPartnerA, taxClass: 0 };
      const invalidPartnerB = { ...mockPartnerB, taxClass: 7 };
      const errors = TaxCalculationService.validatePartners(invalidPartnerA, invalidPartnerB, mockJointData);

      expect(errors).toContain('Partner A: Steuerklasse muss zwischen 1 und 6 liegen');
      expect(errors).toContain('Partner B: Steuerklasse muss zwischen 1 und 6 liegen');
    });

    it('sollte Fehler bei negativen Zahlungen melden', () => {
      const invalidPartnerA = { ...mockPartnerA, gl: -100 };
      const invalidPartnerB = { ...mockPartnerB, gve: -200 };
      const errors = TaxCalculationService.validatePartners(invalidPartnerA, invalidPartnerB, mockJointData);

      expect(errors).toContain('Partner A: Bereits gezahlte Lohnsteuer muss positiv sein');
      expect(errors).toContain('Partner B: Bereits gezahlte Vorauszahlung muss positiv sein');
    });

    it('sollte Fehler bei negativem gemeinsamen Einkommen melden', () => {
      const invalidJointData = { ...mockJointData, gsek: -1000 };
      const errors = TaxCalculationService.validatePartners(mockPartnerA, mockPartnerB, invalidJointData);

      expect(errors).toContain('Gemeinsames steuerpflichtiges Einkommen muss positiv sein');
    });

    it('sollte mehrere Fehler gleichzeitig melden', () => {
      const invalidPartnerA = { ...mockPartnerA, sek: -1000, taxClass: 0, gl: -100 };
      const invalidPartnerB = { ...mockPartnerB, sek: -500, taxClass: 7, gve: -200 };
      const invalidJointData = { ...mockJointData, gsek: -1000 };

      const errors = TaxCalculationService.validatePartners(invalidPartnerA, invalidPartnerB, invalidJointData);

      expect(errors.length).toBeGreaterThan(5);
      expect(errors).toContain('Partner A: Steuerpflichtiges Einkommen muss positiv sein');
      expect(errors).toContain('Partner A: Steuerklasse muss zwischen 1 und 6 liegen');
      expect(errors).toContain('Partner A: Bereits gezahlte Lohnsteuer muss positiv sein');
    });
  });

  describe('Edge Cases und Grenzwerte', () => {
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

      const result = TaxCalculationService.calculateIndividualTax(smallPartner);
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

      const result = TaxCalculationService.calculateIndividualTax(largePartner);
      expect(result.fee).toBeGreaterThan(0);
      expect(result.fse).toBeGreaterThan(0);
    });

    it('sollte korrekte Rundung durchführen', () => {
      const result = TaxCalculationService.calculateFairSplit(mockPartnerA, mockPartnerB, mockJointData);

      // Alle Werte sollten auf 2 Dezimalstellen gerundet sein
      expect(Number.isInteger(result.partnerA.mussNunZahlen * 100)).toBe(true);
      expect(Number.isInteger(result.partnerB.mussNunZahlen * 100)).toBe(true);
      expect(Number.isInteger(result.partnerA.differenz * 100)).toBe(true);
      expect(Number.isInteger(result.partnerB.differenz * 100)).toBe(true);
    });
  });
});
