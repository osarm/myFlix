const express = require("express");
const morgan = require('morgan');
const uuid = require("uuid");
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

let users = [
    {
        id:1,
        name: "Oscar",
        favoriteMovies: ["Everything Everywhere All at Once"],
    },
    {
        id:2,
        name: "Patrick",
        favoriteMovies: []
    },
];

let topMovies = [
    {
        Title: "Everything Everywhere All at Once",
        Description: "A Chinese immigrant woman goes through an adventure in which she is able to explore different universes and connect with other versions of herself.",
        Director: {
            name: "Daniels: Daniel Kwan and Daniel Scheinert",
            bio: "The duo started off directing and writing music videos and then later ventured into film, they have won a total of three Oscars.",
            birth: "Daniel Kwan: February 10, 1988 and Daniel Scheinert: June 7, 1987",
        }, 
        Genre: {
            name: "Action, Adventure, Comedy",
        },
        ImageURL: "https://example.com/everything-everywhere-all-at-once.jpg",
        Featured: "false",
    },
    {
        Title: "Scott Pilgrim vs. the World",
        Description: "Based in Toronto, Canada, a young man must defeat his new girlfriend's seven evil exes in order to win her heart.",
        Director: {
            name: "Edgar Wright",
            bio: "Edgar is an English director, screenwriter, producer, and actor known for working on Shaun of the Dead. He has been nominated for four BAFTA awards.",
            birth: "April 18, 1974",
        }, 
        Genre: {
            name: "Action, Comedy, Fantasy",
        },
        ImageURL: "https://example.com/scott-pilgrim-vs-the-world.jpg",
        Featured: "false",
    },
    {
        Title: "Always Be My Maybe",
        Description: "Maybe? After 15 years apart, Sasha and Marcus meet each other once again, maybe things will be different?",
        Director: {
            name: "Nahnatchka Khan",
            bio: "She is a producer and writer known for her other work on Fresh Off the Boat (2015) and American Dad!(2005). She has been nominated for two Primetime Emmys.",
            birth: "June 17, 1973",
        }, 
        Genre: {
            name: "Romance, Comedy",
        },
        ImageURL: "https://example.com/always-be-my-maybe.jpg",
        Featured: "false",
    },
    {
        Title: "One Piece Film: Red",
        Description: "Uta, a singer who is loved by all on the planet, is now revealing herself to the world. All of her fans, including the Straw Hats, await the performance." ,
        Director: {
            name: "Gorô Taniguchi",
            bio: "Known for his other work on Code Geass and Bloody Escape. Received the 2023 Tokyo Anime Award.",
            birth: "October 18, 1966",
        }, 
        Genre: {
            name: "Animation, Action, Adventure",
        },
        ImageURL: "https://example.com/one-piece-film-red.jpg",
        Featured: "false",
    },
    {
        Title: "Jujutsu Kaisen 0: The Movie",
        Description:"The prequel to the Jujutsu Kaisen series, where a high schooler learns to control a very powerful cursed spirit and enrolls in a school for Jujutsu Sorcerers.", 
        Director: {
            name: "Sunghoo Park",
            bio: "Known for his other work on the Jujutsu Kaisen anime adaptation and Ninja Kamui. He has been nominated for two Crunchyroll Anime Awards.",
            birth: "N/A",
        }, 
        Genre: {
            name: "Animation, Action, Fantasy",
        },
        ImageURL: "https://example.com/jujutsu-kaisen-0-the-movie.jpg",
        Featured: "false",
    },
    {
        Title: "Train to Busan",
        Description: "There is a zombie virus outbreak in South Korea, how will the passengers survive on the train from Seoul to Busan?",
        Director: {
            name: "Yeon Sang-ho",
            bio: "A South Korean director, and screenwriter who graduated from Sangmyung University. He started directing short films and then set up a production house. He has won 27 awards and been nominated for 28.",
            birth: "December 25, 1978",
        }, 
        Genre: {
            name: "Action, Horror, Thriller",
        },
        ImageURL: "https://example.com/train-to-busan.jpg",
        Featured: "false",
    },
    {
        Title: "Self Reliance",
        Description: "Not sure what to live for, this man is given the opportunity to participate in a reality game show of life or death",
        Director: {
            name: "Jake Johnson",
            bio: "An American Actor, comedian and director, most commonly known for his role in New Girl as Nick Miller. He has won two awards and received 10 nominations.",
            birth: "May 28, 1978",
        }, 
        Genre: {
            name: "Comedy, Thriller",
        },
        ImageURL: "https://example.com/self-reliance.jpg",
        Featured: "false",
    },
    {
        Title: "Spirited Away",
        Description: "A young girl wanders into a world with gods, witches and spirits, and where humans take the forms of beasts.",
        Director: {
            name: "Hayao Miyazaki",
            bio: "Known for being one of the greatest animation directors in Japan. He has won two Oscars with 89 wins and 62 nominations in total.",
            birth: "January 5, 1941",
        }, 
        Genre: {
            name: "Animation, Adventure, Family",
        },
        ImageURL: "https://example.com/spirited-away.jpg",
        Featured: "false",
    },
    {
        Title: "Nope",
        Description: "Located in inland California, the residents of a lonely gulch witness something mysterious and frightening.", 
        Director: {
            name: "Jordan Peele",
            bio: "He is an Oscar- and Emmy-winning director, writer, actor, and producer that founded Monkeypaw Productions. His film. He has won one Oscar with 109 other awards and 153 nominations.",
            birth: "February 21, 1979",
        }, 
        Genre: {
            name: "Horror, Mystery, Sci-Fi",
        },
        ImageURL: "https://example.com/nope.jpg",
        Featured: "false",
    },
    {
        Title: "Holes",
        Description: "Wrongfully convicted of a crime, a boy is sent to a detention camp in the desert where he joins the job of digging holes for some reason.",
        Director: {
            name: "Andrew Davis",
            bio: "A director, producer, and writer known for his work on The Fugitive(1993). He has won one award and received four nominations.",
            birth: "November 21, 1946",
        }, 
        Genre: {
            name: "Adventure",
        },
        ImageURL: "https://example.com/holes.jpg",
        Featured: "false",
    },
];

// CREATE user
app.post("/users", (req, res) => {
    const newUser = req.body;
    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send("Users need names");
    }
});

// CREATE favorite movie for user
app.post("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find((user) => user.id == id);
    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}`);
    } else {
        res.status(400).send("User does not exist");
    }
});

// UPDATE user
app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    let user = users.find((user) => user.id == id);
    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send("User does not exist");
    }
});

// DELETE favorite movie from user
app.delete("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find((user) => user.id == id);
    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(
            (title) => title !== movieTitle
        );
        res.status(200).send(`${movieTitle} has been removed from user ${id}`);
    } else {
        res.status(400).send("No such user exists");
    }
});

// DELETE user
app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    let user = users.find((user) => user.id == id);
    if (user) {
        users = users.filter((user) => user.id != id);
        res.status(200).send(`User ${id} has been removed from the user list`);
    } else {
        res.status(400).send("No such user exists");
    }
});

//Express static function
app.use(express.static('public'));

//Middleware
app.use(morgan('common'));

//GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.get("/users", (req, res) => {
    res.status(200).json(users);
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname });
});
app.get('/movies', (req, res) => {
    res.status(200).json(topMovies);
});

// READ movie by title
app.get("/movies/:title", (req, res) => {
    const { title } = req.params;
    const movie = topMovies.find((movie) => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send("Movie does not exist");
    }
});

// READ genre by name
app.get("/movies/genre/:genreName", (req, res) => {
    const { genreName } = req.params;
    const movie = topMovies.find((movie) => movie.Genre.name === genreName);
    
    if (movie) {
        res.status(200).json(movie.Genre);
    } else {
        res.status(400).send("Genre does not exist");
    }
});

// READ director by name
app.get("/movies/director/:directorName", (req, res) => {
    const { directorName } = req.params;
    const movie = topMovies.find((movie) => movie.Director.name === directorName);

    if (movie) {
        res.status(200).json(movie.Director);
    } else {
        res.status(400).send("Director does not exist");
    }
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
