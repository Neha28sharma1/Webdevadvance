const express = require("express");
const cors = require("cors");
const model = require("./model.js"); // Call the model.js file
const app = express();
const port = 3000;

// Middleware set up
app.use(cors());
app.use(express.json());

// Grade 3: REST API ROUTE
app.get("/api/venues", async (req, res) => {
  try {
    // Bring the data from the database using the function defined in model.js
    const venues = await model.getAllVenues();

    // Send the data as a JSON response to the frontend
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve venues data" });
  }
});

// Before starting the server, set up the database and seed data (stores.json)
model.setupDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
  });
});
