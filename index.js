
import express from "express";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Library API",
  });
});

// Get all books with filtering and sorting
app.get("/books", async (req, res) => {
  const { genre, sort } = req.query;
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

  try {
    let query = "SELECT * FROM books";
    const values = [];

    if (genre !== undefined) {
      query += " WHERE genre = $1";
      values.push(genre);
    }

    if (sort) {
      query += ` ORDER BY ${sort}`;
    } else {
      query += " ORDER BY id";
    }

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch books",
    });
  }
});

// Get one book by ID
app.get("/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM books WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch book",
    });
  }
});

// Create a book
app.post("/books", async (req, res) => {
  const { title, genre, published_year } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO books (title, genre, published_year)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), genre ?? null, published_year ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create book",
    });
  }
});

// Update a complete book
app.put("/books/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, genre, published_year } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE books
       SET title = $1, genre = $2, published_year = $3
       WHERE id = $4
       RETURNING *`,
      [title.trim(), genre ?? null, published_year ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update book",
    });
  }
});

// Partially update a book
app.patch("/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
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

  const allowedFields = ["title", "genre", "published_year"];
  const fields = Object.keys(body);

  if (fields.some((field) => !allowedFields.includes(field))) {
    return res.status(400).json({
      message: "Invalid book field",
    });
  }

  const { title, genre, published_year } = body;

  if (
    (title !== undefined &&
      (typeof title !== "string" || !title.trim())) ||
    (genre !== undefined &&
      genre !== null &&
      typeof genre !== "string") ||
    (published_year !== undefined &&
      published_year !== null &&
      (!Number.isInteger(published_year)))
  ) {
    return res.status(400).json({
      message: "Invalid book data",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE books
       SET
         title = COALESCE($1, title),
         genre = COALESCE($2, genre),
         published_year = COALESCE($3, published_year)
       WHERE id = $4
       RETURNING *`,
      [
        title === undefined ? null : title.trim(),
        genre ?? null,
        published_year ?? null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to partially update book",
    });
  }
});

// Delete a book
app.delete("/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  try {
    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book deleted successfully",
      book: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete book",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
