# Use Node.js v24.14.0 specifically
FROM node:24.14.0-alpine

# Enable corepack and ensure latest pnpm is active
RUN corepack enable && corepack prepare pnpm@latest --activate

# Add compatibility library
RUN apk add --no-cache bash libc6-compat git openssh-client

# Set working directory
WORKDIR /app

# Copy npm/pnpm configs and lockfile
COPY .npmrc* ./
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy app source code
COPY . .

# Expose dev port
EXPOSE 3000

# Default command
CMD ["pnpm", "dev"]
