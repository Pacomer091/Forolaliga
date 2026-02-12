const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('chatMessage', (msg) => {
        const { room, username, content } = msg;

        const sql = 'INSERT INTO messages (room, username, content) VALUES (?, ?, ?)';
        const params = [room, username, content];

        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                return;
            }

            // Get favorite team for the user to send back with the message
            db.get('SELECT favorite_team FROM users WHERE username = ?', [username], (err, row) => {
                const messageData = {
                    id: this.lastID,
                    room,
                    username,
                    content,
                    created_at: new Date().toISOString(),
                    favorite_team: row ? row.favorite_team : null
                };

                // Broadcast to everyone in the room
                io.to(room).emit('message', messageData);
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

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

    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = 'INSERT INTO users (username, password, favorite_team) VALUES (?, ?, ?)';
    const params = [username, hashedPassword, favoriteTeam || null];

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

    const sql = 'SELECT * FROM users WHERE username = ?';
    const params = [username];

    db.get(sql, params, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordIsValid = bcrypt.compareSync(password, row.password);
        if (!passwordIsValid) {
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
// Send message endpoint (Legacy - kept for compatibility/fallback if needed, but Socket.io is preferred)
app.post('/api/messages', (req, res) => {
    // ... existing logic ...
    const { room, username, content } = req.body;
    // ...
    // We can still save via HTTP but we should refrain from using it for real-time
    // Ideally this endpoint would also emit to socket.io to keep clients in sync if mixed usage occurred

    // For this refactor, we are moving fully to socket.io for sending messages in the frontend
    // leaving this here just in case, or we can remove it. Let's redirect to socket logic in frontend.

    // Actually, let's keep it but also emit the socket event so HTTP posts also update real-time clients
    if (!room || !username || !content) {
        return res.status(400).json({ error: 'Room, username, and content are required' });
    }

    const sql = 'INSERT INTO messages (room, username, content) VALUES (?, ?, ?)';
    const params = [room, username, content];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        db.get('SELECT favorite_team FROM users WHERE username = ?', [username], (err, row) => {
            const messageData = {
                message: 'Message sent successfully',
                id: this.lastID,
                room,
                username,
                content,
                created_at: new Date().toISOString(),
                favorite_team: row ? row.favorite_team : null
            };

            // Emit to room
            io.to(room).emit('message', messageData);
            res.json(messageData);
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
    const search = req.query.search;

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
    if (search) {
        conditions.push('t.title LIKE ?');
        params.push(`%${search}%`);
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

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
