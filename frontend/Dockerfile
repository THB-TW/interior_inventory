# ── 第一階段：build React ─────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 先複製 package.json，利用 cache
# npm ci 比 npm install 更嚴格，會完全按照 package-lock.json 安裝
COPY package*.json ./
RUN npm ci

# 複製全部前端原始碼
COPY . .

# 執行 vite build，產出靜態檔案到 /app/dist
RUN npm run build

# ── 第二階段：用 Nginx 提供靜態檔案 ──────────────
# Nginx = 超高效能的靜態檔案伺服器，比 Node.js 更適合
FROM nginx:alpine

# 把 build 好的 dist 資料夾放到 Nginx 的預設目錄
COPY --from=builder /app/dist /usr/share/nginx/html

# 把我們自訂的 Nginx 設定覆蓋預設的
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80