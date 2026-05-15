import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE bp_readings
      ALTER COLUMN time TYPE timestamptz
      USING time AT TIME ZONE 'UTC';
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE bp_readings
      ALTER COLUMN time TYPE timestamp
      USING time AT TIME ZONE 'UTC';
  `);
}
