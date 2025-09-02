import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Starte vollständige Initial-Migration basierend auf JavaScript-Objekten...');

  // 1. user_profiles Tabelle
  console.log('📋 Erstelle user_profiles Tabelle...');
  await knex.schema.createTable('user_profiles', (table) => {
    table.increments('id').primary();
    table.string('login_id', 255).unique().notNullable();
    table.string('name', 255).nullable();
    table.string('steuernummer', 255).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('last_login').defaultTo(knex.fn.now());
  });
  console.log('✅ user_profiles Tabelle erstellt');

  // 2. tax_data Tabelle - Vollständig entsprechend den JavaScript-Objekten
  console.log('📋 Erstelle tax_data Tabelle...');
  await knex.schema.createTable('tax_data', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('user_profiles').onDelete('CASCADE');
    table.integer('tax_year').notNullable().defaultTo(2024);

    // Partner A Daten - Entsprechend TaxPartner Interface
    table.string('partner_a_name', 255).nullable();           // name
    table.string('partner_a_steuer_id', 255).nullable();      // steuerId
    table.decimal('partner_a_sek', 12, 2).nullable();        // sek (Steuerpflichtiges Einkommen)
    table.integer('partner_a_tax_class').nullable();          // taxClass
    table.decimal('partner_a_fee', 12, 2).nullable();        // fee (Festgesetzte Einkommensteuer)
    table.decimal('partner_a_fse', 12, 2).nullable();        // fse (Festgesetzter Soli)
    table.decimal('partner_a_gl', 12, 2).nullable();         // gl (Bereits gezahlte Lohnsteuer)
    table.decimal('partner_a_gve', 12, 2).nullable();        // gve (Bereits gezahlte Vorauszahlung)
    table.decimal('partner_a_gs', 12, 2).nullable();         // gs (Bereits gezahlter Soli)

    // Partner B Daten - Entsprechend TaxPartner Interface
    table.string('partner_b_name', 255).nullable();           // name
    table.string('partner_b_steuer_id', 255).nullable();      // steuerId
    table.decimal('partner_b_sek', 12, 2).nullable();        // sek (Steuerpflichtiges Einkommen)
    table.integer('partner_b_tax_class').nullable();          // taxClass
    table.decimal('partner_b_fee', 12, 2).nullable();        // fee (Festgesetzte Einkommensteuer)
    table.decimal('partner_b_fse', 12, 2).nullable();        // fse (Festgesetzter Soli)
    table.decimal('partner_b_gl', 12, 2).nullable();         // gl (Bereits gezahlte Lohnsteuer)
    table.decimal('partner_b_gve', 12, 2).nullable();        // gve (Bereits gezahlte Vorauszahlung)
    table.decimal('partner_b_gs', 12, 2).nullable();         // gs (Bereits gezahlter Soli)

    // Gemeinsame Daten - Entsprechend JointTaxData Interface
    table.decimal('joint_gsek', 12, 2).nullable();            // gsek (Gemeinsames steuerpflichtiges Einkommen)
    table.decimal('joint_gfe', 12, 2).nullable();             // gfe (Gemeinsame festgesetzte Einkommensteuer)
    table.decimal('joint_gfs', 12, 2).nullable();             // gfs (Gemeinsamer festgesetzter Soli)

    // Berechnungsmodus
    table.string('calculation_mode', 20).defaultTo('manual');  // calculationMode

    // Metadaten
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Unique constraint
    table.unique(['user_id', 'tax_year']);
  });
  console.log('✅ tax_data Tabelle erstellt');

  // 3. Index für bessere Performance
  console.log('📊 Erstelle Indizes...');
  await knex.raw('CREATE INDEX idx_tax_data_user_tax_year ON tax_data(user_id, tax_year)');
  await knex.raw('CREATE INDEX idx_user_profiles_login_id ON user_profiles(login_id)');
  console.log('✅ Indizes erstellt');

  // 4. Trigger für updated_at Timestamp
  console.log('⚡ Erstelle Trigger und Funktionen...');
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Trigger für user_profiles Tabelle
  await knex.raw(`
    CREATE TRIGGER update_user_profiles_updated_at
        BEFORE UPDATE ON user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  `);

  // Trigger für tax_data Tabelle
  await knex.raw(`
    CREATE TRIGGER update_tax_data_updated_at
        BEFORE UPDATE ON tax_data
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
  `);
  console.log('✅ Trigger und Funktionen erstellt');

  console.log('🎉 Vollständige Initial-Migration erfolgreich abgeschlossen!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Rollback: Entferne alle Tabellen und Objekte...');

  // Trigger entfernen
  await knex.raw('DROP TRIGGER IF EXISTS update_tax_data_updated_at ON tax_data');
  await knex.raw('DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles');

  // Funktion entfernen
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()');

  // Tabellen entfernen
  await knex.schema.dropTableIfExists('tax_data');
  await knex.schema.dropTableIfExists('user_profiles');

  console.log('✅ Rollback abgeschlossen');
}
