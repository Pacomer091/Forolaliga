const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'forolaliga.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            favorite_team TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            bio TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating users table: ' + err.message);
            } else {
                console.log('Users table created or already exists.');

                // Migration: Add columns one by one
                db.run("ALTER TABLE users ADD COLUMN created_at DATETIME", (err) => {
                    if (!err) {
                        console.log("Added created_at column to users table.");
                        // Backfill existing rows
                        db.run("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL");
                    } else if (!err.message.includes("duplicate column name")) {
                        console.error("Error adding created_at column:", err.message);
                    }
                });

                db.run("ALTER TABLE users ADD COLUMN bio TEXT", (err) => {
                    if (!err) {
                        console.log("Added bio column to users table.");
                    } else if (!err.message.includes("duplicate column name")) {
                        console.error("Error adding bio column:", err.message);
                    }
                });

                db.run("ALTER TABLE users ADD COLUMN banner_url TEXT", (err) => {
                    if (!err) {
                        console.log("Added banner_url column to users table.");
                    } else if (!err.message.includes("duplicate column name")) {
                        console.error("Error adding banner_url column:", err.message);
                    }
                });

                db.run("ALTER TABLE users ADD COLUMN location TEXT", (err) => {
                    if (!err) {
                        console.log("Added location column to users table.");
                    } else if (!err.message.includes("duplicate column name")) {
                        console.error("Error adding location column:", err.message);
                    }
                });

                db.run("ALTER TABLE users ADD COLUMN twitter_url TEXT", (err) => {
                    if (!err) {
                        console.log("Added twitter_url column to users table.");
                    } else if (!err.message.includes("duplicate column name")) {
                        console.error("Error adding twitter_url column:", err.message);
                    }
                });

                db.run("ALTER TABLE users ADD COLUMN instagram_url TEXT", (err) => {
                    if (!err) {
                        console.log("Added instagram_url column to users table.");
                    } else if (!err.message.includes("duplicate column name")) {
                        console.error("Error adding instagram_url column:", err.message);
                    }
                });
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room TEXT NOT NULL,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating messages table: ' + err.message);
            } else {
                console.log('Messages table created or already exists.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL,
            team TEXT,
            username TEXT NOT NULL,
            views INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating topics table: ' + err.message);
            } else {
                console.log('Topics table created or already exists.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS replies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (topic_id) REFERENCES topics(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating replies table: ' + err.message);
            } else {
                console.log('Replies table created or already exists.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS reactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_type TEXT NOT NULL, -- 'topic' or 'reply'
            target_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            emoji TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(target_type, target_id, username, emoji)
        )`, (err) => {
            if (err) {
                console.error('Error creating reactions table: ' + err.message);
            } else {
                console.log('Reactions table created or already exists.');
            }
        });
    }
});

module.exports = db;
