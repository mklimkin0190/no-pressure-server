# No Pressure Server

Server for No Pressure.

## Production deploy (VPS, Tagmate-style)

Deploy flow:

1. Copies repo to `/opt/<repo-name>` on VPS.
2. Renders `.env.prod` from `.env.prod.template`.
3. Runs `docker compose -f docker-compose-prod.yml --env-file .env.prod up -d`.

Required deploy inputs:

- Repository secrets: `DB_NAME`, `DB_USER`, `DB_PASS`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_PASSPHRASE` (optional)
- Repository variables: `DOMAIN`, `APP_ORIGIN`

Traefik routing is configured for:

- Host: `nopressure.${DOMAIN}`
- API path: `/api` (prefix stripped before forwarding to Fastify)

## Requirements

- Node.js 24.14.1 or higher
- PostgreSQL 15 or higher

## Running in Docker

```bash
docker-compose up --build -d
```

Test connection:

```bash
curl http://localhost:3000
```

On first start, the Postgres container creates the database from the `PGUSER`, `PGPASSWORD`, and `PGDATABASE` values in `.env`. The app container runs `npm run migrate:up` before starting the server.

## Local dev setup

Create a `.env` file in the project root:

```env
PGDATABASE=nopressure
PGUSER=user
PGPASSWORD=password
APP_ORIGIN=http://localhost:5173
SESSION_SECRET=replace-me
GOOGLE_CLIENT_ID=replace-me
GOOGLE_CLIENT_SECRET=replace-me
```

`PGHOST` and `PGPORT` are set by `docker-compose.yml` inside the app container.

Then run the stack with Docker:

```bash
docker-compose up --build -d
```

## Migrations

Migrations are written in TypeScript and live in the `migrations/` directory. Before running them, compile the project:

```bash
npm run migrate:up
```

To roll back the most recent migration:

```bash
npm run migrate:down
```

> Both commands compile TypeScript first via `tsc`, then run `node-pg-migrate` against the compiled output in `dist/migrations/`.

Adding migrations:

```bash
npm run migrate:create <migration-name>
```

Then edit the generated file in `migrations/` to define the migration steps.

Create a new migration when the database schema changes: new tables, new columns, renamed columns or tables, indexes, constraints, or foreign keys. Do not create a migration for auth/env-only changes.

## API Endpoints

All endpoints are served on `http://localhost:3000`.

## Authentication

The server uses Google OAuth with an httpOnly session cookie.

Required environment variables for production:

- `APP_ORIGIN` - full origin, for example `https://nopressure.seriouspavel.com`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Auth endpoints:

- `GET /auth/session`
- `GET /auth/google/start`
- `GET /auth/google/callback`
- `POST /auth/logout`

### Health check

**`GET /`**
Returns the current database time. Used to verify the server and database connection are working.

---

### Blood pressure readings

Reading times are stored in UTC in the database and returned as ISO-8601 timestamps.

**`GET /bpreadings`**
Returns all blood pressure readings for the current user, ordered by time descending.

Response:

```json
{
  "readings": [
    {
      "id": 1,
      "user_id": "google:1234567890",
      "sys": 120,
      "dia": 80,
      "time": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

**`GET /bpreading/:id`**
Returns a single blood pressure reading by ID.

Response:

```json
{
  "reading": {
    "id": 1,
    "user_id": "google:1234567890",
    "sys": 120,
    "dia": 80,
    "time": "2024-01-01T12:00:00.000Z"
  }
}
```

---

**`POST /bpreading`**
Creates a new blood pressure reading.

Request body:

```json
{
  "sys": 120,
  "dia": 80,
  "time": "2024-01-01T12:00:00.000Z"
}
```

Constraints: `sys` must be between 1 and 300, `dia` between 1 and 200. `time` is optional.

Response:

```json
{
  "reading": {
    "id": 1,
    "user_id": "google:1234567890",
    "sys": 120,
    "dia": 80,
    "time": "2024-01-01T12:00:00.000Z"
  }
}
```

---

**`PUT /bpreading/:id`**
Updates an existing blood pressure reading by ID.

Request body:

```json
{
  "sys": 125,
  "dia": 85,
  "time": "2024-01-01T13:00:00.000Z"
}
```

Constraints: same as POST.

Response:

```json
{
  "reading": {
    "id": 1,
    "user_id": "google:1234567890",
    "sys": 125,
    "dia": 85,
    "time": "2024-01-01T13:00:00.000Z"
  }
}
```

---

**`DELETE /bpreading/:id`**
Deletes a blood pressure reading by ID.

Response:

```json
{
  "message": "Reading deleted"
}
```

---

All endpoints return `404` if a reading is not found, and `500` on a database error.

## Project structure

```
src/          # Application source code
migrations/   # Database migration files
dist/         # Compiled output (generated, do not edit)
```
