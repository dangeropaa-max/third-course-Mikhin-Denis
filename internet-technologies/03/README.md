# 1.
    https://jsonplaceholder.typicode.com/users
# 2.
    GET
# 3.
    В объекте state.        
# 4. 
    - Данных еще нет.
    - Загрузка.
    - Успешный ответ.
    - Ошибка.
# 5.
    Если response.ok === false. Бросаем Error со статусом.
    Текст ошбика вызывается через render().
# 6.
    name, username, email

# 7.
    При успехе:
    - Request URL: https://jsonplaceholder.typicode.com/users
    - Request Method: GET
    - Status Code: 200 OK
    При ошибке:
    - Status Code: 404 Not Found
    - В интерфейсе: «Ошибка: HTTP error: 404»
    - Список и статистика пусты, кнопки активны
