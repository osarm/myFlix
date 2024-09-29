const express = require('express');
const mongoose = require('mongoose');
const Models = require('./models.js');
const morgan = require('morgan');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

// mongoose.connect('mongodb://localhost:27017/TestFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

const app = express();

app.use(morgan('common'));

const { check, validationResult } = require('express-validator');

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'https://movies-fx-6586d0468f8f.herokuapp.com'];

app.use(cors({
    origin: (origin, callback) => {
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
        let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
        return callback(new Error(message ), false);
      }
      return callback(null, true);
    }
  }));

let auth = require('./auth.js')(app);
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('./passport');
const bcrypt = require('bcrypt');

// READ
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

//CREATE
//Add a user
app.post('/users',
    // Validation logic here for request
    //you can either use a chain of methods like .not().isEmpty()
    //which means "opposite of isEmpty" in plain english "is not empty"
    //or use .isLength({min: 5}) which means
    //minimum value of 5 characters are only allowed
    [
      check('Username', 'Username is required').isLength({min: 5}),
      check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {
  
    // check the validation object for errors
      let errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
  
      let hashedPassword = Users.hashPassword(req.body.Password);
      await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
        .then((user) => {
          if (user) {
            //If the user is found, send a response that it already exists
            return res.status(400).send(req.body.Username + ' already exists');
          } else {
            Users
              .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
              })
              .then((user) => { res.status(201).json(user) })
              .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
              });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
    });

// UPDATE
// A user's info, by username
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
[
    check('Username', 'Username must be at least 5 characters').optional().isLength({ min: 5 }),
    check('Username', 'Username must only contain alphanumeric characters').optional().isAlphanumeric(),
    check('Password', 'Password cannot be empty').optional().not().isEmpty(),
    check('Email', 'Email must be valid').optional().isEmail()
],
 async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
      // CONDITION TO CHECK ADDED HERE
      if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
      }
      // CONDITION ENDS
    let updatedData = req.body;
    if (req.body.Password) {
        updatedData.Password = Users.hashPassword(req.body.Password);  // Rehash password if updated
    }

    await Users.findOneAndUpdate( { Username: req.params.Username },
        {
          $set: {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          },
        },
        { new: true }
      )
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// UPDATE
// Add a movie to a user's list of favorites
app.patch('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), [
    check('MovieID', 'Movie ID must be a valid MongoDB ObjectId').isMongoId()
], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// DELETE
// Delete a movie from a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), [
    check('MovieID', 'Movie ID must be a valid MongoDB ObjectId').isMongoId()
],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// DELETE
// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {

    await Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(404).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ
app.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), [
    check('title', 'Title is required and should be a string').isString().not().isEmpty()
],
 async (req, res) => {
    const title = req.params.title;
    const movie = await Movies.findOne({ Title: title });

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send('Movie not found');
    }

});

// READ
app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false}), [
    check('genreName', 'Genre name is required and must be a string').isString().not().isEmpty()
], 
async (req, res) => {
    try {
        const genreName = req.params.genreName;
        const movie = await Movies.findOne({ 'Genre.Name': genreName });

        if (movie) {
            res.status(200).json(movie.Genre);
        } else {
            res.status(404).send('No such genre found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// READ
app.get('/movies/directors/:directorName', passport.authenticate('jwt', {session: false}), [
    check('directorName', 'Director name is required and must be a string').isString().not().isEmpty()
],
 async (req, res) => {
    try {
        const directorName = req.params.directorName;
        const movie = await Movies.findOne({ 'Director.Name': directorName });

        if (movie) {
            res.status(200).json(movie.Director);
        } else {
            res.status(404).send('No such director');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

//READ
app.get('/users', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//READ
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), [
    check('Username', 'Username is required and must be alphanumeric').isAlphanumeric()
],
 async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Middleware for serving static files from the public directory
app.use(express.static('public'));

// Error-handling middleware called when an error occurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server and allows others access
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});