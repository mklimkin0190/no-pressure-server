import Fastify from 'fastify';
import { Pool } from 'pg';
import { registerBPReadingRoutes } from './routes/bpReadings';
import dotenv from 'dotenv';
dotenv.config();

const app = Fastify();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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

registerBPReadingRoutes(app, pool);

app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
