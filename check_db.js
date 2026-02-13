const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'forolaliga.db');
const db = new sqlite3.Database(dbPath);

console.log('--- USER TABLE DATA DUMP ---');
db.all('SELECT id, username, bio, banner_url FROM users', [], (err, rows) => {
    if (err) {
        console.error('Error reading database:', err.message);
    } else {
        console.table(rows);
    }
    db.close();
});
