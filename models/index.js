
import Book from "./Book.js";
import Author from "./Author.js";
import Member from "./Member.js";
import Loan from "./Loan.js";

// ========================================
// ONE-TO-MANY: AUTHOR AND BOOKS
// ========================================

// One author can write many books.
Author.hasMany(Book, {
  foreignKey: "author_id",
  as: "books",
});

// Each book belongs to one author.
Book.belongsTo(Author, {
  foreignKey: "author_id",
  as: "author",
});

// ========================================
// ONE-TO-MANY: MEMBER AND LOANS
// ========================================

// One member can have many loans.
Member.hasMany(Loan, {
  foreignKey: "member_id",
  as: "loans",
});

// Each loan belongs to one member.
Loan.belongsTo(Member, {
  foreignKey: "member_id",
  as: "member",
});

// ========================================
// ONE-TO-MANY: BOOK AND LOANS
// ========================================

// One book can have many loan records.
Book.hasMany(Loan, {
  foreignKey: "book_id",
  as: "loans",
});

// Each loan belongs to one book.
Loan.belongsTo(Book, {
  foreignKey: "book_id",
  as: "book",
});

// ========================================
// MANY-TO-MANY: MEMBERS AND BOOKS
// ========================================

// Members can borrow many books.
Member.belongsToMany(Book, {
  through: {
    model: Loan,
    unique: false,
  },
  foreignKey: "member_id",
  otherKey: "book_id",
  as: "borrowedBooks",
});

// Books can be borrowed by many members.
Book.belongsToMany(Member, {
  through: {
    model: Loan,
    unique: false,
  },
  foreignKey: "book_id",
  otherKey: "member_id",
  as: "borrowers",
});

// ========================================
// EXPORT MODELS
// ========================================

export {
  Book,
  Author,
  Member,
  Loan,
};
