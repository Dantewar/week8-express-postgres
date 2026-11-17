
import express from "express";
import dotenv from "dotenv";
import { Op } from "sequelize";
import sequelize from "./sequelize.js";
import { Book, Author, Member, Loan } from "./models/index.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Validate positive integer IDs
const isValidId = (id) =>
  /^\d+$/.test(String(id)) &&
  Number.isSafeInteger(Number(id)) &&
  Number(id) > 0;

// Validate optional book fields
const isValidGenre = (genre) =>
  genre === null || typeof genre === "string";

const isValidYear = (year) =>
  year === null || Number.isInteger(year);

// Extract PostgreSQL error codes from Sequelize errors
const databaseErrorCode = (error) =>
  error?.parent?.code ?? error?.original?.code;

// Test PostgreSQL connection
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return false;
  }
}

// Welcome
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Library API",
    database: "PostgreSQL",
    orm: "Sequelize",
  });
});

// GET all books with filtering, sorting, search and pagination
app.get("/books", async (req, res) => {
  const { genre, sort, search, page } = req.query;
  const allowedSorts = ["title", "published_year", "genre"];

  if (genre !== undefined && typeof genre !== "string") {
    return res.status(400).json({
      message: "Invalid genre",
    });
  }

  if (
    sort !== undefined &&
    (typeof sort !== "string" || !allowedSorts.includes(sort))
  ) {
    return res.status(400).json({
      message: "Invalid sort field",
    });
  }

  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({
      message: "Invalid search",
    });
  }

  if (page !== undefined && !isValidId(page)) {
    return res.status(400).json({
      message: "Invalid page",
    });
  }

  try {
    const where = {};

    if (genre !== undefined) {
      where.genre = genre;
    }

    if (search !== undefined) {
      where.title = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const options = {
      where,
      include: [
        {
          model: Author,
          as: "author",
          attributes: ["id", "name"],
        },
      ],
      order: [[sort || "id", "ASC"]],
    };

    if (page !== undefined) {
      options.limit = 10;
      options.offset = (Number(page) - 1) * 10;
    }

    const books = await Book.findAll(options);

    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch books",
    });
  }
});

// GET a book by ID
app.get("/books/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  try {
    const book = await Book.findByPk(Number(req.params.id), {
      include: [
        {
          model: Author,
          as: "author",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch book",
    });
  }
});

// POST create a book
app.post("/books", async (req, res) => {
  const { title, genre, published_year, author_id } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  if (title.trim().length > 100) {
    return res.status(400).json({
      message: "Title must be at most 100 characters",
    });
  }

  if (genre !== undefined && !isValidGenre(genre)) {
    return res.status(400).json({
      message: "Invalid genre",
    });
  }

  if (typeof genre === "string" && genre.length > 50) {
    return res.status(400).json({
      message: "Genre must be at most 50 characters",
    });
  }

  if (
    published_year !== undefined &&
    !isValidYear(published_year)
  ) {
    return res.status(400).json({
      message: "Invalid published year",
    });
  }

  if (
    author_id !== undefined &&
    author_id !== null &&
    (!Number.isSafeInteger(author_id) || author_id <= 0)
  ) {
    return res.status(400).json({
      message: "Invalid author ID",
    });
  }

  try {
    const book = await Book.create({
      title: title.trim(),
      genre: genre ?? null,
      published_year: published_year ?? null,
      author_id: author_id ?? null,
    });

    res.status(201).json(book);
  } catch (error) {
    if (databaseErrorCode(error) === "23503") {
      return res.status(400).json({
        message: "Author does not exist",
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Failed to create book",
    });
  }
});

// PUT update an existing book
app.put("/books/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  const { title, genre, published_year } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  if (title.trim().length > 100) {
    return res.status(400).json({
      message: "Title must be at most 100 characters",
    });
  }

  if (genre !== undefined && !isValidGenre(genre)) {
    return res.status(400).json({
      message: "Invalid genre",
    });
  }

  if (typeof genre === "string" && genre.length > 50) {
    return res.status(400).json({
      message: "Genre must be at most 50 characters",
    });
  }

  if (
    published_year !== undefined &&
    !isValidYear(published_year)
  ) {
    return res.status(400).json({
      message: "Invalid published year",
    });
  }

  try {
    const book = await Book.findByPk(Number(req.params.id));

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    book.title = title.trim();
    book.genre = genre ?? null;
    book.published_year = published_year ?? null;

    await book.save();

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update book",
    });
  }
});

// PATCH partially update a book
app.patch("/books/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  const body = req.body;

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return res.status(400).json({
      message: "Request body cannot be empty",
    });
  }

  const allowedFields = [
    "title",
    "genre",
    "published_year",
  ];

  if (
    Object.keys(body).some(
      (field) => !allowedFields.includes(field)
    )
  ) {
    return res.status(400).json({
      message: "Invalid book field",
    });
  }

  if (
    (body.title !== undefined &&
      (typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 100)) ||
    (body.genre !== undefined &&
      (!isValidGenre(body.genre) ||
        (typeof body.genre === "string" &&
          body.genre.length > 50))) ||
    (body.published_year !== undefined &&
      !isValidYear(body.published_year))
  ) {
    return res.status(400).json({
      message: "Invalid book data",
    });
  }

  try {
    const book = await Book.findByPk(Number(req.params.id));

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    if (body.title !== undefined) {
      book.title = body.title.trim();
    }

    if (body.genre !== undefined) {
      book.genre = body.genre;
    }

    if (body.published_year !== undefined) {
      book.published_year = body.published_year;
    }

    await book.save();

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to partially update book",
    });
  }
});

// DELETE a book
app.delete("/books/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  try {
    const book = await Book.findByPk(Number(req.params.id));

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const deletedBook = book.toJSON();

    await book.destroy();

    res.status(200).json({
      message: "Book deleted successfully",
      book: deletedBook,
    });
  } catch (error) {
    if (databaseErrorCode(error) === "23503") {
      return res.status(409).json({
        message: "Cannot delete a book with loan records",
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Failed to delete book",
    });
  }
});

// GET all authors
app.get("/authors", async (req, res) => {
  try {
    const authors = await Author.findAll({
      order: [["id", "ASC"]],
    });

    res.status(200).json(authors);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch authors",
    });
  }
});

// POST create an author
app.post("/authors", async (req, res) => {
  const { name } = req.body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 100
  ) {
    return res.status(400).json({
      message: "Valid author name is required (max 100 characters)",
    });
  }

  try {
    const author = await Author.create({
      name: name.trim(),
    });

    res.status(201).json(author);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create author",
    });
  }
});

// GET an author with all their books
app.get("/authors/:id/books", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid author ID",
    });
  }

  try {
    const author = await Author.findByPk(
      Number(req.params.id),
      {
        include: [
          {
            model: Book,
            as: "books",
            required: false,
          },
        ],
        order: [
          [
            { model: Book, as: "books" },
            "id",
            "ASC",
          ],
        ],
      }
    );

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    res.status(200).json(author);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch author's books",
    });
  }
});

// POST create a member
app.post("/members", async (req, res) => {
  const { name, email } = req.body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 100
  ) {
    return res.status(400).json({
      message: "Valid member name is required (max 100 characters)",
    });
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.trim().length > 255
  ) {
    return res.status(400).json({
      message: "Valid email is required",
    });
  }

  try {
    const member = await Member.create({
      name: name.trim(),
      email: email.trim(),
    });

    res.status(201).json(member);
  } catch (error) {
    if (databaseErrorCode(error) === "23505") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Failed to create member",
    });
  }
});

// POST borrow a book
app.post("/loans", async (req, res) => {
  const { book_id, member_id } = req.body ?? {};

  if (
    !Number.isSafeInteger(book_id) ||
    book_id <= 0 ||
    !Number.isSafeInteger(member_id) ||
    member_id <= 0
  ) {
    return res.status(400).json({
      message: "Valid book_id and member_id are required",
    });
  }

  try {
    const book = await Book.findByPk(book_id);
    const member = await Member.findByPk(member_id);

    if (!book || !member) {
      return res.status(400).json({
        message: "Book or member does not exist",
      });
    }

    const activeLoan = await Loan.findOne({
      where: {
        book_id,
        returned_at: null,
      },
    });

    if (activeLoan) {
      return res.status(409).json({
        message: "Book is already borrowed",
      });
    }

    const loan = await Loan.create({
      book_id,
      member_id,
    });

    res.status(201).json(loan);
  } catch (error) {
    const code = databaseErrorCode(error);

    // The database unique index also protects concurrent requests.
    if (code === "23505") {
      return res.status(409).json({
        message: "Book is already borrowed",
      });
    }

    if (code === "23503") {
      return res.status(400).json({
        message: "Book or member does not exist",
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Failed to create loan",
    });
  }
});

// PATCH return a borrowed book
app.patch("/loans/:id/return", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid loan ID",
    });
  }

  try {
    const loan = await Loan.findByPk(Number(req.params.id));

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    if (loan.returned_at !== null) {
      return res.status(409).json({
        message: "Book has already been returned",
      });
    }

    const [updated] = await Loan.update(
      {
        returned_at: new Date(),
      },
      {
        where: {
          id: loan.id,
          returned_at: null,
        },
      }
    );

    if (updated === 0) {
      return res.status(409).json({
        message: "Book has already been returned",
      });
    }

    await loan.reload();

    res.status(200).json({
      message: "Book returned successfully",
      loan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to return book",
    });
  }
});

// GET member's loan history
app.get("/members/:id/loans", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid member ID",
    });
  }

  try {
    const member = await Member.findByPk(
      Number(req.params.id),
      {
        include: [
          {
            model: Loan,
            as: "loans",
            include: [
              {
                model: Book,
                as: "book",
                attributes: ["id", "title"],
              },
            ],
          },
        ],
        order: [
          [
            { model: Loan, as: "loans" },
            "loan_date",
            "DESC",
          ],
          [
            { model: Loan, as: "loans" },
            "id",
            "DESC",
          ],
        ],
      }
    );

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.status(200).json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch member loans",
    });
  }
});

// BONUS: GET all active loans
app.get("/loans/active", async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: {
        returned_at: null,
      },
      include: [
        {
          model: Member,
          as: "member",
          attributes: ["id", "name"],
        },
        {
          model: Book,
          as: "book",
          attributes: ["id", "title"],
        },
      ],
      order: [["id", "ASC"]],
    });

    res.status(200).json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch active loans",
    });
  }
});

// Start server after successful database authentication
async function startServer() {
  const connected = await testDatabaseConnection();

  if (!connected) {
    process.exitCode = 1;
    await sequelize.close();
    return;
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
