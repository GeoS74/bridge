# Bridge

**Bridge** - это модуль, позволяющий создать каталог торговых позиций с возможностью гибкого поиска. Прайсы поставщиков загужаются в виде файлов Excel, также имеется возможность интеграции с учётной системой компании (например 1С:Управление торговлей) для синхронизации данных о номенклатуре и остатках.

## Запуск приложения

Перед запуском приложения необходимо откорректировать конфигурацию модуля в файле `./config.js`. Также, возможно понадобиться создать базу данных (см. описание скриптов ниже).

>Прим.: в конфигурационном файле есть переменная `node.env`, которая по умолчанию имеет значение `dev`. Этот параметр конфигурации разрешает обращение к серверу из любого источника игнорируя CORS. Если установить любое другой значение этой переменной, отличное от `dev`, то контроль источника запросов будет включён, а также запуск тестов будет не возможен.

Для запуска приложения выполнить:
```bash
node index
```

Для создания базы данных выполнить:
```bash
npm run db:init
```

Для удаления базы данных выполнить:
```bash
npm run db:drop
```

Для запуска тестов:
```bash
npm test
```

Для запуска линтера:
```bash
npm run lint
```

Для запуска линтер в режиме исправления ошибок:
```bash
npm run lint:fix
```

## Запуск приложения с использованием Docker

Перед запуском приложения необходимо откорректировать переменные окружения для образа в файле `docker-compose.yml`. Для запуска приложения выполнить:

```bash
docker compose up -d
```

## API для брендов

CRUD API для работы со списком брендов позволяет создавать, запрашивать, изменять и удалять бренды.
При обращениях к API сервер возвращает данные в формате json. В зависимости от состояния ответа, возвращаемая структура может содержать данные о бренде, либо описание ошибки.

### Создание бренда

Маршрут:
```
POST /api/bridge/brands
```

Сервер ожидает получить название бренда, доступное по ключу `title`.
В случае успешного добавления бренда сервер ответит статусом **201** и вернёт данные о созданном бренде в формате json.

```js
{
  id: "идентификатор бренда",
  title: "название бренда"
}
```

### Получение данных о брендах

Маршрут:
```
GET /api/bridge/brands
```

Сервер возвращает статус **200** и массив объектов с данными о брендах в формате json.

```js
[
  {
    id: "идентификатор бренда",
    title: "название бренда"
  },
  {
    id: "идентификатор бренда",
    title: "название бренда"
  }
  ...
]
```

### Получение данных об определённом бренде

Маршрут:
```
GET /api/bridge/brands/:id
```
где `:id` - идентификатор бренда

В случае если бренд, под запрашиваемым идентификатором существует, сервер вернёт сатус **200** и данные бренда в формате json.

```js
{
  id: "идентификатор бренда",
  title: "название бренда"
}
```

Если запрашиваемый бренд не существует, сервер ответит статусом **404** с описанием возникшей ошибки.

### Изменение названия бренда

Маршрут:
```
PATCH /api/bridge/brands/:id
```
где `:id` - идентификатор бренда

Сервер ожидает получить название бренда, доступное по ключу `title`.
В случае успешного изменения названия бренда сервер ответит статусом **200** и вернёт обновлённые данные о бренде в формате json.

```js
{
  id: "идентификатор бренда",
  title: "название бренда"
}
```

Если запрашиваемый бренд не существует, сервер ответит статусом **404** с описанием возникшей ошибки.

### Удаление бренда

Маршрут:
```
DELETE /api/bridge/brands/:id
```
где `:id` - идентификатор бренда

В случае успешного удаления бренда сервер ответит статусом **200** и вернёт данные об удалённом бренде в формате json.

```js
{
  id: "идентификатор бренда",
  title: "название бренда"
}
```

Если удаляемый бренд не существует, сервер ответит статусом **404** с описанием возникшей ошибки.


## API для поставщиков

CRUD API для работы со списком поставщиков позволяет создавать, запрашивать, изменять и удалять данные о поставщиках.
При обращениях к API сервер возвращает данные в формате json. В зависимости от состояния ответа, возвращаемая структура может содержать данные о поставщике, либо ошибки.

### Создание поставщика

Маршрут:
```
POST /api/bridge/providers
```

Сервер ожидает получить название поставщика, доступное по ключу `title`.
В случае успешного добавления поставщика сервер ответит статусом **201** и вернёт данные о созданном поставщике в формате json.

```js
{
  id: "идентификатор поставщика",
  title: "название поставщика"
}
```

### Получение данных о поставщике

Маршрут:
```
GET /api/bridge/providers
```

Сервер возвращает статус **200** и массив объектов с данными о поставщиках в формате json.

```js
[
  {
    id: "идентификатор поставщика",
    title: "название поставщика"
  },
  {
    id: "идентификатор поставщика",
    title: "название поставщика"
  }
  ...
]
```

### Получение данных об определённом поставщике

Маршрут:
```
GET /api/bridge/providers/:id
```
где `:id` - идентификатор поставщика

В случае если поставщик, под запрашиваемым идентификатором существует, сервер вернёт сатус **200** и данные бренда в формате json.

```js
{
  id: "идентификатор бренда",
  title: "название бренда"
}
```

Если запрашиваемый поставщик не существует, сервер ответит статусом **404** с описанием возникшей ошибки.

### Изменение названия поставщика

Маршрут:
```
PATCH /api/bridge/providers/:id
```
где `:id` - идентификатор поставщика

Сервер ожидает получить название поставщика, доступное по ключу `title`.
В случае успешного изменения названия поставщика сервер ответит статусом **200** и вернёт обновлённые данные о поставщике в формате json.

```js
{
  id: "идентификатор поставщика",
  title: "название поставщика"
}
```

Если запрашиваемый поставщик не существует, сервер ответит статусом **404** с описанием возникшей ошибки.

### Удаление поставщика

Маршрут:
```
DELETE /api/bridge/providers/:id
```
где `:id` - идентификатор поставщика

В случае успешного удаления поставщика сервер ответит статусом **200** и вернёт данные об удалённом поставщике в формате json.

```js
{
  id: "идентификатор поставщика",
  title: "название поставщика"
}
```

Если удаляемый поставщик не существует, сервер ответит статусом **404** с описанием возникшей ошибки.


## API для загрузки прайсов поставщиков

Маршрут:
```
POST /api/bridge/file/upload
```

### Описание полей данных

Для загрузки прайса поставщика сервер ожидает получить данные доступные по следующим полям:

```js
{
  file: " * (обязательно) файл Excel в формате .xls или .xlsx",
  brandId: " * (обязательно) идентификатор бренда из таблицы брендов",
  providerId: " * (обязательно) идентификатор поставщика из таблицы поставщиков",
  article: " * (обязательно) столбец с артикулом позиции, загружаемого файла Excel",
  title: " * (обязательно) столбец с наименование позиции, загружаемого файла Excel",
  price: " * (обязательно) столбец с ценой, загружаемого файла Excel",
  amount: "столбец с остатками, загружаемого файла Excel",
  profit: "процент наценки к цене",
  startRow: "порядковый номер строки начала чтения, загружаемого файла Excel (начинается с 1)",
  endRow: " порядковый номер строки окончания чтения, загружаемого файла Excel"
}
```

__Поля отмеченные * являются обязательными.__

>Примечание: в качестве указания столбцов файла Excel можно использовать как численное (начинается с 1), так и буквенное обозначение (например "ab"). Регистр букв не имеет значения.

### Валидация данных сервером

При загрузке прайса поставщика, сервер прежде всего проверяет формат передаваемого файла. Файл должен передаваться один, в случае если будет попытка отправки нескольких файлов Excel одновременно - будет возвращена ошибка.

Если не передаются идентификатор бренда и идентификатор поставщика, также будет возвращена ошибка.

В случае если не передаются номера столбцов с артикулом, названием и ценой позиции - ошибка возвращена не будет. Но, при загрузке такого файла данные в базу данных записаны не будут.

## API для поиска позиций

При обращениях к API сервер возвращает данные о найденных позициях в формате json. В зависимости от состояния ответа, возвращаемая структура может содержать данные о позициях, либо описание ошибки. В случае если переданному запросу не соответствует ни одна торговая позиция сервер возвращает ошибку со статусом **404**.

### Запрос позиции

Маршрут:
```
GET /api/bridge/search?query='text'&offset='offset'&limit='limit'
```
Параментры запроса:
- **query** - <span style="color:red">(обязательный параметр)</span> искомая строка
- **offset** - смещение запроса (по умолчанию 0)
- **limit** - максимальное количество результатов (по умолчанию 10, максимум 10)


Если будут найдены позиции соответствующие поисковому запросу сервер ответит статусом **200** и вернёт данные о позициях в формате json.

### Пример структуры данных ответа:
```js
{
  limit: 1,
  offset: 0,
  time: 0.064,
  positions: Array [ 
    {
      createdAt: "2023-01-30T10:01:29.257Z",
      brandId: 53,
      brantTitle: "URAL",
      providerId: 52,
      providerTitle: "АЗ \"УРАЛ\"",
      uid: null,
      amount: 0,
      price: "2220.00",
      amountBovid: 0,
      article: "218",
      title: "ШАРИКОПОДШИПНИК",
      code: null,
      manufacturer: null,
      weight: "0.00",
      storage: null,
      height: "0.00",
      length: "0.00",
      width: "0.00",
    }
  ]
}
```

## Описание ошибок

В случае если при передаче данных происходят ошибки, сервер отвечает статусом отличным от **200-299** и возвращает json структуру с описанием ошибки.

### Структура json при возникновении ошибки

```js
{
  error: "описание ошибки"
}
```

### Коды ответа сервера при возникновении ошибок

**400** - ошибка при передаче данных, сервер не смог обработать запрос
**403** - ошибка авторизации
**404** - запрашиваемый ресурс не существует
**500** - внутренняя ошибка сервера