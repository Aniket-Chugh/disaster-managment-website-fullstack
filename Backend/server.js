const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Aniket12@540",
    database: "user_database",
});

conn.connect(function (err) {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to the database");
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/users", (req, res) => {
    let query = "SELECT * FROM signup_data";
    conn.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching data:", err);
            res.status(500).send("Error fetching data from the database.");
            return;
        }
        res.json(result);
    });
});

const saltRounds = 5;

app.post("/users", (req, res) => {
    const id = uuidv4(); // Generate a unique ID
    const { phone, name, email, password } = req.body;

    if (!phone || !name || !email || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            console.error("Error generating salt:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                console.error("Error hashing password:", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            const query = "INSERT INTO signup_data (id, phone_num, username, email, pass) VALUES (?, ?, ?, ?, ?)";
            conn.query(query, [id, phone, name, email, hash], (err, result) => {
                if (err) {
                    console.error("Error inserting data:", err);
                    return res.status(500).json({ error: "Database error" });
                }
                res.json({ message: "User added successfully!", id: result.insertId });
            });
        });
    });
});

let port = 3001;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
