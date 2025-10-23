# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --only=production && npm cache clean --force
COPY src/ ./src/
RUN npm install -D typescript @types/node && npm run build

FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "require('http').get('http://localhost:3003/api/v1/profiles/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["node", "dist/index.js"]
