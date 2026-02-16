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

    const sql = 'INSERT INTO users (username, password, favorite_team, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)';
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
                favoriteTeam: row.favorite_team,
                created_at: row.created_at,
                bio: row.bio,
                location: row.location
            }
        });
    });
});

// Get User Profile
app.get('/api/users/:username', (req, res) => {
    const username = req.params.username;
    console.log(`[API] Fetching profile for username: "${username}"`);

    db.get('SELECT username, favorite_team, created_at, bio, banner_url, location, twitter_url, instagram_url FROM users WHERE username = ? COLLATE NOCASE', [username], (err, userRow) => {
        if (err) {
            console.error(`[API] Database error fetching profile for "${username}":`, err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!userRow) {
            console.warn(`[API] Profile not found for username: "${username}"`);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Get message counts
        db.get('SELECT COUNT(*) as topicsCount FROM topics WHERE username = ? COLLATE NOCASE', [username], (err, topicRow) => {
            db.get('SELECT COUNT(*) as repliesCount FROM replies WHERE username = ? COLLATE NOCASE', [username], (err, replyRow) => {
                res.json({
                    username: userRow.username,
                    favorite_team: userRow.favorite_team,
                    created_at: userRow.created_at,
                    bio: userRow.bio,
                    banner_url: userRow.banner_url,
                    location: userRow.location,
                    twitter_url: userRow.twitter_url,
                    instagram_url: userRow.instagram_url,
                    message_count: (topicRow ? topicRow.topicsCount : 0) + (replyRow ? replyRow.repliesCount : 0)
                });
            });
        });
    });
});

// Update User Profile (Bio)
app.put('/api/users/profile', (req, res) => {
    const { username, bio, banner_url, location, twitter_url, instagram_url } = req.body;

    // Simple verification (in a real app, use tokens)
    if (!username) {
        return res.status(400).json({ error: 'Username required' });
    }

    if (bio && bio.length > 50) {
        return res.status(400).json({ error: 'Bio must be 50 characters or less' });
    }

    db.run('UPDATE users SET bio = ?, banner_url = ?, location = ?, twitter_url = ?, instagram_url = ? WHERE username = ? COLLATE NOCASE', [bio, banner_url || null, location || null, twitter_url || null, instagram_url || null, username], function (err) {
        if (err) {
            console.error(`[API] DB Error updating profile for ${username}:`, err.message);
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found or no changes made' });
        }

        res.json({
            message: 'Profile updated successfully',
            bio,
            banner_url,
            location,
            twitter_url,
            instagram_url
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

// --- REACTIONS API ---
app.post('/api/reactions/toggle', (req, res) => {
    const { targetType, targetId, username, emoji } = req.body;

    if (!targetType || !targetId || !username || !emoji) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if it already exists
    db.get('SELECT id FROM reactions WHERE target_type = ? AND target_id = ? AND username = ? COLLATE NOCASE AND emoji = ?',
        [targetType, targetId, username, emoji], (err, row) => {
            if (err) {
                console.error('[API] Error checking reaction:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                // Remove it
                db.run('DELETE FROM reactions WHERE id = ?', [row.id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    io.emit('reactionUpdated', { targetType, targetId }); // Notify all to refresh
                    res.json({ status: 'removed' });
                });
            } else {
                // Add it
                db.run('INSERT INTO reactions (target_type, target_id, username, emoji) VALUES (?, ?, ?, ?)',
                    [targetType, targetId, username, emoji], function (err) {
                        if (err) {
                            if (err.message.includes('UNIQUE constraint failed')) {
                                return res.json({ status: 'already_exists' });
                            }
                            console.error('[API] Error inserting reaction:', err.message);
                            return res.status(500).json({ error: err.message });
                        }
                        io.emit('reactionUpdated', { targetType, targetId }); // Notify all to refresh
                        res.json({ status: 'added' });
                    });
            }
        });
});

app.get('/api/reactions/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const currentUser = req.query.username;

    const sql = 'SELECT emoji, COUNT(*) as count FROM reactions WHERE target_type = ? AND target_id = ? GROUP BY emoji';

    db.all(sql, [type, id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        if (currentUser) {
            db.all('SELECT emoji FROM reactions WHERE target_type = ? AND target_id = ? AND username = ? COLLATE NOCASE',
                [type, id, currentUser], (err, userReactions) => {
                    const reactedEmojis = (userReactions || []).map(r => r.emoji);
                    res.json({ counts: rows, userReactions: reactedEmojis });
                });
        } else {
            res.json({ counts: rows });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

