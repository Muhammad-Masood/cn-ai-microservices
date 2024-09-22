# Stage 1: Build
FROM node:18.20.4-alpine AS builder

WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18.20.4-alpine

WORKDIR /app

# Copy only the built assets and node_modules from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# ENV NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"
# EXPOSE 3000

CMD ["npm", "start"]
