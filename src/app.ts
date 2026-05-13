import Fastify from 'fastify';
import { Pool } from 'pg';
import { registerBPReadingRoutes } from './routes/bpReadings';
import { registerAuthRoutes } from './routes/auth';
import dotenv from 'dotenv';
dotenv.config();

const app = Fastify();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const appOrigin = process.env.APP_ORIGIN || 'http://localhost:5173';

const pool = new Pool();

app.addHook('onSend', async (request, reply, payload) => {
  const origin = request.headers.origin;
  if (origin === appOrigin) {
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Vary', 'Origin');
  }
  return payload;
});

app.options('*', async (request, reply) => {
  const origin = request.headers.origin;
  if (origin === appOrigin) {
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    reply.header('Vary', 'Origin');
  }
  return reply.code(204).send();
});

app.get('/', async (_, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return { rows: result.rows };
  } catch (err) {
    console.error(err);
    return res.status(500).send('Database error');
  }
});

registerAuthRoutes(app);
registerBPReadingRoutes(app, pool);

const logAppliedMigrations = async () => {
  try {
    const result = await pool.query<{ name: string }>(
      'SELECT name FROM pgmigrations ORDER BY run_on ASC, id ASC limit 7'
    );
    const names = result.rows.map(({ name }) => name);

    if (names.length === 0) {
      console.log('Database migration history: empty');
      return;
    }

    console.log('Database migration history (last 7):');
    names.forEach((name) => console.log(`- ${name}`));
  } catch (err) {
    console.error('Failed to load migration history');
    console.error(err);
  }
};

const start = async () => {
  await logAppliedMigrations();

  const address = await app.listen({ port: PORT, host: HOST });
  console.log(`Server listening at ${address}`);
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
