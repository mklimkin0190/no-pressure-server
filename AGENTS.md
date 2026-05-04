# no-pressure-server

Backend context.

- Node service + Postgres.
- Prefer small, direct changes.
- Keep config in `.env` files.
- Follow the shared deployment pattern: dockerized service, Traefik labels for routing, GitHub Actions deploys to the shared Docker host.
- Avoid tests unless requested.
