const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// connect to mongoose
mongoose
    .connect('mongodb://localhost/vidjod-dev', {
        useNewUrlParser: true
    })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// handlebar middle ware
app.engine(
    'handlebars',
    exphbs({
        defaultLayout: 'main'
    })
);
app.set('view engine', 'handlebars');

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

// express flash
app.use(flash());

// Global varibles
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

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

// Add ideas form
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});

// edit idea form
app.get('/ideas/edit/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    }).then(idea => {
        res.render('ideas/edit', {
            idea: idea
        });
    });
});

// idea index page
app.get('/ideas', (req, res) => {
    Idea.find({})
        .sort({ data: 'desc' })
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        });
});

// Process form
app.post('/ideas', (req, res) => {
    let errors = [];

    if (!req.body.title) {
        errors.push({ text: 'Please add a title' });
    }
    if (!req.body.details) {
        errors.push({ text: 'Please add some details' });
    }

    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details
        };
        new Idea(newUser).save().then(idea => {
            req.flash('success_msg', 'Video idea added');
            res.redirect('/ideas');
        });
    }
});

// edit form process
app.put('/ideas/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    }).then(idea => {
        // new values
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save().then(idea => {
            req.flash('success_msg', 'Video idea updated');
            res.redirect('/ideas');
        });
    });
});

// delete form process
app.delete('/ideas/:id', (req, res) => {
    Idea.remove({
        _id: req.params.id
    }).then(() => {
        req.flash('success_msg', 'Video idea removed');
        res.redirect('/ideas');
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
});