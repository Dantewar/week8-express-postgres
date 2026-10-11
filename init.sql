
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    genre VARCHAR(50),
    published_year INT
);

INSERT INTO books (title, genre, published_year)
VALUES
    ('The Hobbit', 'fantasy', 1937),
    ('1984', 'dystopian', 1949),
    ('Pippi Longstocking', 'children', 1945),
    ('The Hunger Games', 'dystopian', 2008);

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO authors (name)
VALUES
    ('J.R.R. Tolkien'),
    ('George Orwell'),
    ('Astrid Lindgren'),
    ('Suzanne Collins');

ALTER TABLE books
ADD COLUMN author_id INT REFERENCES authors(id);

UPDATE books
SET author_id = (
    SELECT id FROM authors
    WHERE name = 'J.R.R. Tolkien'
)
WHERE title = 'The Hobbit';

UPDATE books
SET author_id = (
    SELECT id FROM authors
    WHERE name = 'George Orwell'
)
WHERE title = '1984';

UPDATE books
SET author_id = (
    SELECT id FROM authors
    WHERE name = 'Astrid Lindgren'
)
WHERE title = 'Pippi Longstocking';

UPDATE books
SET author_id = (
    SELECT id FROM authors
    WHERE name = 'Suzanne Collins'
)
WHERE title = 'The Hunger Games';

SELECT
    books.id,
    books.title,
    authors.name AS author
FROM books
JOIN authors ON books.author_id = authors.id
ORDER BY books.id;
