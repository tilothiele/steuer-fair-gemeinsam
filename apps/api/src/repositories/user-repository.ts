import { pool } from '../database/connection';
import { User } from '@steuer-fair/shared';
import { logger } from '../utils/logger';

export class UserRepository {
  static async findById(id: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM user_profiles WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        loginId: row.login_id,
        name: row.name,
        steuernummer: row.steuernummer,
        createdAt: row.created_at,
        lastLogin: row.last_login
      };
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByLoginId(loginId: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM user_profiles WHERE login_id = $1',
        [loginId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        loginId: row.login_id,
        name: row.name,
        steuernummer: row.steuernummer,
        createdAt: row.created_at,
        lastLogin: row.last_login
      };
    } catch (error) {
      logger.error('Error finding user by login ID:', error);
      throw error;
    }
  }

  static async create(user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
    try {
      const result = await pool.query(
        'INSERT INTO user_profiles (login_id, name, steuernummer) VALUES ($1, $2, $3) RETURNING *',
        [user.loginId, user.name, user.steuernummer]
      );
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        loginId: row.login_id,
        name: row.name,
        steuernummer: row.steuernummer,
        createdAt: row.created_at,
        lastLogin: row.last_login
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(user: User): Promise<User> {
    try {
      const result = await pool.query(
        'UPDATE user_profiles SET name = $1, steuernummer = $2, last_login = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [user.name, user.steuernummer, user.id]
      );
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        loginId: row.login_id,
        name: row.name,
        steuernummer: row.steuernummer,
        createdAt: row.created_at,
        lastLogin: row.last_login
      };
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE user_profiles SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw error;
    }
  }
}
