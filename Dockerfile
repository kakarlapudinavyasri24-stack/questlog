# Multi-stage build for Questlog

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ .

RUN npm run build

# Stage 2: Build backend and runtime
FROM node:20-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/

WORKDIR /app/backend

RUN npm ci --only=production

COPY backend/ .

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/public

WORKDIR /app/backend

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

CMD ["node", "server.js"]
