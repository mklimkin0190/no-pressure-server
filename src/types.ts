export type BPReading = {
  id: number;
  user_id: string;
  sys: number;
  dia: number;
  time: Date;
};

export type BPReadingRequestBody = {
  sys: number;
  dia: number;
  time?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type AuthSession = {
  user: AuthUser | null;
};

export type BPReadingRequestParams = {
  id: string;
};

export const BPReadingRequestSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['sys', 'dia'],
      properties: {
        sys: { type: 'integer', minimum: 1, maximum: 300 },
        dia: { type: 'integer', minimum: 1, maximum: 200 },
        time: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

export const IdParamRequestSchema = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  },
};
