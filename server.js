const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// In-memory database (You can replace with a real DB later)
const users = {}; // { username: { password, messages } }
const messages = {}; // { username: [messages] }

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

// Middleware to check if user is logged in
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

  // Hash the password and save the user data
  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = { password: hashedPassword, messages: [] };
  
  // Create a unique URL for the user
  const uniqueLink = `https://say-ya-mind.onrender.com/${username}`;
  res.render("register", { successMessage: `Account created! Share your link: ${uniqueLink}` });
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render("login", { error: "Invalid username or password!" });
  }

  req.session.user = username;
  res.redirect(`/dashboard/${username}`);
});

app.get("/dashboard/:username", checkAuth, (req, res) => {
  const username = req.params.username;
  const userMessages = users[username].messages;
  res.render("dashboard", { username, messages: userMessages });
});

// Endpoint for sending anonymous messages
app.get("/:username", (req, res) => {
  const username = req.params.username;
  if (!users[username]) return res.status(404).send("User not found.");
  res.render("sendMessage", { username });
});

app.post("/:username", (req, res) => {
  const { username } = req.params;
  const { message } = req.body;
  
  if (users[username]) {
    // Store message for the user in the in-memory database
    users[username].messages.push({ from: "Anonymous", text: message });
    res.redirect(`/dashboard/${username}`); // Redirect to dashboard to view messages
  } else {
    res.status(404).send("User not found.");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
