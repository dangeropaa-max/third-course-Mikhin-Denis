const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = new Database('data.db');

db.prepare(`
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        year INTEGER NOT NULL,
        available INTEGER NOT NULL DEFAULT 1
    )
`).run();

function toBook(row) {
    return {
        ...row,
        available: Boolean(row.available)
    };
}

app.get('/api/info', (req, res) => {
    const count = db.prepare('SELECT COUNT(*) AS count FROM books').get();
    res.json({
        name: 'Books API',
        version: 2,
        items: count.count
    });
});

app.get('/api/books', (req, res) => {
    let sql = 'SELECT * FROM books';
    const conditions = [];
    const params = [];

    
    if (req.query.author) {
        conditions.push('LOWER(author) LIKE ?');
        params.push('%' + String(req.query.author).toLowerCase() + '%');
    }

    
    if (req.query.available !== undefined) {
        conditions.push('available = ?');
        params.push(req.query.available === 'true' ? 1 : 0);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY id';

    const rows = db.prepare(sql).all(...params);
    res.json(rows.map(toBook));
});

app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM books WHERE id = ?').get(id);

    if (!row) {
        return res.status(404).json({ error: 'Not found' });
    }

    res.json(toBook(row));
});

app.post('/api/books', (req, res) => {
    const title = String(req.body.title ?? '').trim();
    const author = String(req.body.author ?? '').trim();
    const year = Number(req.body.year);
    const available = req.body.available === undefined
        ? true
        : Boolean(req.body.available);

    if (!title || !author) {
        return res.status(400).json({
            error: 'title and author are required'
        });
    }

    if (!Number.isInteger(year) || year < 0 || year > new Date().getFullYear()) {
        return res.status(400).json({
            error: 'year must be a valid number'
        });
    }

    const result = db.prepare(
        'INSERT INTO books (title, author, year, available) VALUES (?, ?, ?, ?)'
    ).run(title, author, year, available ? 1 : 0);

    const created = db.prepare(
        'SELECT * FROM books WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json(toBook(created));
});

app.patch('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);

    const current = db.prepare('SELECT * FROM books WHERE id = ?').get(id);

    if (!current) {
        return res.status(404).json({ error: 'Not found' });
    }

    const title = req.body.title === undefined
        ? current.title
        : String(req.body.title).trim();

    const author = req.body.author === undefined
        ? current.author
        : String(req.body.author).trim();

    const year = req.body.year === undefined
        ? current.year
        : Number(req.body.year);

    const available = req.body.available === undefined
        ? current.available
        : (req.body.available ? 1 : 0);

    if (!title || !author) {
        return res.status(400).json({
            error: 'title and author cannot be empty'
        });
    }

    if (!Number.isInteger(year) || year < 0 || year > new Date().getFullYear()) {
        return res.status(400).json({
            error: 'year must be a valid number'
        });
    }

    db.prepare(
        'UPDATE books SET title = ?, author = ?, year = ?, available = ? WHERE id = ?'
    ).run(title, author, year, available, id);

    const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    res.json(toBook(updated));
});

app.delete('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);

    const result = db.prepare('DELETE FROM books WHERE id = ?').run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Not found' });
    }

    res.status(204).end();
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});