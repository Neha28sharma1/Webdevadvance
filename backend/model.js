const { Client } = require("pg");
const fs = require("fs");

// Setup PostgreSQL client
const client = new Client({
  host: "host.docker.internal", /// allows the backend container to connect to services running on the host machine
  port: 5432,
  user: "postgres",
  password: "dasha",
  database: "postgres",
});

// Setup database and seed data (stores.json)
async function setupDatabase() {
  try {
    await client.connect();
    await client.query(`DROP TABLE IF EXISTS venues;`);

    // Create venues table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(255),
        district VARCHAR(100),

        -- Add more columns (grade 5 requirement)
        
        phone VARCHAR(20),
        rating DECIMAL(2,1),
        opening_hours VARCHAR(100)
      );
    `);

    // Prevent duplicate entries by creating a unique index on the name column
    // VARCHAR is about how many characters will be stored in the column
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
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
          "INSERT INTO venues (name, url, district, phone, rating, opening_hours) VALUES ($1, $2, $3, $4, $5, $6)",
          [
            store.name,
            store.url,
            store.district,

            store.phone,
            store.rating,
            store.opening_hours,
          ],
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

/////////////functions to add, delete and update venues in the database/////////

//to add a new venue to the database from frontend form
async function addVenue(name, url, district, phone, rating, opening_hours) {
  const res = await client.query(
    "INSERT INTO venues (name, url, district, phone, rating, opening_hours) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [name, url, district, phone, rating, opening_hours],
  );
  return res.rows[0];
}

//to delete a venue from the database using the delete button on the frontend
async function deleteVenue(id) {
  await client.query("DELETE FROM venues WHERE id = $1", [id]);
}

//to update a venue in the database using the edit button on the frontend
async function updateVenue(
  id,
  name,
  url,
  district,
  phone,
  rating,
  opening_hours,
) {
  const res = await client.query(
    "UPDATE venues SET name = $1, url = $2, district = $3, phone = $4, rating = $5, opening_hours = $6 WHERE id = $7 RETURNING *",
    [name, url, district, phone, rating, opening_hours, id],
  );
  return res.rows[0];
}

// Add user registration function
async function registerUser(name, email, password) {
  const res = await client.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password],
  );
  return res.rows[0];
}

async function getUserByEmail(email) {
  const res = await client.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return res.rows[0];
}

// Export functions for use in server.js
module.exports = {
  setupDatabase,
  getAllVenues,
  addVenue,
  deleteVenue,
  updateVenue,

  registerUser,
  getUserByEmail,
};
