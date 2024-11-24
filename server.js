const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();

const users = {}; // Store users in-memory (consider using a database)
const messages = {}; // Store messages for each user

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Configure session middleware
app.use(
  session({
    secret: 'your_secret_key', // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Middleware to check if user is logged in
const checkAuth = (req, res, next) => {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Home Route
app.get('/home', (req, res) => {
  res.render('home');
});

// Index Route
app.get('/', (req, res) => {
  res.render('index');
});

// Register Route
app.get('/register', (req, res) => {
  res.render('register', {
    error: null,
    successMessage: null,
  });
});

// Handle Registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (users[username]) {
    return res.render('register', {
      error: 'Username already exists!',
      successMessage: null,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = { password: hashedPassword };
  messages[username] = [];

  res.render('register', {
    error: null,
    successMessage: `Registration successful! Share your link: https://say-ya-mind.onrender.com/send/${username}`,
  });
});

// Login Route
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!users[username]) {
    return res.render('login', { error: 'User not found!' });
  }

  const user = users[username];
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.render('login', { error: 'Invalid password!' });
  }

  req.session.username = username; // Set session
  res.redirect('/home'); // Redirect to the home page after successful login
});

// Dashboard Route
app.get('/dashboard/:username', checkAuth, (req, res) => {
  const { username } = req.params;
  const userMessages = messages[username];
  res.render('dashboard', {
    username,
    messages: userMessages || [], // Ensure messages are passed to the view
  });
});

// Send Anonymous Message Route
app.get('/send/:username', (req, res) => {
  const { username } = req.params;

  if (!users[username]) {
    return res.status(404).send('User not found');
  }

  res.render('send', { username });
});

// Handle Sending Anonymous Messages
app.post('/send/:username', (req, res) => {
  const { username } = req.params;

  if (!users[username]) {
    return res.status(404).send('User not found');
  }

  const { message } = req.body;

  // Validate message
  if (!message || message.trim() === '') {
    return res.status(400).send('Message cannot be empty!');
  }

  const timeSent = new Date().toLocaleString(); // Get the current time

  // Store message with timestamp
  messages[username].push({ message, timeSent });

  // Respond dynamically
  res.render('send', { username, success: 'Message sent successfully!' });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(); // Destroy session
  res.redirect('/');
});

// Start Server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
  
