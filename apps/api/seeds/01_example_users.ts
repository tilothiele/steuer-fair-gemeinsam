import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  //
}

export async function rollback(knex: Knex): Promise<void> {
  console.log('ℹ️  Rollback');
}
