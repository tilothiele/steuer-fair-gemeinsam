import { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'steuer_fair',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    migrations: {
      directory: process.env.KNEX_MIGRATIONS_DIR || './migrations',
      extension: 'ts',
      loadExtensions: ['.ts', '.js', '.sql'],
    },
    seeds: {
      directory: process.env.KNEX_SEEDS_DIR || './seeds',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'steuer_fair',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    migrations: {
      directory: process.env.KNEX_MIGRATIONS_DIR || './migrations',
      extension: 'ts',
      loadExtensions: ['.ts', '.js', '.sql'],
    },
    seeds: {
      directory: process.env.KNEX_SEEDS_DIR || './seeds',
    },
  },
};

export default config;
