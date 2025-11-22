# Build stage for React app
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci --only=production

# Copy client source
COPY client/ ./

# Build the React app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install server dependencies only
RUN npm ci --only=production

# Copy server code
COPY server.js ./

# Copy built React app from build stage
COPY --from=client-build /app/client/build ./client/build

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app files
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Cloud Run will inject PORT env var)
EXPOSE 8080

# Set environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
