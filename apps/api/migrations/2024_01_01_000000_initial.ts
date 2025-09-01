import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Prüfe, ob die Tabellen bereits existieren
  const usersExists = await knex.schema.hasTable('users');
  const taxDataExists = await knex.schema.hasTable('tax_data');

  if (!usersExists) {
    // Benutzer-Tabelle
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('login_id', 255).unique().notNullable();
      table.string('name', 255);
      table.string('steuernummer', 255);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('✅ users Tabelle erstellt');
  } else {
    console.log('ℹ️  users Tabelle existiert bereits');
  }

  if (!taxDataExists) {
    // Steuerdaten-Tabelle
    await knex.schema.createTable('tax_data', (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('year').notNullable();
      
      // Partner A Daten
      table.decimal('partner_a_einkommen', 12, 2);
      table.decimal('partner_a_steuern', 12, 2);
      table.decimal('partner_a_soli', 12, 2);
      table.decimal('partner_a_kirchensteuer', 12, 2);
      table.decimal('partner_a_haette_zahlen_muessen', 12, 2);
      table.decimal('partner_a_hat_gezahlt', 12, 2);
      table.decimal('partner_a_differenz', 12, 2);
      
      // Partner B Daten
      table.decimal('partner_b_einkommen', 12, 2);
      table.decimal('partner_b_steuern', 12, 2);
      table.decimal('partner_b_soli', 12, 2);
      table.decimal('partner_b_kirchensteuer', 12, 2);
      table.decimal('partner_b_haette_zahlen_muessen', 12, 2);
      table.decimal('partner_b_hat_gezahlt', 12, 2);
      table.decimal('partner_b_differenz', 12, 2);
      
      // Gemeinsame Daten
      table.decimal('gemeinsames_einkommen', 12, 2);
      table.decimal('gemeinsame_steuern', 12, 2);
      table.decimal('gemeinsamer_soli', 12, 2);
      table.decimal('gemeinsame_kirchensteuer', 12, 2);
      table.decimal('gemeinsame_haette_zahlen_muessen', 12, 2);
      table.decimal('gemeinsame_hat_gezahlt', 12, 2);
      table.decimal('gemeinsame_differenz', 12, 2);
      
      // Berechnungsmodus
      table.string('calculation_mode', 50).defaultTo('calculated');
      
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Unique constraint
      table.unique(['user_id', 'year']);
    });
    console.log('✅ tax_data Tabelle erstellt');
  } else {
    console.log('ℹ️  tax_data Tabelle existiert bereits');
  }

  // Index für bessere Performance (nur wenn sie nicht existieren)
  try {
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_tax_data_user_year ON tax_data(user_id, year)');
    console.log('✅ Index idx_tax_data_user_year erstellt/überprüft');
  } catch (error) {
    console.log('ℹ️  Index idx_tax_data_user_year existiert bereits');
  }

  try {
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id)');
    console.log('✅ Index idx_users_login_id erstellt/überprüft');
  } catch (error) {
    console.log('ℹ️  Index idx_users_login_id existiert bereits');
  }

  // Trigger für updated_at Timestamp (nur wenn sie nicht existieren)
  try {
    await knex.raw(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    console.log('✅ update_updated_at_column Funktion erstellt/aktualisiert');
  } catch (error) {
    console.log('ℹ️  update_updated_at_column Funktion existiert bereits');
  }

  // Trigger für users Tabelle (nur wenn sie nicht existieren)
  try {
    await knex.raw(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
          BEFORE UPDATE ON users 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Trigger update_users_updated_at erstellt/aktualisiert');
  } catch (error) {
    console.log('ℹ️  Trigger update_users_updated_at existiert bereits');
  }

  // Trigger für tax_data Tabelle (nur wenn sie nicht existieren)
  try {
    await knex.raw(`
      DROP TRIGGER IF EXISTS update_tax_data_updated_at ON tax_data;
      CREATE TRIGGER update_tax_data_updated_at 
          BEFORE UPDATE ON tax_data 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Trigger update_tax_data_updated_at erstellt/aktualisiert');
  } catch (error) {
    console.log('ℹ️  Trigger update_tax_data_updated_at existiert bereits');
  }
}

export async function down(knex: Knex): Promise<void> {
  // Trigger entfernen
  await knex.raw('DROP TRIGGER IF EXISTS update_tax_data_updated_at ON tax_data');
  await knex.raw('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
  
  // Funktion entfernen
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()');
  
  // Tabellen entfernen
  await knex.schema.dropTableIfExists('tax_data');
  await knex.schema.dropTableIfExists('users');
}
