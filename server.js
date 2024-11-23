const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// In-memory database
const users = {};
const messages = {};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Set EJS as template engine
app.set("view engine", "ejs");

// Middleware to check if a user is logged in
const checkAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/login");
};

// Routes
app.get("/", (req, res) => res.render("index"));
app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (users[username]) return res.render("register", { error: "User already exists!" });
  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = { password: hashedPassword, messages: [] };
  res.redirect("/login");
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render("login", { error: "Invalid username or password!" });
  }
  req.session.user = username;
  res.redirect("/dashboard");
});

app.get("/dashboard", checkAuth, (req, res) => {
  const userMessages = users[req.session.user].messages;
  res.render("dashboard", { username: req.session.user, messages: userMessages });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.post("/send", (req, res) => {
  const { to, message } = req.body;
  if (!users[to]) return res.redirect("/dashboard?error=User does not exist");
  users[to].messages.push({ from: "Anonymous", text: message });
  res.redirect("/dashboard?success=Message sent!");
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
