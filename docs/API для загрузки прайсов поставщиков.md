# API для загрузки прайсов поставщиков

Маршрут:
```
POST /api/file/upload
```

## Описание полей данных

Для загрузки прайса поставщика сервер ожидает получить данные доступные по следующим полям:

`file`<span style="color:red">*</span> - файл Excel в формате .xls или .xlsx
`brandId`<span style="color:red">*</span> - идентификатор бренда из [[Таблица брендов|таблицы брендов]]
`providerId`<span style="color:red">*</span> - идентификатор поставщика из [[Таблица поставщиков|таблицы поставщиков]]
`article`<span style="color:red">*</span> - столбец с артикулом позиции, загружаемого файла Excel
`title`<span style="color:red">*</span> - столбец с наименование позиции, загружаемого файла Excel
`price`<span style="color:red">*</span> - столбец с ценой, загружаемого файла Excel
`amount` - столбец с остатками, загружаемого файла Excel
`profit` - процент наценки к цене
`startRow` - порядковый номер строки начала чтения, загружаемого файла Excel (начинается с 1)
`endRow` - порядковый номер строки окончания чтения, загружаемого файла Excel

__Поля отмеченные * являются обязательными.__

>Примечание: в качестве указания столбцов файла Excel можно использовать как численное (начинается с 1), так и буквенное обозначение (например "ab"). Регистр букв не имеет значения.



## Валидация данных сервером

При загрузке прайса поставщика, сервер прежде всего проверяет формат передаваемого файла. Файл должен передаваться один, в случае если будет попытка отправки нескольких файлов Excel одновременно - будет возвращена [[Описание ошибок|ошибка]].
Если не передаются идентификатор бренда и идентификатор поставщика, также будет возвращена [[Описание ошибок|ошибка]].

В случае если не передаются номера столбцов с артикулом, названием и ценой позиции - ошибка возвращена не будет. Но, при загрузке такого файла данные в базу данных записаны не будут.

[[main|На главную]]