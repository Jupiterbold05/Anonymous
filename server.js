const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

const users = {}; // Store users in-memory (consider using a database)
const messages = {}; // Store messages for each user

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Home Route
app.get("/", (req, res) => {
  res.render("index");
});

// Register Route
app.get("/register", (req, res) => {
  res.render("register", {
    error: null,
    successMessage: null,
  });
});

// Handle Registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (users[username]) {
    return res.render("register", {
      error: "Username already exists!",
      successMessage: null,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = { password: hashedPassword };
  messages[username] = [];

  res.render("register", {
    error: null,
    successMessage: `Registration successful! Share your link: https://say-ya-mind.onrender.com/send/${username}`,
  });
});

// Login Route
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Handle Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!users[username]) {
    return res.render("login", { error: "User not found!" });
  }

  const user = users[username];
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.render("login", { error: "Invalid password!" });
  }

  res.redirect(`/dashboard/${username}`);
});

// Dashboard Route
app.get("/dashboard/:username", (req, res) => {
  const { username } = req.params;
  const userMessages = messages[username];
  res.render("dashboard", {
    username,
    messages: userMessages || [],
  });
});

// Send Anonymous Message Route
app.post("/send/:username", (req, res) => {
  const { username } = req.params;

  if (!users[username]) {
    return res.status(404).send("User not found");
  }

  const { message } = req.body;
  const timeSent = new Date().toLocaleString(); // Get the current time

  // Store message with timestamp
  messages[username].push({ message, timeSent });

  res.send("Thank you! Your message has been sent.");
});

// Logout Route
app.get("/logout", (req, res) => {
  res.redirect("/");
});

// Start Server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
