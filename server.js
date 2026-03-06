const express = require("express");
const cors = require("cors");
const model = require("./model.js"); // Call the model.js file
const app = express();
const port = 3000;

//cookies management
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const SECRET = "mySecretCookieToken";
const sessions = {};

app.use(cookieParser(SECRET));

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

//function to check if the user is logged in by checking the presence of the authToken cookie

function checkAuth(req, res, next) {
  const token = req.signedCookies.authToken;

  if (token && sessions[token] && sessions[token].role === "admin") {
    next(); // Pass control to see if the user is admin
  } else {
    res.status(403).send("Admin access required");
  }
}

app.get("/api/auth", (req, res) => {
  const token = req.signedCookies.authToken;

  if (token && sessions[token]) {
    res.json({
      loggedIn: true,
      role: sessions[token].role, // Tell whether the user is admin or regular user to control the frontend UI accordingly
    });
  } else {
    res.json({
      loggedIn: false,
      role: null,
    });
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
    const updatedVenue = await model.updateVenue(venueId, name, url, district);
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

////////Signup user registration///////
// Route to handle user login
app.post(
  "/signup",
  express.urlencoded({ extended: true }),
  async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match. Please try again.");
    }

    try {
      // Also check if the email already exists in the database to prevent duplicate registrations
      const existingUser = await model.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).send("Email already exists. Please log in.");
      }

      // Register the user in the database using the function defined in model.js
      await model.registerUser(name, email, password);

      // After successful registration, redirect the user to the login page or home page
      res.redirect("/login.html");
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).send("Failed to sign up");
    }
  },
);

app.post("/login", express.urlencoded({ extended: true }), async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check the hardcoded admin credentials first
    if (email === "admin@jkpgcity.se" && password === "password") {
      const token = crypto.randomBytes(64).toString("hex");
      sessions[token] = { email: "admin@jkpgcity.se", role: "admin" };

      res.cookie("authToken", token, {
        signed: true,
        httpOnly: true,
      });
      return res.redirect("/"); // Main page redirect
    }

    // 2. Regular user check (Search by email in the database)
    const user = await model.getUserByEmail(email);

    if (user && user.password === password) {
      const token = crypto.randomBytes(64).toString("hex");

      // Save the session with user information
      sessions[token] = {
        username: user.name,
        email: user.email,
        role: "user",
      };

      res.cookie("authToken", token, {
        signed: true,
        httpOnly: true,
      });
      return res.redirect("/");
    }

    // If either admin or regular user authentication fails, send an error response
    res.status(401).send("Invalid email or password");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error during login");
  }
});
