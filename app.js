// Framework
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// Set up storage configuration and specify a unique name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Initialise the multer middleware with the storage config
const upload = multer({ storage: storage });

// Create MySQL connection
const connection = mysql.createConnection({
    //host: 'localhost',
    //user: 'root',
    //password: '',
    //database: 'movieboxapp' 
    host: 'db4free.net',
    user: 'usernamee_created_for_db4free.net',
    password: 'password_created_for_'
});

// Connect to database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// Enable static files
app.use(express.static('public'));

// Enable form processing
app.use(express.urlencoded({ extended: false }));

// Routing for CRUD operations
app.get("/", (req, res) => {
    // Formulate the SQL
    const sql = "SELECT * FROM movies"; 

    // Fetch the data
    connection.query(sql, (error, results) => {
        if (error) {
            console.error("Database query error: ", error.message);
            return res.status(500).send("Error retrieving movies"); 
        }
        // No error
        res.render('index', { movies: results }); 
    });
});

// Display one movie
app.get("/movie/:id", (req, res) => { 
    const movieId = req.params.id; 
    const sql = "SELECT * FROM movies WHERE movieId=?"; 
    const sql2 = "SELECT * FROM reviews WHERE movieId=?";
    

    connection.query(sql, [movieId], (error, movieResults) => {
        if (error) {
            console.error("Database error: ", error.message);
            return res.status(500).send("Error retrieving movie by id"); 
        }
        // No error
        // if (results.length > 0) {
        //     res.render('movie', { movie: results[0] }); 
        // } else {
        //     res.render('movie', { movie: null });
        // }
        connection.query(sql2, [movieId], (error, reviewResults) => {
            if (error) {
                console.error("Database error: ", error.message);
                return res.status(500).send("Error retrieving review by id"); 
            }
            // No error
            if (movieResults.length > 0) {
                res.render('movie', { 
                    movie: movieResults[0],
                    review: reviewResults });
            } else {
                res.render('movie', { 
                    movie: null,
                    review: null
                 });
            }
        });
    });
    });

// movie codes//////////////////////////////////////

// Add movie
app.get("/addMovie", (req, res) => {
    res.render("addMovie");
});

app.post("/addMovie", upload.single('image'), (req, res) => { 
    const { name, description } = req.body; // Changed from 'name, quantity, price'
    let image;
    if (req.file) {
        image = req.file.filename;
    } else {
        image = "noImage.png";
    }
    const sql = "INSERT INTO `movies` (`name`,`description`, `image`) VALUES (?, ?, ?)"; 

    connection.query(sql, [name, description, image], (error, results) => { 
        if (error) {
            console.error("Error adding movie: ", error.message);
            return res.status(500).send("Error adding movie");
        } else {
            res.redirect('/');
        }
    });
});

// Edit movie
app.get('/editMovie/:id', (req, res) => { 
    const movieId = req.params.id; 
    const sql = 'SELECT * FROM movies WHERE movieId = ?'; 

    connection.query(sql, [movieId], (error, results) => {
        if (error) {
            console.error("Database error: ", error.message);
            return res.status(500).send("Error retrieving movie by ID"); 
        }
        // Check if movie is found
        if (results.length > 0) {
            res.render('editMovie', { movie: results[0] }); 
        } else {
            res.status(404).send('Movie not found'); 
        }
    });
});

app.post("/editMovie/:id", upload.single('image'), (req, res) => { 
    const movieId = req.params.id;
    const { name, description } = req.body;
    let image = req.body.currentImage;
    if (req.file) {
        image = req.file.filename;
    } else {
        image = "noImage.png";
    }
    const sql = "UPDATE movies SET name=?, description=?, image=? WHERE movieId=?";
    
    connection.query(sql, [name, description, image, movieId], (error, results) => {
        if (error) {
            console.error("Error updating movie: ", error.message);
            return res.status(500).send("Error updating movie");
        } else {
            res.redirect('/');
        }
    });
});

// Delete movie
app.get('/deleteMovie/:id', (req, res) => { 
    const movieId = req.params.id; 
    const sql = 'DELETE FROM movies WHERE movieId = ?'; 

    connection.query(sql, [movieId], (error, results) => { 
        if (error) {
            console.error("Error deleting movie: ", error.message);
            return res.status(500).send("Error deleting movie"); 
        } else {
            res.redirect('/');
        }
    });
});


// Review codes///////////////////////////////////////////

//editing
app.get('/editReview/:id', (req, res) => {
    const reviewId = req.params.id;
    const sql = 'SELECT * FROM reviews WHERE reviewId = ?';

    connection.query(sql, [reviewId], (error, results) => {
        if (error) {
            console.error("Database error: ", error.message);
            return res.status(500).send("Error retrieving review by ID");
        }
        // Check if review is found
        if (results.length > 0) {
            res.render('editReview', { review: results[0] });
        } else {
            res.status(404).send('Review not found');
        }
    });
});

// Update review
app.post('/editReview/:id', (req, res) => {
    const reviewId = req.params.id;
    const { accountName, rating, review } = req.body;

    const sql = "UPDATE reviews SET accountName=?, rating=?, review=? WHERE reviewId=?";

    connection.query(sql, [accountName, rating, review, reviewId], (error, results) => {
        if (error) {
            console.error("Error updating review: ", error.message);
            return res.status(500).send("Error updating review");
        } else {
            res.redirect('/');
        }
    });
});

// Add review

app.get('/addReview/:id', (req, res) => {
    const movieId = req.params.id;
    res.render('addReview', { movieId });
});


// post review
app.post("/addReview", (req, res) => {
    const { movieId, accountName, rating, review } = req.body;

    const sql = "INSERT INTO reviews (movieId, accountName, rating, review) VALUES (?, ?, ?, ?)";

    connection.query(sql, [movieId, accountName, rating, review], (error, results) => {
        if (error) {
            console.error("Error adding review: ", error.message);
            return res.status(500).send("Error adding review");
        } else {
            res.redirect('/');
        }
    });
});


// Delete review
app.get('/deleteReview/:id', (req, res) => { 
    const reviewId = req.params.id; 
    const sql = 'DELETE FROM reviews WHERE reviewId = ?'; 

    connection.query(sql, [reviewId], (error, results) => { 
        if (error) {
            console.error("Error deleting review: ", error.message);
            return res.status(500).send("Error deleting review"); 
        } else {
            res.redirect('/');
        }
    });
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
