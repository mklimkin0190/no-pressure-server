import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('bp_readings', {
    id: 'id',
    user_id: { type: 'varchar', notNull: true },
    sys: { type: 'integer', notNull: true },
    dia: { type: 'integer', notNull: true },
    time: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('bp_readings');
}

