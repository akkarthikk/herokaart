import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    connectionString: 'postgres://hjjzniqp:eYx43GLcFLNibenQB3GqhXZodJwLHx9l@rain.db.elephantsql.com/hjjzniqp',
});

app.use(bodyParser.urlencoded({ extended: true }));

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database', err);
    } else {
        console.log('Connected to the database');

        app.get('/get', (req, res) => {
            db.query('SELECT * FROM users', (err, result) => {
                if (err) {
                    console.error('Error fetching users', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.json(result.rows);
                }
            });
        });

        // Render the form page
        app.get('/', (req, res) => {
            res.render('app.ejs'); 
        });

        // Handle form submission
        app.post('/post', (req, res) => {
            const username = req.body['username'];
            const email = req.body['email'];
            const name = req.body['name'];
            const password = req.body['password'];
            const question = req.body['security_question'];
            const answer = req.body['security_answer'];
          
            try {
                db.query("INSERT INTO users (username, email,name,password,security_question,security_answer) VALUES ($1, $2,$3,$4,$5,$6)", [username, email, name, password, question, answer])
                    .then(result => {
                        res.redirect('/get');
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).send({
                            message: 'Error inserting data into database',
                            error: error.message
                        });
                    });
            } catch (err) {
                console.error(err);
                res.status(500).send({
                    message: 'Error processing request',
                    error: err.message
                });
            }
        });

        app.get('/find', (req, res) => {
            res.render("find.ejs");
        });
        app.post('/find', (req, res) => {
            const email = req.body['email'];
            const answer = req.body['s_answer'];
            db.query("select username,password from users where email=$1 and security_answer=$2", [email,answer], (err, result) => {
                if (err) {
                    console.error("Error executing query:", err);
                    res.status(500).json({ error: "Internal server error" });
                } else {
                    res.json(result.rows);
                }
            });
        })



// Start the Express server
        app.listen(port, () => {
            console.log(`Server is running on port http://localhost:${port}`);
        });
    }
});
