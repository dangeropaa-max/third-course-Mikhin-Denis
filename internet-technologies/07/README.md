# 1.
    npm install
    npm start

# 2.
    07/
    ├── server.js           Express + SQLite 
    ├── package.json
    ├── package-lock.json
    ├── .gitignore
    ├── data.db             создаётся при запуске
    ├── public/
    │   ├── index.html      страница
    │   ├── style.css       стили
    │   └── app.js          браузерный JS (fetch)
    ├── screenshots/
    │   ├── page.png
    │   ├── post.png
    │   └── delete.png
    └── README.md

# 3.
    пользователь нажимает кнопку -> public/app.js → fetch('/api/books') -> Express (server.js) -> SQL-запрос -> SQLite (data.db) -> JSON-ответ -> state.books -> render() -> DOM

# 4.    
    GET  /api/info  200
    GET  /api/books  200
    GET /api/books/:id  200
    POST  /api/books  201
    PATCH  /api/books/:id  200
    DELETE  /api/books/:id  204

# 5.
    Загрузка списка при открытии страницы и по кнопке "Обновить список"
    Создает книги через форму: название, автор, год. Кнопка "Добавить"
    Изменения доступности кнопкой на карточке((«Сделать недоступной» / «Сделать доступной»))
    Удаление кнопкой «Удалить» с подтверждением.

# 6. 
    Смотреть SCREEN1-SCREEN3 (по какой-то причине скриншоты не прикрепляются)

# 7.
    Смотреть SCREEN3-SCREEN5 
# 8.
    textContent вставляет данные как текст, не интерпретируя их как HTML.  
    Если бы использовался innerHTML, браузер воспринял бы
    <b> как разметку и сделал текст жирным.   
    