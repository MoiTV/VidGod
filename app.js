const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const app = express();
// load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// passport Config
require('./config/passport')(passport);

// DB config
const db = require('./config/database');


// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// connect to mongoose
mongoose
    .connect(db.mongoURI, {
        useNewUrlParser: true
    })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// handlebar middle ware 
app.engine(
    'handlebars',
    exphbs({
        defaultLayout: 'main'
    })
);
app.set('view engine', 'handlebars');

// body-parser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// method override middleware
app.use(methodOverride('_method'));

// express session middleware
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// express flash
app.use(flash());

// Global varibles
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Index Route
app.get('/', (req, res) => {
    const title = 'Welcome';
    res.render('index', {
        title: title
    });
});

// About Route
app.get('/about', (req, res) => {
    res.render('about');
});

// user routes
app.use('/ideas', ideas);

app.use('/users', users);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
});