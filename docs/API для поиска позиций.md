# API для поиска позиций

При обращениях к API сервер возвращает данные о найденных позициях в формате json. В зависимости от состояния ответа, возвращаемая структура может содержать данные о позициях, либо [[Описание ошибок|описание ошибки]]. В случае если переданному запросу не соответствует ни одна торговая позиция сервер возвращает ошибку со статусов **404**.

## Запрос позиции

Маршрут:
```
GET /api/search?query='text'&offset='offset'&limit='limit'
```
Параментры запроса:
- **query** - <span style="color:red">(обязательный параметр)</span> искомая строка
- **offset** - смещение запроса (по умолчанию 0)
- **limit** - максимальное количество результатов (по умолчанию 10, максимум 10)


Если будут найдены позиции соответствующие поисковому запросу сервер ответит статусом **200** и вернёт данные о позициях в формате json.

## Описание полей json:

```json
{
  positions: [
    {
      amount: ""
      amountBovid: 1
      article: "артикл позиции"
      ​​​title: "название позиции"
      brandId: 2
      brantTitle: "УРАЛ"
      ​​​code: "249441"
      ​​​createdAt: "2022-11-02T06:49:06.546Z"
      ​​​height: 0
      ​​​length: 0.45
      ​​​manufacturer: "АО «АЗ «УРАЛ»"
      ​​​price: 65791.945
      ​​​providerId: 1
      ​​​providerTitle: "АЗ \"УРАЛ\""
      ​​​storage: [
        {
          amount: "1"
          ​​​codestorage: "00006"
          ​​​​​idstorage: "779f4774-5e82-11d9-8f85-00c09f35bc76"
          ​​​​​namestorage: "г. Челябинск, ул.Линейная, 98"
        }
      ]
      uid: "c3598bfc-bda1-41ca-9f31-d6b8d0f77700"
      weight: 49
      width: 0.27
    }
  ]
}
```

## Пример структуры данных ответа:
```json
{
  positions: [
    {
      id: "идентификатор бренда",
      title: "название бренда"

      amount: 0
      amountBovid: 1
      article: "ШНКФ 453461.700-25"
      brandId: 2
      brantTitle: "УРАЛ"
      ​​​code: "249441"
      ​​​createdAt: "2022-11-02T06:49:06.546Z"
      ​​​height: 0
      ​​​length: 0.45
      ​​​manufacturer: "АО «АЗ «УРАЛ»"
      ​​​price: 65791.945
      ​​​providerId: 1
      ​​​providerTitle: "АЗ \"УРАЛ\""
      ​​​storage: Array [ {…} ]
      ​​​title: "МЕХАНИЗМ РУЛЕВОГО УПРАВЛЕНИЯ"
      uid: "c3598bfc-bda1-41ca-9f31-d6b8d0f77700"
      weight: 49
      width: 0.27
    }
  ]
}
```

[[main|На главную]]