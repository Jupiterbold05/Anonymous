const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sample users object for storing users (for simplicity, not using a database)
let users = [];

// Serve static files (e.g., CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Home Route
app.get('/', (req, res) => {
    res.render('index');
});

// Register Route (GET and POST)
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('register', { error: 'Both fields are required' });
    }

    // Store the user data (for demonstration purposes, in a real app, save to DB)
    users.push({ username, password });

    // After successful registration, redirect to login page
    res.redirect('/login');
});

// Login Route (GET and POST)
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { error: 'Both fields are required' });
    }

    // Check if user exists
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.render('login', { error: 'Invalid username or password' });
    }

    // If login successful, redirect to dashboard
    res.redirect('/dashboard');
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
