import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { BPReading, IdParamRequestSchema, BPReadingRequestBody, BPReadingRequestSchema } from "../types";
import { createHandlers } from "../controllers/bpReadings";


export const registerBPReadingRoutes = (app: FastifyInstance, pool: Pool) => {
  const handlers = createHandlers(pool);

  app.get<{ Reply: { readings: BPReading[] } | string }>('/bpreadings', handlers.getAll);
  app.get<{ Params: { id: string }; Reply: { reading: BPReading } | string }>(
    '/bpreading/:id',
    IdParamRequestSchema,
    handlers.getById
  );
  app.post<{ Body: BPReadingRequestBody; Reply: { reading: BPReading } | string }>(
    '/bpreading',
    BPReadingRequestSchema,
    handlers.create
  );
  app.put<{ Params: { id: string }; Body: BPReadingRequestBody; Reply: { reading: BPReading } | string }>(
    '/bpreading/:id',
    {
      schema: {
        ...BPReadingRequestSchema.schema,
        ...IdParamRequestSchema.schema,
      },
    },
    handlers.update
  );
  app.delete<{ Params: { id: string }; Reply: { message: string } | string }>(
    '/bpreading/:id',
    IdParamRequestSchema,
    handlers.delete
  );
};
