const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

// Simulated database
const users = {};
const messages = {};

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Routes

// Home Page
app.get("/", (req, res) => {
  res.render("index");
});

// Register Page
app.get("/register", (req, res) => {
  res.render("register", { error: null, successMessage: null });
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
    successMessage: `Registration successful! Share your link: https://your-app-domain.com/send/${username}`,
  });
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Handle Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render("login", { error: "Invalid username or password!" });
  }

  req.session.user = username;
  res.redirect(`/dashboard/${username}`);
});

// Dashboard Page
app.get("/dashboard/:username", (req, res) => {
  const { username } = req.params;

  if (req.session.user !== username) {
    return res.redirect("/login");
  }

  res.render("dashboard", { username, messages: messages[username] });
});

// Anonymous Message Page
app.get("/send/:username", (req, res) => {
  const { username } = req.params;

  if (!users[username]) {
    return res.status(404).send("User not found");
  }

  res.render("sendMessage", { username });
});

// Handle Anonymous Message
app.post("/send/:username", (req, res) => {
  const { username } = req.params;

  if (!users[username]) {
    return res.status(404).send("User not found");
  }

  const { message } = req.body;
  messages[username].push(message);

  res.send("Thank you! Your message has been sent.");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
