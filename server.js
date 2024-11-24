const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// Store messages in-memory for simplicity
let messages = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Registration route
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  // Store the user info in memory or a database in production
  req.session.user = { username, password };
  res.redirect(`/dashboard/${username}`);
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // For simplicity, checking from session storage (You'd check a database here)
  if (req.session.user && req.session.user.username === username && req.session.user.password === password) {
    return res.redirect(`/dashboard/${username}`);
  }
  res.render('login', { error: 'Invalid credentials' });
});

// Dashboard route
app.get('/dashboard/:username', (req, res) => {
  const { username } = req.params;
  res.render('dashboard', { username });
});

// Send message route
app.get('/send', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Ensure the user is logged in
  }

  const username = req.session.user.username;
  res.render('send', { username, messages });
});

app.post('/send-message', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Ensure the user is logged in
  }

  const { username } = req.session.user;
  const { message } = req.body;

  const messageObj = {
    username: username,
    text: message,
    time: new Date().toLocaleString() // Add timestamp for when the message was sent
  };

  messages.push(messageObj);
  res.redirect('/send');
});

// Static files (e.g. styles)
app.use(express.static('public'));

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
