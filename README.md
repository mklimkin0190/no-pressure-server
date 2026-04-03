# No Pressure Server

Server for No Pressure.

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

## Local dev setup

Consider using [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script) to manage Node versions.

```bash
nvm install 24
```

Install dependencies:

```bash
npm install
createdb nopressure # Creates the DB owned by your current user by default
```

Create a `.env` file in the project root and set your database connection string:

```env
DATABASE_URL=postgres://user:password@localhost:5432/nopressure
```

## Running locally

```bash
npm run dev
```

This starts the server with `ts-node-dev`, which watches for file changes and restarts automatically.

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

## API Endpoints

All endpoints are served on `http://localhost:3000`.

### Health check

**`GET /`**
Returns the current database time. Used to verify the server and database connection are working.

---

### Blood pressure readings

**`GET /bpreadings`**
Returns all blood pressure readings for the current user, ordered by time descending.

Response:

```json
{
  "readings": [
    {
      "id": 1,
      "user_id": "test_user_id",
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
    "user_id": "test_user_id",
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
  "dia": 80
}
```

Constraints: `sys` must be between 1 and 300, `dia` between 1 and 200.

Response:

```json
{
  "reading": {
    "id": 1,
    "user_id": "test_user_id",
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
  "dia": 85
}
```

Constraints: same as POST.

Response:

```json
{
  "reading": {
    "id": 1,
    "user_id": "test_user_id",
    "sys": 125,
    "dia": 85,
    "time": "2024-01-01T12:00:00.000Z"
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
