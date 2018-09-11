const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const expressSession = require('express-session');
const methodOverride = require('method-override');
const console = require('console');
const mongoose = require('mongoose');

const models = require("./server/models");


// Web server configuration
const port = process.env.PORT || 8000;

// Application configuration
const app = express();
console.log('Created web server...');

// Content type
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
console.log("Set up server communication...");

// Session stuff
app.use(cookieParser());
app.use(expressSession({ secret: 'secret!', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
console.log("Initialized authentication...");

// Authentication
passport.use(models.User.createStrategy());
passport.serializeUser(models.User.serializeUser());
passport.deserializeUser(models.User.deserializeUser());
console.log("Loaded user models...");

// Miscellaneous details
app.use(express.static(__dirname + '/dist'));
app.use(methodOverride());
console.log('Loaded plugins...');

// Database initialization
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/scibowl');
console.log("Connected to database...");

// Direct API requests to server router
const routes = require('./server/routes');
app.use('/api', routes);

// Route all other requests to the Angular frontend
app.get('*', (req, res) => res.sendFile(__dirname + '/dist/index.html'));
console.log("Bound routes...");

// Test database.
const tests = require("./server/tests");
tests();

// Start the server
console.log('Starting server on port ' + port);
app.listen(port);
