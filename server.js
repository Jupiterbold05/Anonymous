const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set secure to true for HTTPS
}));

// Serve static files (e.g., CSS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Routes

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
  // Store the user info or save to a database
  // For now, let's pretend the registration is successful and redirect to login
  res.redirect('/login');
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // For demonstration purposes, the username and password are hardcoded
  if (username === 'testUser' && password === 'password123') {
    req.session.user = { username }; // Store user data in session
    return res.redirect(`/dashboard/${username}`);
  } else {
    return res.render('login', { error: 'Invalid username or password' });
  }
});

// Dashboard route (only accessible after login)
app.get('/dashboard/:username', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not logged in
  }

  const username = req.params.username;
  res.render('dashboard', { username });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
