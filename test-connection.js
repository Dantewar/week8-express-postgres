
import sequelize from "./sequelize.js";

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

testDatabaseConnection();
