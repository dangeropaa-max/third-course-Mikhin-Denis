const API_URL = 'https://jsonplaceholder.typicode.com/users';

const state = {
  users: [],
  isLoading: false,
  error: null,
  filter: '',
};

const loadBtn = document.getElementById('load-btn');
const reloadBtn = document.getElementById('reload-btn');
const filterInput = document.getElementById('filter-input');
const statusEl = document.getElementById('status');
const usersListEl = document.getElementById('users-list');
const statsEl = document.getElementById('stats');

function getFilteredUsers(users, filter) {
  const query = filter.trim().toLowerCase();

  if (!query) {
    return users;
  }

  return users.filter((user) => {
    const name = user.name.toLowerCase();
    const username = user.username.toLowerCase();
    const email = user.email.toLowerCase();

    return (
      name.includes(query) ||
      username.includes(query) ||
      email.includes(query)
    );
  });
}

function getUniqueCities(users) {
  const cities = users.map((user) => user.address.city);
  return [...new Set(cities)];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function createUserCard(user) {
  const card = document.createElement('article');
  card.className = 'user-card';

  const name = document.createElement('h3');
  name.textContent = user.name;

  const username = document.createElement('p');
  username.className = 'username';
  username.textContent = '@' + user.username;

  const email = document.createElement('p');
  email.className = 'field';
  email.innerHTML =
    '<span class="field-label">Email</span><br>' + escapeHtml(user.email);

  const city = document.createElement('p');
  city.className = 'field';
  city.innerHTML =
    '<span class="field-label">Город</span><br>' +
    escapeHtml(user.address.city);

  const company = document.createElement('p');
  company.className = 'field';
  company.innerHTML =
    '<span class="field-label">Компания</span><br>' +
    escapeHtml(user.company.name);

  card.append(name, username, email, city, company);
  return card;
}

function renderUsers(users) {
  usersListEl.innerHTML = '';

  if (users.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-message';
    empty.textContent = 'Пользователи не найдены.';
    usersListEl.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  users.forEach((user) => {
    fragment.appendChild(createUserCard(user));
  });
  usersListEl.appendChild(fragment);
}

function renderStats() {
  const total = state.users.length;

  if (total === 0) {
    statsEl.innerHTML = '';
    return;
  }

  const filtered = getFilteredUsers(state.users, state.filter);
  const cities = getUniqueCities(state.users);

  statsEl.innerHTML = '';

  const title = document.createElement('h2');
  title.textContent = 'Статистика';

  const totalP = document.createElement('p');
  totalP.textContent = `Всего пользователей: ${total}`;

  const filteredP = document.createElement('p');
  filteredP.textContent = `Отображается после фильтрации: ${filtered.length}`;

  const citiesP = document.createElement('p');
  citiesP.textContent = `Уникальных городов: ${cities.length}`;

  const citiesList = document.createElement('p');
  citiesList.textContent = 'Города: ' + cities.join(', ');

  statsEl.append(title, totalP, filteredP, citiesP, citiesList);
}

function render() {
  if (state.isLoading) {
    statusEl.className = 'status loading';
    statusEl.textContent = 'Загрузка...';
    usersListEl.innerHTML = '';
    statsEl.innerHTML = '';
    loadBtn.disabled = true;
    reloadBtn.disabled = true;
    filterInput.disabled = true;
    return;
  }

  if (state.error) {
    statusEl.className = 'status error';
    statusEl.textContent = 'Ошибка: ' + state.error;
    usersListEl.innerHTML = '';
    statsEl.innerHTML = '';
    loadBtn.disabled = false;
    reloadBtn.disabled = state.users.length === 0;
    filterInput.disabled = state.users.length === 0;
    return;
  }

  if (state.users.length === 0) {
    statusEl.className = 'status';
    statusEl.textContent = 'Нажмите «Загрузить», чтобы получить данные.';
    usersListEl.innerHTML = '';
    statsEl.innerHTML = '';
    loadBtn.disabled = false;
    reloadBtn.disabled = true;
    filterInput.disabled = true;
    return;
  }

  statusEl.className = 'status';
  statusEl.textContent = '';
  loadBtn.disabled = false;
  reloadBtn.disabled = false;
  filterInput.disabled = false;

  const filtered = getFilteredUsers(state.users, state.filter);
  renderUsers(filtered);
  renderStats();
}


async function loadUsers() {
  state.isLoading = true;
  state.error = null;
  render();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const users = await response.json();
    state.users = users;
    state.isLoading = false;
  } catch (error) {
    state.isLoading = false;
    state.error = error.message || 'Не удалось загрузить данные';
    console.error(error);
  }

  render();
}

loadBtn.addEventListener('click', loadUsers);
reloadBtn.addEventListener('click', loadUsers);

filterInput.addEventListener('input', (event) => {
  state.filter = event.target.value;
  render();
});

render();