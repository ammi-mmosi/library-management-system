# Library Management System — Data Layer

NestJS-ready Prisma data layer using PostgreSQL. Includes the required Book, Genre, User, and Role models, plus the optional Review model.

## Requirements

- Node.js 20+
- Hosted PostgreSQL database and connection URL
- npm

## Setup

```bash
cd api
npm install
cp .env.example .env
```

Replace the placeholder in `api/.env` with your own hosted PostgreSQL connection string. Never commit `.env` or credentials.

```bash
npm run db:generate
npm run db:migrate -- --name init_library_catalog
npm run db:seed
npm run db:studio
```

`db:migrate` creates and applies a migration to the configured database. Review the generated migration SQL and commit `api/prisma/migrations/` to version control. For deployment of committed migrations, run `npm run db:deploy` instead. `db:seed` is safe to rerun because it uses upserts.

**Important:** These commands must be run with valid database credentials. The repository does not contain a migration generated against a hosted database, and no live database has been modified as part of preparing this project.

## Schema Decisions

**Why Book references Genre instead of embedding it:** A relational database benefits from storing each genre once in a dedicated `Genre` table. `Book.genreId` is a foreign key, and `Book.genre` is the Prisma `@relation` field. This avoids inconsistent genre names, supports efficient genre-based queries, and enforces referential integrity. A single genre can contain many books; each book belongs to one genre in this design.

**User roles:** The `Role` enum restricts values to `PATRON` and `LIBRARIAN`, defaulting to `PATRON`. `email` is unique. The `password` field must contain a secure password hash, never plaintext.

**Book identifiers:** An auto-incremented primary key supports internal relations while unique `isbn` avoids duplicate catalog records. An index on `genreId` helps genre filtering.

**Optional Review model:** Each review belongs to one user and one book. `@@unique([bookId, userId])` prevents duplicate reviews by the same user for a book. Reviews cascade on deletion of their parent book or user. The application should validate that ratings are integers from 1 to 5; a database CHECK constraint can provide defense in depth.

## Seed Data

The idempotent seed script upserts **5 genres** and **20 books**, four books per genre: Fiction, Science Fiction, Mystery, Technology, and History. It does not create users or reviews.

## Prisma vs. Document Databases

In Prisma with PostgreSQL, modeling a genre means defining a separate model, a foreign key, and a relation. In a document database, I might simply embed a genre string in each book document. The relational approach takes more upfront structure but makes consistency and cross-book genre updates easier.

## Assignment Checklist

- [x] Role enum and User, Genre, Book models
- [x] Book.genreId foreign key with @relation
- [x] Seed data for 5 genres and 20 books
- [x] NestJS PrismaService connects on module initialization
- [x] Placeholder DATABASE_URL without credentials
- [x] Schema Decisions documentation
- [x] Optional Review model and comparison note
- [ ] Run migration against your hosted PostgreSQL database
- [ ] Run seed against your hosted PostgreSQL database
