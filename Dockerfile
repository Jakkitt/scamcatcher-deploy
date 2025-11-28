# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source and build
COPY . .
RUN npm run build

# Stage 2: Setup Backend & Run
FROM node:18-alpine
WORKDIR /app

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Setup Backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY server/src ./src
COPY server/scripts ./scripts

# Environment variables (Defaults, override at runtime)
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Start server
CMD ["node", "src/index.js"]
