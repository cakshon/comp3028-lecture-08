# Lecture 08: Data Sources & Node.js (companion code)

This folder contains the **completed example** from the revised slide deck. The
slides teach students to assemble the app gradually; here you can check your
work against the finished solution.

## 1. Prerequisites

- Node.js (active LTS version) and npm.
- PostgreSQL (existing course container, local installation, or hosted provider).
- Optionally Docker for the local classroom database.

## 2. Install packages

Open a terminal in this folder and type:

```sh
npm install express postgres dotenv express-fileupload
```

## 3. Start a PostgreSQL database (Docker option only)

This command uses intentionally simple **local demonstration credentials**.
Do not expose this container publicly or reuse the password in production.

```sh
docker run --name lecture8-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lecture8 -p 5432:5432 -d postgres:16
```

If the container already exists, use `docker start lecture8-db` instead.
If your class provides a PostgreSQL Dev Container, skip this Docker step.

## 4. Create the database tables

For Docker, run these four commands from the project directory, in order:

```sh
docker cp migrations/001_create_books.sql lecture8-db:/tmp/001.sql
docker exec lecture8-db psql -U postgres -d lecture8 -f /tmp/001.sql
docker cp migrations/002_seed_books.sql lecture8-db:/tmp/002.sql
docker exec lecture8-db psql -U postgres -d lecture8 -f /tmp/002.sql
```

Expected results: `CREATE TABLE` and `INSERT 0 2`. Do not run the seed
migration a second time unless you want duplicate sample records.

## 5. Configure the database URL

Copy `.env.example` to a new file named `.env`. In the sample Docker setup it
contains:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/lecture8
PORT=3000
```

Use **your own connection string** if using an existing course container,
installed PostgreSQL, or a hosted database. `.env` is gitignored.

## 6. Start the Node.js server

```sh
npm start
```

Open `http://localhost:3000` in a browser. Keep this terminal running.

## 7. Try the routes

| Method | URL | What it does |
|---|---|---|
| GET | `/` | Greeting |
| GET | `/hello?name=Ana` | Reads a query string |
| GET | `/product/42` | Reads a route parameter |
| GET | `/form` | Opens an HTML form |
| POST | `/feedback` | Reads form fields |
| POST | `/api/echo` | Reads JSON with `name` |
| GET | `/upload-form` | Opens the upload form |
| POST | `/upload` | Shows uploaded file metadata |
| GET | `/db-check` | Tests the PostgreSQL connection |
| GET | `/api/books` | Lists seeded books |
| POST | `/api/books` | Adds a book with `title`, `author` |
| GET | `/api/books/1` | Retrieves a book by ID |

For the JSON routes, select `POST`, set `Content-Type: application/json`, and
provide a body like:

```json
{"title":"Clean Code","author":"Robert C. Martin"}
```

The file-upload route reports the received file's name and length, **without
writing it to disk**. This is a classroom exercise, not a production upload
implementation.

## 8. Common fixes

- Server refuses connections: confirm the Node.js process is running.
- Can't find a module: run `npm install ...` in this folder.
- `/db-check` fails: check the database service and `.env` values.
- Table does not exist: apply migration `001_create_books.sql`.
- POST body is missing: use raw JSON and the correct `Content-Type` header.

`npm run check` checks JavaScript syntax but cannot test your database connection.
