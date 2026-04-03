import { FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import { BPReadingRequestBody, BPReadingRequestParams } from '../types';

const TEST_USER_ID = "test_user_id";
export const createHandlers = (pool: Pool) => ({
  getAll: async (_: FastifyRequest, res: FastifyReply) => {
    try {
      const result = await pool.query('SELECT * FROM bp_readings WHERE user_id = $1 ORDER BY time DESC', [TEST_USER_ID]);
      return { readings: result.rows };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
  },
  getById: async (req: FastifyRequest<{ Params: BPReadingRequestParams }>, res: FastifyReply) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM bp_readings WHERE id = $1 AND user_id = $2',
        [id, TEST_USER_ID]
      );
      if (result.rows.length === 0) {
        return res.status(404).send('Reading not found');
      }
      return { reading: result.rows[0] };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
  },
  create: async (req: FastifyRequest<{ Body: BPReadingRequestBody }>, res: FastifyReply) => {
    console.log('Received request to create BP reading:', req.body);
    const { sys, dia } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO bp_readings (sys, dia, user_id) VALUES ($1, $2, $3) RETURNING *',
        [sys, dia, TEST_USER_ID]
      );
      return { reading: result.rows[0] };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }

  },
  update: async (req: FastifyRequest<{ Params: BPReadingRequestParams; Body: BPReadingRequestBody }>, res: FastifyReply) => {
    console.log('Received request to update BP reading with id:', req.params.id, req.body);
    const { sys, dia } = req.body;
    const { id } = req.params;
    try {
      const result = await pool.query(
        'UPDATE bp_readings SET sys = $1, dia = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
        [sys, dia, id, TEST_USER_ID]
      );
      if (result.rows.length === 0) {
        return res.status(404).send('Reading not found');
      }
      return { reading: result.rows[0] };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
  },
  delete: async (req: FastifyRequest<{ Params: BPReadingRequestParams }>, res: FastifyReply) => {
    console.log('Received request to delete BP reading with id:', req.params.id);
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM bp_readings WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, TEST_USER_ID]
      );
      if (result.rows.length === 0) {
        return res.status(404).send('Reading not found');
      }
      return { message: 'Reading deleted' };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
  },
});
