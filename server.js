const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '.')));

// Test endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Foro LaLiga API is running' });
});

// Register endpoint
app.post('/api/register', (req, res) => {
    const { username, password, favoriteTeam } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const sql = 'INSERT INTO users (username, password, favorite_team) VALUES (?, ?, ?)';
    const params = [username, password, favoriteTeam || null];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'User registered successfully',
            userId: this.lastID,
            user: { username, favoriteTeam }
        });
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const params = [username, password];

    db.get(sql, params, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json({
            message: 'Login successful',
            user: {
                id: row.id,
                username: row.username,
                favoriteTeam: row.favorite_team
            }
        });
    });
});

// Send message endpoint
app.post('/api/messages', (req, res) => {
    const { room, username, content } = req.body;

    if (!room || !username || !content) {
        return res.status(400).json({ error: 'Room, username, and content are required' });
    }

    const sql = 'INSERT INTO messages (room, username, content) VALUES (?, ?, ?)';
    const params = [room, username, content];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Message sent successfully',
            id: this.lastID,
            room,
            username,
            content,
            created_at: new Date().toISOString()
        });
    });
});

// Get messages for a room (with user's favorite team)
app.get('/api/messages/:room', (req, res) => {
    const room = req.params.room;
    const sql = `
        SELECT m.*, u.favorite_team 
        FROM messages m 
        LEFT JOIN users u ON m.username = u.username 
        WHERE m.room = ? 
        ORDER BY m.created_at ASC 
        LIMIT 100
    `;

    db.all(sql, [room], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Create a new topic
app.post('/api/topics', (req, res) => {
    const { title, content, category, team, username } = req.body;

    if (!title || !content || !category || !username) {
        return res.status(400).json({ error: 'Title, content, category, and username are required' });
    }

    const sql = 'INSERT INTO topics (title, content, category, team, username) VALUES (?, ?, ?, ?, ?)';
    const params = [title, content, category, team || null, username];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Topic created successfully',
            id: this.lastID,
            title,
            content,
            category,
            team,
            username,
            views: 0,
            replies: 0,
            created_at: new Date().toISOString()
        });
    });
});

// Get all topics (with optional category filter and user's favorite team)
app.get('/api/topics', (req, res) => {
    const category = req.query.category;
    const team = req.query.team;

    let sql = `
        SELECT t.*, u.favorite_team as author_favorite_team 
        FROM topics t 
        LEFT JOIN users u ON t.username = u.username
    `;
    let params = [];
    let conditions = [];

    if (category) {
        conditions.push('t.category = ?');
        params.push(category);
    }
    if (team) {
        conditions.push('t.team = ?');
        params.push(team);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY t.created_at DESC LIMIT 50';

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get a single topic by ID (with user's favorite team)
app.get('/api/topics/:id', (req, res) => {
    const id = req.params.id;

    // Increment view count
    db.run('UPDATE topics SET views = views + 1 WHERE id = ?', [id]);

    const sql = `
        SELECT t.*, u.favorite_team as author_favorite_team 
        FROM topics t 
        LEFT JOIN users u ON t.username = u.username 
        WHERE t.id = ?
    `;
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        res.json(row);
    });
});

// Get replies for a topic (with user's favorite team)
app.get('/api/topics/:id/replies', (req, res) => {
    const topicId = req.params.id;
    const sql = `
        SELECT r.*, u.favorite_team 
        FROM replies r 
        LEFT JOIN users u ON r.username = u.username 
        WHERE r.topic_id = ? 
        ORDER BY r.created_at ASC
    `;

    db.all(sql, [topicId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Create a reply
app.post('/api/replies', (req, res) => {
    const { topicId, username, content } = req.body;

    if (!topicId || !username || !content) {
        return res.status(400).json({ error: 'Topic ID, username, and content are required' });
    }

    const sql = 'INSERT INTO replies (topic_id, username, content) VALUES (?, ?, ?)';
    const params = [topicId, username, content];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Increment replies count on the topic
        db.run('UPDATE topics SET replies = replies + 1 WHERE id = ?', [topicId]);

        res.json({
            message: 'Reply created successfully',
            id: this.lastID,
            topic_id: topicId,
            username,
            content,
            created_at: new Date().toISOString()
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
