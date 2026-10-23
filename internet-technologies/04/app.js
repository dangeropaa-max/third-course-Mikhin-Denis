const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const LIMIT = 10;

const state = {
    posts: [],
    isLoading: false,
    isSaving: false,
    deletingId: null,
    error: null,
    filter: '',
    editingId: null,
};

const formEl = document.getElementById('post-form');
const formTitleEl = document.getElementById('form-title');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const formErrorEl = document.getElementById('form-error');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

const loadBtn = document.getElementById('load-btn');
const filterInput = document.getElementById('filter-input');
const statusEl = document.getElementById('status');
const postsListEl = document.getElementById('posts-list');

function getFilteredPosts(posts, filter) {
    const query = filter.trim().toLowerCase();
    if (!query) return posts;

    return posts.filter((post) => {
        return (
            post.title.toLowerCase().includes(query) ||
            post.body.toLowerCase().includes(query)
        );
    });
}

function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';

    if (state.deletingId === post.id) {
        card.classList.add('saving');
    }

    const idEl = document.createElement('div');
    idEl.className = 'post-id';
    idEl.textContent = '#' + post.id;

    const titleEl = document.createElement('h3');
    titleEl.textContent = post.title;

    const bodyEl = document.createElement('p');
    bodyEl.className = 'post-body';
    bodyEl.textContent = post.body;

    const actionsEl = document.createElement('div');
    actionsEl.className = 'post-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary';
    editBtn.textContent = 'Редактировать';
    editBtn.addEventListener('click', () => startEdit(post));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => deletePost(post.id));

    actionsEl.append(editBtn, deleteBtn);
    card.append(idEl, titleEl, bodyEl, actionsEl);
    return card;
}

function renderPosts(posts) {
    postsListEl.innerHTML = '';

    if (posts.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-message';
        empty.textContent = 'Публикации не найдены.';
        postsListEl.appendChild(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    posts.forEach((post) => fragment.appendChild(createPostCard(post)));
    postsListEl.appendChild(fragment);
}


function render() {
    if (state.isLoading) {
        statusEl.className = 'status loading';
        statusEl.textContent = 'Загрузка...';
        postsListEl.innerHTML = '';
        loadBtn.disabled = true;
        filterInput.disabled = true;
        return;
    }

    if (state.error) {
        statusEl.className = 'status error';
        statusEl.textContent = 'Ошибка: ' + state.error;
        postsListEl.innerHTML = '';
        loadBtn.disabled = false;
        filterInput.disabled = state.posts.length === 0;
        return;
    }

    statusEl.className = 'status';
    statusEl.textContent = '';
    loadBtn.disabled = false;
    filterInput.disabled = state.posts.length === 0;

    if (state.editingId === null) {
        formTitleEl.textContent = 'Новая публикация';
        submitBtn.textContent = state.isSaving ? 'Сохранение...' : 'Сохранить';
        cancelBtn.hidden = true;
    } else {
        formTitleEl.textContent = 'Редактирование #' + state.editingId;
        submitBtn.textContent = state.isSaving ? 'Сохранение...' : 'Сохранить изменения';
        cancelBtn.hidden = false;
    }

    submitBtn.disabled = state.isSaving;
    cancelBtn.disabled = state.isSaving;

    const filtered = getFilteredPosts(state.posts, state.filter);
    renderPosts(filtered);
}

async function loadPosts() {
    state.isLoading = true;
    state.error = null;
    render();

    try {
        const response = await fetch(`${API_URL}?_limit=${LIMIT}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        state.posts = await response.json();
        state.isLoading = false;
    } catch (error) {
        state.isLoading = false;
        state.error = error.message || 'Не удалось загрузить публикации';
        console.error(error);
    }

    render();
}

async function createPost(data) {
    state.isSaving = true;
    formErrorEl.textContent = '';
    render();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const created = await response.json();
        state.posts.unshift(created);
        resetForm();
    } catch (error) {
        formErrorEl.textContent = 'Не удалось сохранить: ' + error.message;
        console.error(error);
    } finally {
        state.isSaving = false;
        render();
    }
}

async function updatePost(id, data) {
    state.isSaving = true;
    formErrorEl.textContent = '';
    render();

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const updated = await response.json();

        state.posts = state.posts.map((post) =>
            post.id === id ? { ...post, ...updated } : post
        );

        resetForm();
    } catch (error) {
        formErrorEl.textContent = 'Не удалось обновить: ' + error.message;
        console.error(error);
    } finally {
        state.isSaving = false;
        render();
    }
}

async function deletePost(id) {
    state.deletingId = id;
    render();

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        state.posts = state.posts.filter((post) => post.id !== id);
    } catch (error) {
        statusEl.className = 'status error';
        statusEl.textContent = 'Не удалось удалить: ' + error.message;
        console.error(error);
    } finally {
        state.deletingId = null;
        render();
    }
}

function startEdit(post) {
    state.editingId = post.id;
    titleInput.value = post.title;
    bodyInput.value = post.body;
    formErrorEl.textContent = '';
    render();
    titleInput.focus();
}

function resetForm() {
    state.editingId = null;
    formEl.reset();
    formErrorEl.textContent = '';
    render();
}

formEl.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
        formErrorEl.textContent = 'Заполните заголовок и текст.';
        return;
    }

    if (state.isSaving) return;

    const data = { title, body };

    if (state.editingId === null) {
        createPost(data);
    } else {
        updatePost(state.editingId, data);
    }
});

cancelBtn.addEventListener('click', resetForm);

loadBtn.addEventListener('click', loadPosts);

filterInput.addEventListener('input', (event) => {
    state.filter = event.target.value;
    render();
});

render();
loadPosts();