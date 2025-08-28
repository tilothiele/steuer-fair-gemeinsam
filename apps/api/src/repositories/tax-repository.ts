import { pool } from '../database/connection';
import { TaxPartner, JointTaxData, TaxCalculationRequest } from '@steuer-fair/shared';
import { logger } from '../utils/logger';
import { UserRepository } from './user-repository';

export interface TaxDataRecord {
  id: number;
  userId: string;
  taxYear: number;
  partnerA: TaxPartner;
  partnerB: TaxPartner;
  jointData: JointTaxData;
  createdAt: Date;
  updatedAt: Date;
}

export class TaxRepository {
  static async findByUserAndYear(loginId: string, taxYear: number): Promise<TaxDataRecord | null> {
    try {
      // Finde Benutzer anhand der loginId
      const user = await UserRepository.findByLoginId(loginId);
      if (!user) {
        return null;
      }

      const result = await pool.query(
        'SELECT * FROM tax_data WHERE user_id = $1 AND tax_year = $2',
        [user.id, taxYear]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id.toString(),
        taxYear: row.tax_year,
        partnerA: {
          id: 'A',
          name: row.partner_a_name || '',
          steuerId: row.partner_a_steuer_id || '',
          sek: parseFloat(row.partner_a_sek) || 0,
          taxClass: row.partner_a_tax_class || 1,
          allowances: parseFloat(row.partner_a_allowances) || 0,
          specialExpenses: parseFloat(row.partner_a_special_expenses) || 0,
          extraordinaryExpenses: parseFloat(row.partner_a_extraordinary_expenses) || 0,
          childAllowance: parseFloat(row.partner_a_child_allowance) || 0,
          fee: parseFloat(row.partner_a_fee) || 0,
          fse: parseFloat(row.partner_a_fse) || 0,
          gl: parseFloat(row.partner_a_gl) || 0,
          gve: parseFloat(row.partner_a_gve) || 0,
          gs: parseFloat(row.partner_a_gs) || 0
        },
        partnerB: {
          id: 'B',
          name: row.partner_b_name || '',
          steuerId: row.partner_b_steuer_id || '',
          sek: parseFloat(row.partner_b_sek) || 0,
          taxClass: row.partner_b_tax_class || 1,
          allowances: parseFloat(row.partner_b_allowances) || 0,
          specialExpenses: parseFloat(row.partner_b_special_expenses) || 0,
          extraordinaryExpenses: parseFloat(row.partner_b_extraordinary_expenses) || 0,
          childAllowance: parseFloat(row.partner_b_child_allowance) || 0,
          fee: parseFloat(row.partner_b_fee) || 0,
          fse: parseFloat(row.partner_b_fse) || 0,
          gl: parseFloat(row.partner_b_gl) || 0,
          gve: parseFloat(row.partner_b_gve) || 0,
          gs: parseFloat(row.partner_b_gs) || 0
        },
        jointData: {
          gsek: parseFloat(row.joint_gsek) || 0,
          gfe: parseFloat(row.joint_gfe) || 0,
          gfs: parseFloat(row.joint_gfs) || 0
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      logger.error('Error finding tax data:', error);
      throw error;
    }
  }

  static async save(taxData: TaxCalculationRequest): Promise<TaxDataRecord> {
    try {
      // Finde oder erstelle Benutzer anhand der loginId
      let user = await UserRepository.findByLoginId(taxData.userId);
      if (!user) {
        // Erstelle neuen Benutzer
        user = await UserRepository.create({
          loginId: taxData.userId,
          name: undefined,
          steuernummer: undefined
        });
      }

      const result = await pool.query(
        `INSERT INTO tax_data (
          user_id, tax_year,
          partner_a_name, partner_a_steuer_id, partner_a_sek, partner_a_tax_class,
          partner_a_allowances, partner_a_special_expenses, partner_a_extraordinary_expenses,
          partner_a_child_allowance, partner_a_fee, partner_a_fse, partner_a_gl, partner_a_gve, partner_a_gs,
          partner_b_name, partner_b_steuer_id, partner_b_sek, partner_b_tax_class,
          partner_b_allowances, partner_b_special_expenses, partner_b_extraordinary_expenses,
          partner_b_child_allowance, partner_b_fee, partner_b_fse, partner_b_gl, partner_b_gve, partner_b_gs,
          joint_gsek, joint_gfe, joint_gfs
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
          $29, $30, $31
        )
        ON CONFLICT (user_id, tax_year)
        DO UPDATE SET
          partner_a_name = EXCLUDED.partner_a_name,
          partner_a_steuer_id = EXCLUDED.partner_a_steuer_id,
          partner_a_sek = EXCLUDED.partner_a_sek,
          partner_a_tax_class = EXCLUDED.partner_a_tax_class,
          partner_a_allowances = EXCLUDED.partner_a_allowances,
          partner_a_special_expenses = EXCLUDED.partner_a_special_expenses,
          partner_a_extraordinary_expenses = EXCLUDED.partner_a_extraordinary_expenses,
          partner_a_child_allowance = EXCLUDED.partner_a_child_allowance,
          partner_a_fee = EXCLUDED.partner_a_fee,
          partner_a_fse = EXCLUDED.partner_a_fse,
          partner_a_gl = EXCLUDED.partner_a_gl,
          partner_a_gve = EXCLUDED.partner_a_gve,
          partner_a_gs = EXCLUDED.partner_a_gs,
          partner_b_name = EXCLUDED.partner_b_name,
          partner_b_steuer_id = EXCLUDED.partner_b_steuer_id,
          partner_b_sek = EXCLUDED.partner_b_sek,
          partner_b_tax_class = EXCLUDED.partner_b_tax_class,
          partner_b_allowances = EXCLUDED.partner_b_allowances,
          partner_b_special_expenses = EXCLUDED.partner_b_special_expenses,
          partner_b_extraordinary_expenses = EXCLUDED.partner_b_extraordinary_expenses,
          partner_b_child_allowance = EXCLUDED.partner_b_child_allowance,
          partner_b_fee = EXCLUDED.partner_b_fee,
          partner_b_fse = EXCLUDED.partner_b_fse,
          partner_b_gl = EXCLUDED.partner_b_gl,
          partner_b_gve = EXCLUDED.partner_b_gve,
          partner_b_gs = EXCLUDED.partner_b_gs,
          joint_gsek = EXCLUDED.joint_gsek,
          joint_gfe = EXCLUDED.joint_gfe,
          joint_gfs = EXCLUDED.joint_gfs,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
        [
          user.id, taxData.year,
          taxData.partnerA.name, taxData.partnerA.steuerId, taxData.partnerA.sek, taxData.partnerA.taxClass,
          taxData.partnerA.allowances, taxData.partnerA.specialExpenses, taxData.partnerA.extraordinaryExpenses,
          taxData.partnerA.childAllowance, taxData.partnerA.fee, taxData.partnerA.fse, taxData.partnerA.gl, taxData.partnerA.gve, taxData.partnerA.gs,
          taxData.partnerB.name, taxData.partnerB.steuerId, taxData.partnerB.sek, taxData.partnerB.taxClass,
          taxData.partnerB.allowances, taxData.partnerB.specialExpenses, taxData.partnerB.extraordinaryExpenses,
          taxData.partnerB.childAllowance, taxData.partnerB.fee, taxData.partnerB.fse, taxData.partnerB.gl, taxData.partnerB.gve, taxData.partnerB.gs,
          taxData.jointData.gsek, taxData.jointData.gfe, taxData.jointData.gfs
        ]
      );
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id.toString(),
        taxYear: row.tax_year,
        partnerA: {
          id: 'A',
          name: row.partner_a_name || '',
          steuerId: row.partner_a_steuer_id || '',
          sek: parseFloat(row.partner_a_sek) || 0,
          taxClass: row.partner_a_tax_class || 1,
          allowances: parseFloat(row.partner_a_allowances) || 0,
          specialExpenses: parseFloat(row.partner_a_special_expenses) || 0,
          extraordinaryExpenses: parseFloat(row.partner_a_extraordinary_expenses) || 0,
          childAllowance: parseFloat(row.partner_a_child_allowance) || 0,
          fee: parseFloat(row.partner_a_fee) || 0,
          fse: parseFloat(row.partner_a_fse) || 0,
          gl: parseFloat(row.partner_a_gl) || 0,
          gve: parseFloat(row.partner_a_gve) || 0,
          gs: parseFloat(row.partner_a_gs) || 0
        },
        partnerB: {
          id: 'B',
          name: row.partner_b_name || '',
          steuerId: row.partner_b_steuer_id || '',
          sek: parseFloat(row.partner_b_sek) || 0,
          taxClass: row.partner_b_tax_class || 1,
          allowances: parseFloat(row.partner_b_allowances) || 0,
          specialExpenses: parseFloat(row.partner_b_special_expenses) || 0,
          extraordinaryExpenses: parseFloat(row.partner_b_extraordinary_expenses) || 0,
          childAllowance: parseFloat(row.partner_b_child_allowance) || 0,
          fee: parseFloat(row.partner_b_fee) || 0,
          fse: parseFloat(row.partner_b_fse) || 0,
          gl: parseFloat(row.partner_b_gl) || 0,
          gve: parseFloat(row.partner_b_gve) || 0,
          gs: parseFloat(row.partner_b_gs) || 0
        },
        jointData: {
          gsek: parseFloat(row.joint_gsek) || 0,
          gfe: parseFloat(row.joint_gfe) || 0,
          gfs: parseFloat(row.joint_gfs) || 0
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      logger.error('Error saving tax data:', error);
      throw error;
    }
  }
}
