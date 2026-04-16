FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev for TypeScript build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the TypeScript code (outputs to /dist)
RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from the builder
COPY --from=builder /app/dist ./dist

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["pnpm", "start"]
