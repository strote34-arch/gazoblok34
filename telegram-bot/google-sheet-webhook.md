# Подключение Google-таблицы заявок к боту (мини-CRM)

Таблица: **«Газоблок34 — Заявки (CRM)»**
https://docs.google.com/spreadsheets/d/1XwXcuMGrozZ3GIrdQv5Stw7tG4AJ4EAf3BvBvuQ6opM

Каждая заявка из бота будет автоматически дописываться строкой в таблицу:
дата · источник · тип · имя · телефон · что нужно · объём · адрес · Telegram · комментарий · статус.

## Шаг 1. Вставьте скрипт в таблицу

1. Откройте таблицу → меню **Расширения → Apps Script**.
2. Удалите всё в редакторе и вставьте код ниже:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var d = JSON.parse(e.postData.contents);
  sheet.appendRow([
    Utilities.formatDate(new Date(), "Europe/Volgograd", "dd.MM.yyyy HH:mm"),
    "Бот Telegram",
    d.type || "",
    d.name || "",
    "'" + (d.phone || ""),
    d.need || "",
    d.volume || "",
    d.address || "",
    d.tg || "",
    d.comment || "",
    "Новая"
  ]);
  return ContentService.createTextOutput("ok");
}
```

3. Нажмите **💾 Сохранить**.

## Шаг 2. Опубликуйте как веб-приложение

1. Кнопка **Развернуть → Новое развёртывание**.
2. Тип: **Веб-приложение**.
3. «Запуск от имени» — **Я**. «У кого есть доступ» — **Все** (это нужно, чтобы бот мог писать; адрес секретный, его знает только бот).
4. **Развернуть** → разрешите доступ (Google спросит подтверждение) → скопируйте **URL веб-приложения** (вида `https://script.google.com/macros/s/…/exec`).

## Шаг 3. Дайте адрес боту

На сервере, где запущен бот, задайте переменную окружения:

```
GB_SHEET_WEBHOOK=https://script.google.com/macros/s/AKfycbx57rCfNoTvy6wicnA0VJ_3b5mAXWN5-vWrvuvGMMEPOD2Cm04mr6xV_WbTaDBXNgPhoA/exec
```

(в systemd-юнит добавьте строку `Environment=GB_SHEET_WEBHOOK=…` и перезапустите бота).

Всё. Если переменная не задана — бот работает как раньше, просто без записи в таблицу.
Ошибки записи в таблицу бота не ломают: заявка всё равно придёт вам в Telegram.

## Удалите строку-пример

В таблице сейчас одна строка-пример (Иван) — удалите её, когда придёт первая настоящая заявка.
