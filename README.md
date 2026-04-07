# CMA

## Introduction

CMA is an application designed to collect and monitor data from network devices.
It helps users define operational rules and automatically trigger actions when incoming device data matches those rules.
The goal is to provide continuous visibility, faster detection of issues, and consistent rule-driven responses.

Containerized multi-service application with:
- API (.NET)
- Collector (.NET worker)
- UI (Angular)
- PostgreSQL database
- Flyway migrations

## Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- Git

## Quick Start (Developer)

1. Create local config files:

```powershell
Copy-Item .env.example .env
Copy-Item secrets/postgres_user.example secrets/postgres_user.txt
Copy-Item secrets/postgres_password.example secrets/postgres_password.txt
```

2. Update your local values:
- .env (set POSTGRES_DB, POSTGRES_USER, POSTGRES_HOST, POSTGRES_PORT, APP_ENV)
- secrets/postgres_user.txt
- secrets/postgres_password.txt

3. Start database:

```powershell
docker compose up -d db
```

4. Apply migrations:

```powershell
docker compose --profile migration run --rm flyway
```

5. Start application services:

```powershell
docker compose up --build api collector ui
```

6. Open the app:
- UI: http://localhost:3000
- API: http://localhost:5000
- PostgreSQL: localhost:5432

Docker note:
- .env and secrets/*.txt are git-ignored and must stay local.
- `POSTGRES_HOST` and `POSTGRES_PORT` are used for container-to-container PostgreSQL access.
- In Docker Compose, `POSTGRES_HOST=db` and `POSTGRES_PORT=5432`.
- Tools running on your host machine still connect to PostgreSQL through `localhost:5432`.

## Project Structure

- backend/: .NET services and shared core
- CMA.UI/: frontend app
- database/: Flyway migration scripts (for example V1__init.sql)
- secrets/: local Docker Compose secret files for database credentials
- docker-compose.yml: local orchestration

## Migration Conventions

- Use versioned files in database/:
	- V1__init.sql
- Use Flyway placeholders for environment-aware data seed scripts:
	- `APP_ENV=dev` runs dev-only seed blocks
	- `APP_ENV=prod` skips dev-only seed blocks
- Do not create the database inside Flyway scripts.
- Database creation is handled by PostgreSQL container initialization.

## Troubleshooting

- "docker is not recognized": install Docker Desktop and restart terminal.
- Migration fails due to connection: ensure db is healthy before running Flyway.
- Flyway checksum mismatch: do not edit already-applied migration files; create a new V{n} file instead.