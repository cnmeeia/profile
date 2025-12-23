#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import json
import requests
from datetime import datetime
from typing import Tuple

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes,
    CallbackQueryHandler,
)

# --- 日志配置 ---
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)


# --- 配置 ---
# 1. 替换为你的机器人 Token (从 @BotFather 获取)
TELEGRAM_BOT_TOKEN = "8125090751:AAGQNdr4PvbWF3JxVGWgfhXWK9v86Pgszvw"

# 2. 替换为你的后端 API 地址
API_ENDPOINT = "http://119.8.47.102:12990/api/search"
# 3. Telegram 消息长度限制
TELEGRAM_MESSAGE_MAX_LENGTH = 4096

# 【新增】支持的网盘类型列表，用于界面和逻辑处理
SUPPORTED_CLOUD_TYPES = {
    "all": "所有类型",
    "aliyun": "阿里云盘",
    "quark": "夸克网盘",
    "115": "115网盘",
    # 如果还有其他，可以继续添加
    # "pikpak": "PikPak",
}

# 【新增】用户设置存储 (内存数据库)
# 结构: { user_id: {"cloud_type": "aliyun"} }
# 生产环境建议使用文件 (如json) 或数据库 (如SQLite) 来持久化
user_settings = {}


# ==============================================================================
# --- 1. 用户设置与交互逻辑 (/settings 命令与按钮回调) ---
# ==============================================================================

def get_settings_keyboard(user_id: int) -> InlineKeyboardMarkup:
    """生成设置页面的按钮键盘"""
    current_setting = user_settings.get(user_id, {}).get(
        "cloud_type", "aliyun")  # 默认为 aliyun

    keyboard = []
    # 第一行：网盘类型选择
    row = []
    for key, value in SUPPORTED_CLOUD_TYPES.items():
        # 如果当前按钮代表的选项是用户已选择的，则标记为 ✅
        button_text = f"✅ {value}" if current_setting == key else value
        row.append(InlineKeyboardButton(
            button_text, callback_data=f"set_cloud_{key}"))
    keyboard.append(row)

    # 第二行：完成按钮
    keyboard.append([InlineKeyboardButton(
        "✅ 完成设置", callback_data="settings_done")])

    return InlineKeyboardMarkup(keyboard)


async def settings_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """处理 /settings 命令"""
    user = update.effective_user
    keyboard = get_settings_keyboard(user.id)

    text = (
        f"你好，{user.first_name}！\n\n"
        "请选择你偏好的网盘类型，我之后的搜索将会以此为准。"
    )
    await update.message.reply_text(text, reply_markup=keyboard)


async def handle_settings_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """处理内联键盘的按钮点击事件"""
    query = update.callback_query
    await query.answer()  # 必须调用，否则按钮会一直转圈

    user_id = query.from_user.id
    data = query.data
    current_settings = user_settings.get(user_id, {})

    if data.startswith("set_cloud_"):
        # 处理网盘类型选择
        selected_cloud = data.split("set_cloud_")[1]
        current_settings["cloud_type"] = selected_cloud
        user_settings[user_id] = current_settings  # 更新设置

        # 更新按钮键盘，让用户看到变化
        keyboard = get_settings_keyboard(user_id)
        new_text = query.message.text
        await query.edit_message_text(text=new_text, reply_markup=keyboard)

    elif data == "settings_done":
        # 处理完成设置
        chosen_cloud = current_settings.get("cloud_type", "aliyun")
        cloud_name = SUPPORTED_CLOUD_TYPES.get(chosen_cloud, "未知")

        await query.edit_message_text(
            text=f"✅ 设置已保存！\n\n你的默认搜索网盘现在是：\n<b>{cloud_name}</b>",
            parse_mode="HTML"
        )


# ==============================================================================
# --- 2. 核心搜索与 API 交互逻辑 ---
# ==============================================================================

async def search_api(keyword: str, user_id: int) -> Tuple[bool, str]:
    """
    调用后端的搜索 API 并返回结果。
    从用户设置中获取 cloud_type。
    """
    # 【核心修改点】从用户设置中获取 cloud_types
    user_specific_settings = user_settings.get(user_id, {})
    preferred_cloud_type = user_specific_settings.get(
        "cloud_type", "aliyun")  # 默认值

    request_payload = {"kw": keyword}

    # 如果用户选择的不是 "all"，则添加到请求中
    if preferred_cloud_type != "all":
        request_payload["cloud_types"] = [preferred_cloud_type]

    logger.info(
        f"User {user_id} is searching for '{keyword}'. API Request Payload: {json.dumps(request_payload)}")

    try:
        response = requests.post(
            API_ENDPOINT, json=request_payload, timeout=30)
        response.raise_for_status()
        data = response.json()

        if data.get("code") == 0:
            return True, format_results(data.get("data", {}), preferred_cloud_type)
        else:
            error_message = data.get("message", "未知错误")
            logger.error(f"API 返回业务错误: {error_message}")
            return False, f"❌ 搜索失败: {error_message}"

    except requests.exceptions.RequestException as e:
        logger.error(f"请求 API 时发生网络错误: {e}")
        return False, f"❌ 搜索失败: 无法连接到服务器或请求超时。"
    except json.JSONDecodeError:
        logger.error(f"API 返回了无效的 JSON 数据: {response.text}")
        return False, f"❌ 搜索失败: 服务器返回了无效的数据格式。"


def format_results(data: dict, current_search_type: str) -> str:
    """将从 API 获取的数据格式化为 Telegram 消息文本。"""
    total = data.get("total", 0)
    merged_by_type = data.get("merged_by_type", {})

    # 获取友好的网盘名称
    search_type_name = SUPPORTED_CLOUD_TYPES.get(
        current_search_type, current_search_type)

    if not merged_by_type:
        return f"🔍 未找到与“**{search_type_name}**”相关的资源。"

    message_text = f"🎉 找到 **{total}** 个“{search_type_name}”相关资源：\n\n"

    for cloud_type, items in merged_by_type.items():
        cloud_type_name = SUPPORTED_CLOUD_TYPES.get(
            cloud_type, cloud_type.upper())
        message_text += f"📁 <b>{cloud_type_name}</b> 网盘:\n"

        for item in items:
            note = item.get("note", "无标题")
            url = item.get("url", "#")
            source = item.get("source", "未知来源")
            dt_str = item.get("datetime")

            formatted_time = "未知时间"
            if dt_str and not dt_str.startswith("0001-"):
                try:
                    dt_obj = datetime.fromisoformat(
                        dt_str.replace('Z', '+00:00'))
                    formatted_time = dt_obj.strftime('%Y-%m-%d %H:%M')
                except ValueError:
                    formatted_time = "无效时间"
            elif dt_str and dt_str.startswith("0001-"):
                formatted_time = "时间未知"

            message_text += (
                f"----------------------------------------\n"
                f"📄 <b>{note}</b>\n"
                f"🔗 <a href=\"{url}\">{url}</a>\n"
                f"📅 发布时间: {formatted_time}\n"
                f"👤 来源: {source}\n"
            )
            if item.get("password"):
                message_text += f"🔑 提取码: <code>{item['password']}</code>\n"

        message_text += "\n"

    return message_text.strip()


# ==============================================================================
# --- 3. 消息处理与发送逻辑 ---
# ==============================================================================

async def split_and_send_messages(
    chat_id: int, context: ContextTypes.DEFAULT_TYPE, text: str, reply_to_message_id: int = None
) -> None:
    """
    将长文本拆分成多条消息并发送。
    优先尝试用 HTML 格式，失败则回退到纯文本。
    拆分时会尽量避免在 HTML 标签中间切断。
    """
    # 如果文本本身不超长，直接尝试发送
    if len(text) <= TELEGRAM_MESSAGE_MAX_LENGTH:
        try:
            # 首选：尝试作为 HTML 发送，保持格式
            await context.bot.send_message(
                chat_id=chat_id,
                text=text,
                parse_mode="HTML",
                disable_web_page_preview=True,
                reply_to_message_id=reply_to_message_id
            )
            return
        except telegram.error.BadRequest as e:
            # 如果 HTML 解析失败，记录并回退到纯文本
            logger.warning(f"HTML 解析失败，回退到纯文本发送。错误: {e}")
            # 清理 HTML 标签
            plain_text = text.replace("<b>", "").replace("</b>", "") \
                .replace("<i>", "").replace("</i>", "") \
                .replace("<code>", "").replace("</code>", "") \
                .replace("<pre>", "").replace("</pre>", "") \
                .replace("<a href=\"", "").replace("\">", " ").replace("</a>", "")
            await context.bot.send_message(
                chat_id=chat_id,
                text=plain_text,
                reply_to_message_id=reply_to_message_id
            )
            return

    # 如果文本超长，进行拆分
    parts = []
    while text:
        part = text[:TELEGRAM_MESSAGE_MAX_LENGTH]
        last_newline = part.rfind('\n')
        last_space = part.rfind(' ')

        split_pos = -1
        if last_newline > TELEGRAM_MESSAGE_MAX_LENGTH * 0.7:
            split_pos = last_newline
        elif last_space > TELEGRAM_MESSAGE_MAX_LENGTH * 0.7:
            split_pos = last_space

        if split_pos != -1:
            temp_part = text[:split_pos]
            if temp_part.count('<') > temp_part.count('>'):
                split_pos = -1

        if split_pos == -1:
            split_pos = TELEGRAM_MESSAGE_MAX_LENGTH

        parts.append(text[:split_pos])
        text = text[split_pos:].lstrip()

    # 循环发送每一部分
    for i, part in enumerate(parts):
        reply_to = reply_to_message_id if i == 0 else None
        try:
            await context.bot.send_message(
                chat_id=chat_id,
                text=part,
                parse_mode="HTML",
                disable_web_page_preview=True,
                reply_to_message_id=reply_to
            )
        except telegram.error.BadRequest as e:
            logger.warning(
                f"拆分消息的某部分 HTML 解析失败，回退到纯文本。部分内容: {part[:100]}... 错误: {e}")
            plain_part = part.replace("<b>", "").replace("</b>", "") \
                             .replace("<i>", "").replace("</i>", "") \
                             .replace("<code>", "").replace("</code>", "") \
                             .replace("<pre>", "").replace("</pre>", "") \
                             .replace("<a href=\"", "").replace("\">", " ").replace("</a>", "")
            await context.bot.send_message(
                chat_id=chat_id,
                text=plain_part,
                reply_to_message_id=reply_to
            )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """处理用户发送的关键词消息"""
    keyword = update.message.text
    user_id = update.effective_user.id

    if not keyword.strip():
        await update.message.reply_text("请输入有效的搜索关键词。")
        return

    pending_message = await update.message.reply_text("🔄 正在搜索，请稍候...")
    success, result_text = await search_api(keyword, user_id)

    try:
        await context.bot.delete_message(
            chat_id=update.effective_chat.id, message_id=pending_message.message_id
        )
    except Exception as e:
        logger.warning(f"删除临时消息失败: {e}")

    if success:
        await split_and_send_messages(
            chat_id=update.effective_chat.id, context=context, text=result_text, reply_to_message_id=update.message.message_id
        )
    else:
        await context.bot.send_message(
            chat_id=update.effective_chat.id, text=result_text, reply_to_message_id=update.message.message_id
        )


# ==============================================================================
# --- 4. 基础命令与主程序入口 ---
# ==============================================================================

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """处理 /start 命令"""
    user = update.effective_user
    # 初始化新用户的设置
    if user.id not in user_settings:
        user_settings[user.id] = {"cloud_type": "aliyun"}

    await update.message.reply_html(
        f"你好，{user.mention_html()}！\n\n"
        "我是一个资源搜索机器人，直接发送关键词即可搜索。\n"
        "使用 /settings 命令可以设置你偏好的网盘类型。\n"
        "使用 /help 命令可以查看帮助信息。"
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """处理 /help 命令"""
    text = (
        "<b>使用指南</b>\n\n"
        "1. <b>搜索资源</b>\n"
        "   直接向我发送你想搜索的关键词，例如：<code>电影</code> 或 <code>三体</code>。\n\n"
        "2. <b>设置偏好</b>\n"
        "   使用 <code>/settings</code> 命令，你可以选择只搜索特定类型的网盘。\n\n"
        "<i>注意：首次使用，你的默认网盘类型是“阿里云盘”。</i>"
    )
    await update.message.reply_html(text)


def main() -> None:
    """启动 Bot"""
    # 创建 Application 并传入 Token
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # 注册命令处理器
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("settings", settings_command))

    # 注册回调查询处理器，用于处理内联键盘按钮点击
    application.add_handler(CallbackQueryHandler(handle_settings_callback))

    # 注册消息处理器，处理所有非命令的文本消息
    application.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("机器人已启动并开始轮询...")
    # 使用 run_polling 启动 Bot
    application.run_polling()


if __name__ == "__main__":
    main()