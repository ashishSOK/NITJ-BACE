// Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const dbConnect = require('./lib/dbConnect'); 
require('./lib/passport-config'); // Initialize Passport

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { secure: process.env.NODE_ENV === 'production' }
  })
);
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/sadhana', require('./routes/sadhana'));
app.use('/seva', require('./routes/seva'));
app.use('/rent', require('./routes/rent'));
app.use('/rankings', require('./routes/rankings'));
app.use('/admin', require('./routes/admin'));
app.use('/payments', require('./routes/payments'));

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});


// Connect to DB and start server
const PORT = process.env.PORT || 3000;
dbConnect().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
