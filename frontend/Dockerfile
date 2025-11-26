FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# Copy public directory if it exists
RUN mkdir -p ./public && \
    if [ -d /app/public ] && [ "$(ls -A /app/public)" ]; then \
        cp -r /app/public/* ./public/; \
    fi

EXPOSE 3000

CMD ["npm", "start"]

