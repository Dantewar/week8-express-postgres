Week 10 – Sequelize: From SQL Queries to Models

Skill 1 – Understanding ORM

1. What does Sequelize translate?

Sequelize translates JavaScript model methods into SQL queries.

For example, when I use Book.findAll(), Sequelize generates a SELECT query to retrieve books from my PostgreSQL database.

This makes it easier to work with database records because I can use JavaScript instead of writing SQL manually for every operation.

2. What does ORM stand for?

ORM stands for Object-Relational Mapping.

The object part refers to JavaScript objects and models, such as my Book model.

The relational part refers to PostgreSQL tables, columns, rows and relationships.

Sequelize connects JavaScript objects to relational database tables so that I can manage data through models.

3. What SQL does Book.findAll() and Book.findByPk(3) run?

The SQL equivalent of Book.findAll() is:

SELECT * FROM books;

The SQL equivalent of Book.findByPk(3) is:

SELECT * FROM books
WHERE id = 3;

The first query retrieves all books. The second retrieves one book using its primary key.

Sequelize may generate additional column aliases and quoted identifiers, but the queries perform the same operations.

4. What do host, port, dialect and logging do?

host: Specifies the address of the PostgreSQL server. My application uses localhost because PostgreSQL is running in Docker with a published port.

port: Specifies the network port used to access PostgreSQL. In my project, the host port is 5433.

dialect: Tells Sequelize which database system is being used. My project uses postgres.

logging: Controls whether Sequelize prints SQL queries in the terminal. I used logging: console.log to inspect the generated SQL and changed it back to false afterward.

5. What does sequelize.sync() do?

sequelize.sync() checks the defined models and creates missing database tables.

It does not normally change the structure of tables that already exist.

sequelize.sync({ force: true }) drops existing tables managed by the models and recreates them.

This can delete important data, which is why I should never use it on a database containing real information.

In my Week 10 project, I reused the existing PostgreSQL tables instead of recreating them.

6. When is plain SQL better than using an ORM?

Plain SQL can be better when writing complex queries with several JOINs, subqueries or aggregations.

For example, generating a detailed library report with the number of loans per member might be easier to control and optimize using SQL.

Sequelize simplifies common database operations, but understanding SQL is still useful for debugging and performance.

Skill 4 – Many-to-Many Relationships

Why does the loan date belong in the loans table?

The loan date belongs in the loans table because it describes a specific borrowing event.

A member can borrow many books, and a book can be borrowed by different members over time.

If the loan date were stored in the books or members table, it would be difficult to track separate borrowing events.

The loans table connects members and books and stores information specific to each loan, including the borrowing date and return date.

In my project, the existing PostgreSQL column is named borrowed_at. I mapped it to the Sequelize model attribute loan_date.

This allows me to use the required model attribute without changing the existing database table.

What I Learned

During this assignment, I learned how Sequelize connects JavaScript models with PostgreSQL tables.

I practiced using Sequelize methods for CRUD operations, creating relationships between models and retrieving related records using include.

I also compared Sequelize-generated SQL with my own JOIN queries.

This helped me understand how an ORM works and why SQL knowledge is still important when developing backend applications.


## Week 11 – Sentry

### Exercise 2 – Your First Error Report

**Question: You didn't add any extra information to this error yourself. List everything Sentry recorded anyway.**

Sentry automatically collected information when I triggered an error in my Express application.

The dashboard showed:

- Issue ID: NODE-EXPRESS-1
- Error message: My first Sentry error!
- Endpoint: GET /debug-sentry
- Environment: development
- Node.js version: v24.21.0
- Operating system: Windows 10.0.28000
- Status: Unhandled
- Events: 1
- Request source: Localhost (127.0.0.1)

The dashboard also provides information such as stack traces, tags, breadcrumbs and additional context.

This information helps developers investigate errors and identify problems in an application.
