
# Express and PostgreSQL – Library Management API

## Project Overview

This project is part of Week 8 of the Backend Development course.

The purpose is to build a REST API using Node.js, Express and PostgreSQL. The application manages books, authors, library members and book loans.

Unlike previous exercises using in-memory arrays or JSON files, this application stores data in a relational PostgreSQL database.

The project demonstrates database connections, CRUD operations, SQL queries, validation, HTTP status codes and relational database concepts.

## Technologies Used

- Node.js – JavaScript runtime environment
- Express.js – Web framework for building REST APIs
- PostgreSQL – Relational database management system
- pg – PostgreSQL client for Node.js
- dotenv – Environment variable configuration
- Docker Desktop – Container management
- Docker Compose – Multi-container configuration
- pgAdmin – PostgreSQL administration interface
- Insomnia – API testing
- Git and GitHub – Version control

## Project Structure

```text
week8-express-postgres/
├── compose.yml
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── init.sql
├── db.js
└── index.js
```

The `node_modules` directory is generated locally during installation and is excluded from Git.

### File Responsibilities

| File | Description |
|---|---|
| compose.yml | Configures PostgreSQL and pgAdmin containers |
| .env | Stores local environment variables and credentials |
| .gitignore | Excludes sensitive and generated files |
| package.json | Defines dependencies and npm scripts |
| init.sql | Creates database tables, relationships and initial data |
| db.js | Configures the PostgreSQL connection pool |
| index.js | Implements the Express server and API routes |
| README.md | Documents the project |

## Installation and Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root.

```env
DB_USER=librarian
DB_PASSWORD=your_local_password
DB_DATABASE=library
DB_HOST=localhost
DB_PORT=5433

PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=your_pgadmin_password
PGADMIN_PORT=8081

PORT=3000
```

The actual `.env` file must not be committed to GitHub.

### 3. Start Docker Containers

```bash
docker compose up -d
```

Check container status:

```bash
docker compose ps
```

The local services are:

- PostgreSQL: localhost:5433
- pgAdmin: http://localhost:8081
- Express API: http://localhost:3000

### 4. Initialize the Database

Open pgAdmin and connect to PostgreSQL using the database service name `db` and internal port `5432`.

On a new, empty database, execute the SQL statements from `init.sql`.

The initialization script creates the required tables, relationships and initial book data.

Do not rerun the full initialization script on an existing database containing these tables.

### 5. Start the Express Server

```bash
npm run dev
```

The application starts at:

http://localhost:3000

## Database Design

The application uses four related tables.

### Books

Stores book information:

- id
- title
- genre
- published_year
- author_id

### Authors

Stores author information:

- id
- name

### Members

Stores registered library members:

- id
- name
- email

The email field has a UNIQUE constraint.

### Loans

Stores borrowing records:

- id
- book_id
- member_id
- borrowed_at
- returned_at

Foreign keys connect loans to books and members.

A partial unique index prevents multiple active loans for the same book.

## API Endpoints

### Books

| Method | Endpoint | Description |
|---|---|---|
| GET | /books | Get all books |
| GET | /books/:id | Get one book |
| POST | /books | Create a book |
| PUT | /books/:id | Update a book |
| PATCH | /books/:id | Partially update a book |
| DELETE | /books/:id | Delete a book |

### Filtering and Sorting

Examples:

```text
GET /books?genre=dystopian
GET /books?sort=published_year
GET /books?genre=dystopian&sort=title
```

The API uses parameterized SQL queries for filtering and an allowlist of column names for sorting.

### Authors

| Method | Endpoint | Description |
|---|---|---|
| GET | /authors | Get all authors |
| POST | /authors | Create an author |
| GET | /authors/:id/books | Get books written by an author |

### Members and Loans

| Method | Endpoint | Description |
|---|---|---|
| POST | /members | Register a library member |
| POST | /loans | Borrow a book |
| PATCH | /loans/:id/return | Return a borrowed book |
| GET | /members/:id/loans | Get a member's loan history |

## Example Requests

### Create a Book

POST /books

```json
{
  "title": "The Shining",
  "genre": "horror",
  "published_year": 1977,
  "author_id": 5
}
```

### Partially Update a Book

PATCH /books/1

```json
{
  "genre": "classic"
}
```

Only the specified field is updated.

### Create a Member

POST /members

```json
{
  "name": "Anna Svensson",
  "email": "anna@example.com"
}
```

### Borrow a Book

POST /loans

```json
{
  "book_id": 1,
  "member_id": 1
}
```

## HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 OK | Request completed successfully |
| 201 Created | A new record was created |
| 400 Bad Request | Invalid or missing input |
| 404 Not Found | Requested record does not exist |
| 409 Conflict | Duplicate or conflicting operation |
| 500 Internal Server Error | Unexpected server or database error |

## Validation and Error Handling

The application validates incoming request data before executing database operations.

Book IDs must be valid positive integers, and book titles are required.

Database operations use asynchronous functions with try/catch blocks.

Parameterized queries help prevent SQL injection.

PostgreSQL error codes are used to handle specific database errors:

- 23503 – Foreign key violation
- 23505 – Unique constraint violation

For example, attempting to create a book with an unknown author returns HTTP 400.

Registering a member with an existing email address returns HTTP 409.

Attempting to borrow an already borrowed book also returns HTTP 409.

## API Testing

The application was tested using Insomnia.

Verified scenarios include:

- Retrieving all books
- Retrieving an individual book
- Creating a book
- Updating a book
- Deleting a book
- Filtering and sorting books
- Partially updating book information
- Retrieving authors
- Retrieving books using SQL JOIN
- Creating books with author relationships
- Rejecting invalid author IDs
- Registering library members
- Rejecting duplicate email addresses
- Creating book loans
- Preventing duplicate active loans

Additional routes include returning borrowed books and retrieving member loan history.

## Completed Assignments

- Skill 1 – Project setup and database connection
- Exercise 1 – Get one book by ID
- Exercise 2 – HTTP status codes and input validation
- Exercise 3 – Project structure and connection pooling
- Exercise 4 – Filtering and sorting
- Exercise 5 – Partial updates using PATCH
- Exercise 6 – Authors and one-to-many relationships
- Exercise 7 – Members, loans and many-to-many relationships

Exercises 8 and 9 were not included.

## Key Learning Outcomes

This project strengthened my understanding of how a backend application interacts with a relational database.

I practiced using Express routes, asynchronous JavaScript, SQL queries, database relationships and HTTP status codes.

I also learned how to configure Docker containers, work with PostgreSQL connection pools, handle database constraint errors and test API functionality using Insomnia.

The project demonstrates the transition from basic CRUD applications to a backend system using persistent relational data.

## References

1. Express.js Documentation  
   https://expressjs.com/

2. node-postgres Documentation  
   https://node-postgres.com/

3. PostgreSQL Documentation  
   https://www.postgresql.org/docs/

4. Docker Documentation  
   https://docs.docker.com/

5. MDN HTTP Status Codes  
   https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

6. OWASP SQL Injection Prevention  
   https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
