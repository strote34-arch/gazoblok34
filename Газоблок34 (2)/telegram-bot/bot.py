#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ГАЗОБЛОК34 — телеграм-бот приёма заказов.

Принимает заявку у клиента пошагово (имя → телефон → что нужно → комментарий)
и пересылает её администратору (вам) в личные сообщения.

Запуск:
    pip install "python-telegram-bot==21.6"
    python bot.py

Перед запуском впишите BOT_TOKEN и ADMIN_CHAT_ID ниже (или задайте через
переменные окружения GB_BOT_TOKEN и GB_ADMIN_CHAT_ID). Подробно — см. README.md.
"""

import os
import logging
from telegram import (
    Update,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    KeyboardButton,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
)
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ConversationHandler,
    ContextTypes,
    filters,
)

# ============================================================
#  НАСТРОЙКИ — впишите свои значения
# ============================================================
BOT_TOKEN = os.environ.get("GB_BOT_TOKEN", "8840104364:AAHrRb6w6ACanyQ04ZzyonFDD9ITh6neETs")
ADMIN_CHAT_ID = int(os.environ.get("GB_ADMIN_CHAT_ID", "69970857"))  # ← ВПИШИТЕ ваш Telegram ID числом вместо 0, напр. 461025478

# Сайт и контакты (для текста сообщений)
SITE = "газоблок34.рф"
PHONE = "+7 996 484-03-73"

# Пункты меню «что нужно»
NEEDS = [
    "Газоблок для дома",
    "Помощь с расчётом",
    "Готовый проект",
    "Пено-клей и материалы",
    "Доставка",
    "Другое",
]

# ============================================================
#  Состояния диалога
# ============================================================
NAME, PHONE_STEP, NEED, COMMENT = range(4)

logging.basicConfig(
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("gazoblok34-bot")


# ============================================================
#  Хендлеры
# ============================================================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Приветствие + кнопка «Оставить заявку»."""
    kb = InlineKeyboardMarkup(
        [[InlineKeyboardButton("📝 Оставить заявку", callback_data="order")]]
    )
    await update.message.reply_text(
        "Здравствуйте! Это бот ГАЗОБЛОК34 🏠\n\n"
        "Помогу подобрать газоблок завода ГРАС, посчитать объём и оформить заказ "
        f"с доставкой по Волгограду и области.\n\n"
        "Нажмите «Оставить заявку» — задам пару вопросов и передам всё мастеру. "
        f"Можно и просто позвонить: {PHONE}.",
        reply_markup=kb,
    )


async def order_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Старт диалога заявки (по кнопке или команде /order)."""
    context.user_data.clear()
    if update.callback_query:
        await update.callback_query.answer()
        await update.callback_query.message.reply_text(
            "Отлично! Как вас зовут?",
            reply_markup=ReplyKeyboardRemove(),
        )
    else:
        await update.message.reply_text(
            "Отлично! Как вас зовут?",
            reply_markup=ReplyKeyboardRemove(),
        )
    return NAME


async def get_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["name"] = update.message.text.strip()
    contact_btn = ReplyKeyboardMarkup(
        [[KeyboardButton("📱 Отправить мой контакт", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await update.message.reply_text(
        f"Приятно, {context.user_data['name']}!\n"
        "Оставьте телефон для связи — введите вручную или нажмите кнопку ниже.",
        reply_markup=contact_btn,
    )
    return PHONE_STEP


async def get_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.contact:
        context.user_data["phone"] = update.message.contact.phone_number
    else:
        context.user_data["phone"] = update.message.text.strip()

    rows = [[InlineKeyboardButton(n, callback_data=f"need:{i}")] for i, n in enumerate(NEEDS)]
    await update.message.reply_text(
        "Что вас интересует?",
        reply_markup=InlineKeyboardMarkup(rows),
    )
    return NEED


async def get_need(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    idx = int(q.data.split(":")[1])
    context.user_data["need"] = NEEDS[idx]
    await q.message.reply_text(
        f"Записал: «{NEEDS[idx]}».\n\n"
        "Добавьте комментарий — площадь дома, сроки, вопросы. "
        "Или напишите «-», если нечего добавить.",
    )
    return COMMENT


async def get_comment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    comment = update.message.text.strip()
    context.user_data["comment"] = "" if comment == "-" else comment

    d = context.user_data
    user = update.effective_user
    username = f"@{user.username}" if user.username else "—"

    # Сообщение администратору
    admin_text = (
        "🔔 НОВАЯ ЗАЯВКА с бота\n"
        "————————————————\n"
        f"👤 Имя: {d.get('name', '—')}\n"
        f"📞 Телефон: {d.get('phone', '—')}\n"
        f"📦 Запрос: {d.get('need', '—')}\n"
        f"💬 Комментарий: {d.get('comment') or '—'}\n"
        "————————————————\n"
        f"Telegram: {username} (id {user.id})"
    )

    sent_ok = False
    if ADMIN_CHAT_ID:
        try:
            await context.bot.send_message(chat_id=ADMIN_CHAT_ID, text=admin_text)
            sent_ok = True
        except Exception as e:
            log.error("Не удалось отправить заявку админу: %s", e)
    else:
        log.warning("ADMIN_CHAT_ID не задан — заявка не отправлена админу:\n%s", admin_text)

    await update.message.reply_text(
        "Спасибо! Заявку принял ✅\n\n"
        "Мастер свяжется с вами в ближайшее время, поможет с расчётом и оформит заказ.\n\n"
        f"Сайт: {SITE} · телефон: {PHONE}",
        reply_markup=ReplyKeyboardRemove(),
    )
    if not sent_ok and ADMIN_CHAT_ID:
        log.info("Заявка собрана, но доставка админу не удалась — проверьте, что вы нажали Start у бота.")
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Заполнение отменено. Чтобы начать заново — /start.",
        reply_markup=ReplyKeyboardRemove(),
    )
    return ConversationHandler.END


def main():
    if BOT_TOKEN.startswith("ВСТАВЬТЕ"):
        raise SystemExit(
            "❌ Не задан BOT_TOKEN. Впишите токен от @BotFather в bot.py "
            "или задайте переменную окружения GB_BOT_TOKEN. См. README.md"
        )

    app = Application.builder().token(BOT_TOKEN).build()

    conv = ConversationHandler(
        entry_points=[
            CommandHandler("order", order_start),
            CallbackQueryHandler(order_start, pattern="^order$"),
        ],
        states={
            NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)],
            PHONE_STEP: [
                MessageHandler(filters.CONTACT, get_phone),
                MessageHandler(filters.TEXT & ~filters.COMMAND, get_phone),
            ],
            NEED: [CallbackQueryHandler(get_need, pattern="^need:")],
            COMMENT: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_comment)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(conv)

    log.info("✅ Бот запущен. Откройте его в Telegram и нажмите Start.")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()


# ============================================================
#  Автозапуск на сервере (systemd) — пример.
#  Создайте файл /etc/systemd/system/gazoblok34-bot.service:
#
#  [Unit]
#  Description=GAZOBLOK34 Telegram bot
#  After=network.target
#
#  [Service]
#  Type=simple
#  WorkingDirectory=/opt/gazoblok34-bot
#  Environment=GB_BOT_TOKEN=ваш_токен
#  Environment=GB_ADMIN_CHAT_ID=ваш_id
#  ExecStart=/usr/bin/python3 /opt/gazoblok34-bot/bot.py
#  Restart=always
#
#  [Install]
#  WantedBy=multi-user.target
#
#  Затем:
#    sudo systemctl daemon-reload
#    sudo systemctl enable --now gazoblok34-bot
# ============================================================
