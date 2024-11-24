const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session middleware
app.use(session({
  secret: 'secretKey', // You can change this to a more secure key
  resave: false,
  saveUninitialized: true
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for users (for simplicity)
let users = [];
let currentUser = null;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('register', { error: 'Please fill out all fields.' });
  }
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.render('register', { error: 'Username already exists.' });
  }
  // Add the user to the "database"
  users.push({ username, password });
  res.render('register', { successMessage: 'Registration successful! You can now login.' });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    req.session.user = user;
    currentUser = user;
    res.redirect(`/dashboard/${username}`);
  } else {
    res.render('login', { error: 'Invalid credentials. Please try again.' });
  }
});

// Send message route
app.get('/send/:username', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const { username } = req.params;
  if (req.session.user.username !== username) {
    return res.redirect('/login');
  }
  res.render('send', { username });
});

// Dashboard route
app.get('/dashboard/:username', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const { username } = req.params;
  if (req.session.user.username !== username) {
    return res.redirect('/login');
  }
  res.render('dashboard', { username, messages: [] }); // For now, no messages are stored
});

// Handle messages
app.post('/send-message', (req, res) => {
  const { message, username } = req.body;
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if (req.session.user.username !== username) {
    return res.redirect('/login');
  }
  // Simulate storing the message (in memory for now)
  // You can extend this logic to store messages in a database
  const userMessages = req.session.user.messages || [];
  userMessages.push({ message, time: new Date().toLocaleTimeString() });
  req.session.user.messages = userMessages;

  res.redirect(`/dashboard/${username}`);
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.redirect('/');
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
