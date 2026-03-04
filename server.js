const express = require("express");
const cors = require("cors");
const model = require("./model.js"); // Call the model.js file
const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use("/", express.static("public")); // Serve static files from the "public" directory

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

////////Backend routes to delete, add, and update data from frontend///////

//to add a new venue to the database from frontend form
app.post("/api/venues", async (req, res) => {
  const { name, url, district } = req.body;
  try {
    await model.addVenue(name, url, district);
    res.status(201).json({ message: "Venue added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add venue" });
  }
});

//to delete a venue from the database using the delete button on the frontend
app.delete("/api/venues/:id", async (req, res) => {
  const venueId = req.params.id;
  try {
    await model.deleteVenue(venueId);
    res.status(200).json({ message: "Venue deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete venue" });
  }
});

//to update a venue in the database using the edit button on the frontend
app.put("/api/venues/:id", async (req, res) => {
  const venueId = req.params.id;
  const { name, url, district } = req.body;
  try {
    await model.updateVenue(venueId, name, url, district);
    console.log("Updated result:", updatedVenue);
    res.status(200).json({ message: "Venue updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update venue" });
  }
});

// Before starting the server, set up the database and seed data (stores.json)
model.setupDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
  });
});
