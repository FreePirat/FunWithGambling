const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "Jake",
    password: "NBCC123",
    database: "GAMBLINGJS",
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to database.");
});

// Registration Endpoint
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    const userCheckQuery = "SELECT * FROM users WHERE username = ?";
    db.query(userCheckQuery, [username], async (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Hash the password and save the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(insertQuery, [username, hashedPassword], (err, results) => {
            if (err) throw err;
            res.status(200).json({ message: "User registered successfully." });
        });
    });
});

// Login Endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const userQuery = "SELECT * FROM users WHERE username = ?";
    db.query(userQuery, [username], async (err, results) => {
        if (results.length === 0) {
            return res.status(400).json({ message: "User not found." });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        res.status(200).json({ message: "Login successful!" });
    });
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});