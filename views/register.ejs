const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Set up body-parser and view engine
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Register route
app.get('/register', (req, res) => {
  res.render('register');
});

// Register POST route
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    // Pass error message to the view
    return res.render('register', { error: 'Please fill out both fields' });
  }
  // Registration logic here (e.g., save user to DB)
  res.redirect('/login');
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

// Login POST route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== 'user' || password !== 'password') {
    return res.render('login', { error: 'Invalid username or password' });
  }
  // Successful login
  res.redirect('/dashboard');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Listen on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
