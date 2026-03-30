# Multi-stage build for Symbion Cloud Backend
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production dependencies
FROM base AS deps
RUN npm ci --omit=dev

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S symbion && \
    adduser -S symbion -u 1001 -G symbion

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

# Create logs directory
RUN mkdir -p logs && chown -R symbion:symbion /app

USER symbion

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
