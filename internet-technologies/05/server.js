const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let books = [
    {id: 1, title: 'Master and Margarite', author: 'Булгаков', year: 1967, available: true},
    { id: 2, title: 'Преступление и наказание', author: 'Достоевский', year: 1866, available: false },
    { id: 3, title: 'Война и мир',           author: 'Толстой',  year: 1869, available: true  },
    { id: 4, title: '1984',                  author: 'Оруэлл',   year: 1949, available: true  },
    { id: 5, title: 'Скотный двор',          author: 'Оруэлл',   year: 1945, available: false },
    { id: 6, title: 'Гарри Поттер',          author: 'Роулинг',  year: 1997, available: true  },
];

let nextId = 7;

app.get('/api/info', (req, res) =>{
    res.json({
        name: 'Books API',
        version: 1,
        items: books.length
    });
} );

app.get('/api/books', (req, res)=>{
    let result = books;

    if (req.query.author){
        const author = String(req.query.author).toLowerCase();
        result = result.filter(b=> b.author.toLowerCase().includes(author));
    }

    if(req.query.available !== undefined){
        const available = req.query. available === 'true';
        result = result.filter(b => b.available === available);
    }

    res.json(result);
});

app.get('/get/books/:id', (req, res)=>{
    const id = Number(req.params.id);
    const book = books.find(b=> b.id === id);

    if(!book){
        return res.status(404).json({error:'Not found'});
    }
    res.json(book);
});

app.post('/api/books', (req, res) => {
  const title = String(req.body.title ?? '').trim();
  const author = String(req.body.author ?? '').trim();
  const year = Number(req.body.year);
  const available = Boolean(req.body.available ?? true);

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

  const book = {
    id: nextId++,
    title,
    author,
    year,
    available
  };

  books.push(book);
  res.status(201).json(book);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});