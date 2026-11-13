const state = {
    books: [],
    isLoading: false,
    error: null,
};

const formEl = document.getElementById('book-form');
const titleInput = document.getElementById('title-input');
const authorInput = document.getElementById('author-input');
const yearInput = document.getElementById('year-input');
const formErrorEl = document.getElementById('form-error');

const reloadBtn = document.getElementById('reload-btn');
const statusEl = document.getElementById('status');
const booksListEl = document.getElementById('books-list');

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        let message = 'HTTP ' + response.status;
        try {
            const data = await response.json();
            message = data.error || message;
        } catch {
            
        }
        throw new Error(message);
    }

    if (response.status === 204) {
        return null;  
    }

    return response.json();
}

function createBookCard(book) {
    const card = document.createElement('article');
    card.className = 'book-card';

    const idEl = document.createElement('div');
    idEl.className = 'book-id';
    idEl.textContent = '#' + book.id;

    const titleEl = document.createElement('h3');
    titleEl.textContent = book.title;   // ← textContent, не innerHTML!

    const authorEl = document.createElement('p');
    authorEl.className = 'book-meta';
    authorEl.textContent = book.author;

    const yearEl = document.createElement('p');
    yearEl.className = 'book-meta';
    yearEl.textContent = 'Год: ' + book.year;

    const statusBadge = document.createElement('p');
    statusBadge.className = 'book-status ' + (book.available ? 'available' : 'unavailable');
    statusBadge.textContent = book.available ? 'Доступна' : 'Недоступна';

    const actionsEl = document.createElement('div');
    actionsEl.className = 'book-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-secondary';
    toggleBtn.textContent = book.available ? 'Сделать недоступной' : 'Сделать доступной';
    toggleBtn.addEventListener('click', () => toggleAvailability(book));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => deleteBook(book));

    actionsEl.append(toggleBtn, deleteBtn);
    card.append(idEl, titleEl, authorEl, yearEl, statusBadge, actionsEl);
    return card;
}

function render() {
    if (state.isLoading) {
        statusEl.className = 'status';
        statusEl.textContent = 'Загрузка...';
        booksListEl.innerHTML = '';
        return;
    }

    if (state.error) {
        statusEl.className = 'status error';
        statusEl.textContent = state.error;
        booksListEl.innerHTML = '';
        return;
    }

    statusEl.className = 'status';
    statusEl.textContent = '';

    booksListEl.innerHTML = '';

    if (state.books.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-message';
        empty.textContent = 'Список пуст. Добавьте первую книгу.';
        booksListEl.appendChild(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    state.books.forEach(b => fragment.appendChild(createBookCard(b)));
    booksListEl.appendChild(fragment);
}

async function loadBooks() {
    state.isLoading = true;
    state.error = null;
    render();

    try {
        state.books = await request('/api/books');
        state.isLoading = false;
    } catch (error) {
        state.isLoading = false;
        state.error = 'Не удалось загрузить: ' + error.message;
    }

    render();
}

async function createBook(data) {
    await request('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    await loadBooks();  
}
async function toggleAvailability(book) {
    try {
        await request('/api/books/' + book.id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ available: !book.available }),
        });
        await loadBooks();
    } catch (error) {
        statusEl.className = 'status error';
        statusEl.textContent = 'Не удалось изменить: ' + error.message;
    }
}

async function deleteBook(book) {
    if (!confirm('Удалить книгу «' + book.title + '»?')) return;

    try {
        await request('/api/books/' + book.id, { method: 'DELETE' });
        await loadBooks();
    } catch (error) {
        statusEl.className = 'status error';
        statusEl.textContent = 'Не удалось удалить: ' + error.message;
    }
}

formEl.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const year = Number(yearInput.value);

    formErrorEl.textContent = '';

    if (!title || !author) {
        formErrorEl.textContent = 'Заполните название и автора.';
        return;
    }

    if (!Number.isInteger(year) || year < 0 || year > new Date().getFullYear()) {
        formErrorEl.textContent = 'Введите корректный год.';
        return;
    }

    try {
        await createBook({ title, author, year });
        formEl.reset();
    } catch (error) {
        formErrorEl.textContent = error.message;
    }
});

reloadBtn.addEventListener('click', loadBooks);

loadBooks();