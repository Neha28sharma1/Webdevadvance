const { Client } = require("pg");
const fs = require("fs");

// Setup PostgreSQL client
const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "dasha",
  database: "postgres",
});

// Setup database and seed data (stores.json)
async function setupDatabase() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL database");

    // Create venues table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(255),
        district VARCHAR(100)
      );
    `);

    // Check if the venues table is empty
    const checkData = await client.query("SELECT COUNT(*) FROM venues");

    // If empty, read from stores.json and insert data into the database
    if (checkData.rows[0].count === "0") {
      console.log("Data is empty. Seeding data from stores.json.");
      const rawData = fs.readFileSync("stores.json", "utf8");
      const stores = JSON.parse(rawData);

      for (let store of stores) {
        await client.query(
          "INSERT INTO venues (name, url, district) VALUES ($1, $2, $3)",
          [store.name, store.url, store.district],
        );
      }
      console.log("Success");
    } else {
      console.log("Data already exists. Skipping seeding.");
    }
  } catch (err) {
    console.error("Setting error", err.stack);
  }
}

// Get all venues from the database
async function getAllVenues() {
  try {
    const res = await client.query("SELECT * FROM venues ORDER BY id ASC");
    return res.rows;
  } catch (err) {
    console.error("Data retrieval error", err.stack);
    throw err;
  }
}

// Export functions for use in server.js
module.exports = {
  setupDatabase,
  getAllVenues,
};
