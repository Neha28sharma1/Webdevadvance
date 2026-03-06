const express = require("express");
const cors = require("cors");
const model = require("./model.js"); // Call the model.js file
const app = express();
const port = 3000;
const path = require("path");
const backend = __dirname; // Get the current directory of the backend folder

//cookies management
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const SECRET = "mySecretCookieToken";
const sessions = {};

app.use(cookieParser(SECRET));

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the "public" directory

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

//function to check if the user is logged in by checking the presence of the authToken cookie

function checkAuth(req, res, next) {
  const token = req.signedCookies.authToken;

  if (token && sessions[token]) {
    next();
  } else {
    res.status(403).send("Login required");
  }
}

app.get("/api/auth", (req, res) => {
  const token = req.signedCookies.authToken;

  if (token && sessions[token]) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

///route to handle user login and create a session cookie

app.post("/login", express.urlencoded({ extended: true }), (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    const token = crypto.randomBytes(64).toString("hex");

    sessions[token] = { username };

    res.cookie("authToken", token, {
      signed: true,
      httpOnly: true,
    });

    res.redirect("/");
  } else {
    res.status(401).send("Invalid login");
  }
});

//route to handle user logout and clear the session cookie
app.get("/logout", (req, res) => {
  const token = req.signedCookies.authToken;

  if (token) {
    delete sessions[token];
  }

  res.clearCookie("authToken");

  res.redirect("/");
});

////////Backend routes to delete, add, and update data from frontend///////

//to add a new venue to the database from frontend form and check auth as well before allowing the user to add a new venue
app.post("/api/venues", checkAuth, async (req, res) => {
  const { name, url, district } = req.body;
  try {
    await model.addVenue(name, url, district);
    res.status(201).json({ message: "Venue added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add venue" });
  }
});

//to delete a venue from the database using the delete button on the frontend and check auth as well before allowing the user to delete a venue
app.delete("/api/venues/:id", checkAuth, async (req, res) => {
  const venueId = req.params.id;
  try {
    await model.deleteVenue(venueId);
    res.status(200).json({ message: "Venue deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete venue" });
  }
});

//to update a venue in the database using the edit button on the frontend and check auth as well before allowing the user to update a venue
app.put("/api/venues/:id", checkAuth, async (req, res) => {
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
