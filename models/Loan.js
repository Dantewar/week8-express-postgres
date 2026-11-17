
import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Loan = sequelize.define(
  "Loan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    loan_date: {
      type: DataTypes.DATE,
      field: "borrowed_at",
      defaultValue: DataTypes.NOW,
    },

    returned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "loans",
    timestamps: false,
  }
);

export default Loan;
