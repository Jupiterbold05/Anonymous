const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User'); // Assuming you have a User model

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session setup
app.use(session({
  secret: 'your_secret_key', // Secret key for session encryption
  resave: false,
  saveUninitialized: true,
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sayyamind', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register.ejs', { error: 'Username already exists' });
    }

    // Create a new user
    const user = new User({ username, password });
    await user.save();

    // Redirect to login page after successful registration
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('register.ejs', { error: 'An error occurred. Please try again.' });
  }
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.render('login.ejs', { error: 'Invalid username or password' });
    }

    // Store user information in the session
    req.session.user = user;

    // Redirect to the dashboard after successful login
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('login.ejs', { error: 'An error occurred. Please try again.' });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('dashboard.ejs', { user: req.session.user });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
