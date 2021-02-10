require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// require database configuration
require('./configs/db.config');

// session configuration
const session = require('express-session');
// session store using mongo
const MongoStore = require('connect-mongo')(session)

//const mongoose = require('./db/index');

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
        saveUninitialized: false,
        //Forces the session to be saved back to the session store, 
        // even if the session was never modified during the request.
        resave: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    })
)

// passport configuration
const User = require('./models/User.model');

const bcrypt = require('bcrypt');

// we serialize only the `_id` field of the user to keep the information stored minimum
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// when we need the information for the user, the deserializeUser function is called with the id that we previously serialized to fetch the user from the database
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(dbUser => {
      done(null, dbUser);
    })
    .catch(err => {
      done(err);
    });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    // login
    User.findOne({ username: username })
      .then(userFromDB => {
        if (userFromDB === null) {
          // there is no user with this username
          done(null, false, { message: 'Wrong Credentials' });
        } else if (!bcrypt.compareSync(password, userFromDB.password)) {
          // the password is not matching
          done(null, false, { message: 'Wrong Credentials' });
        } else {
          // the userFromDB should now be logged in
          done(null, userFromDB)
        }
      })
      .catch(err => {
        console.log(err);
      })
  })
)

app.use(passport.initialize());
app.use(passport.session());

// end of passport

// Middleware Setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Express View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

const index = require('./routes/index.routes');
app.use('/', index);

const auth = require('./routes/auth.routes');
app.use('/', auth);




module.exports = app;
