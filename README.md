# No Pressure Server

Server for No Pressure.

## Requirements

- Node.js 20.11 or higher
- PostgreSQL 13 or higher

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root and set your database connection string:

```env
DATABASE_URL=postgres://user:password@localhost:5432/no-pressure
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

## Project structure

```
src/          # Application source code
migrations/   # Database migration files
dist/         # Compiled output (generated, do not edit)
```
