const express = require('express');
// const passport = require('passport');
// const passportLocal = require('passport-local');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const expressSession = require('express-session');
const methodOverride = require('method-override');
const console = require('console');
const mongoose = require('mongoose');

// Webserver configuration
const port = process.env.PORT || 8000;

// Application configuration
const app = express();
console.log('Created webserver...');

// Content type
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session stuff
// app.use(cookieParser());
// app.use(expressSession({ secret: 'secret!', resave: false, saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());

// Miscellaneous details
app.use(express.static(__dirname + '/dist'));
app.use(methodOverride());
console.log('Loaded plugins...');

// Database initialization
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/scibowl', { useMongoClient: true });

// Direct API requests to server router
const routes = require('./server/routes');
app.use('/api', routes);

// Route all other requests to the Angular frontend
app.get('*', (req, res) => res.sendFile('./dist/index.html'));
console.log("Bound routes...");

// Start the server
console.log('Starting server on port ' + port);
app.listen(port);
