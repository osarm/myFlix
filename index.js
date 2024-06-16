const express = require ("express")
morgan = require('morgan');

const app = express();

let topMovies = [
    {
        title: 'Wall E',
        director: 'Andrew Stanton'
    },
    {
        title: 'Scott Pilgrim vs. the World',
        director: 'Edgar Wright'
    },
    {
        title: 'Always Be My Maybe',
        director: 'Nahnatchka Khan'
    },
    {
        title: 'One Piece Film: Red',
        director: 'Gorō Taniguchi'
    },
    {
        title: 'Jujutsu Kaisen 0: The Movie',
        director: 'Park Seong-hu'
    },
    {
        title: 'Train to Busan',
        director: 'Yeon Sang-ho'
    },
    {
        title: 'Self Reliance',
        director: 'Jake Johnson'
    },
    {
        title: 'Spirited Away',
        director: 'Hayao Miyazaki'
    },
    {
        title: 'Nope',
        director: 'Jordan Peele'
    },
    {
        title: 'Hole',
        director: 'Andrew Davis'
    },
];

//Express static function
app.use(express.static('public'));

//Middleware
app.use(morgan('common'));

//GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname });
});
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

//error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is wrong!');
});

//listens for incoming requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
