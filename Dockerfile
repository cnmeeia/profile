# 使用官方 Python 镜像，轻量且包含 pip
FROM python:3.12-slim

# 设置工作目录
WORKDIR /app

# 复制脚本
COPY pan.py .

# 安装依赖：python-telegram-bot (v20+ 使用 Application)
RUN pip install --no-cache-dir python-telegram-bot==20.8 requests

# 环境变量（可选，运行时也可通过 -e 覆盖）
ENV TELEGRAM_BOT_TOKEN=your_token_here
ENV API_ENDPOINT=http://your-api:port/api/search

# 以非 root 用户运行（安全考虑）
RUN useradd -m botuser
USER botuser

# 运行 Bot（会长期运行，轮询模式）
CMD ["python", "pan.py"]