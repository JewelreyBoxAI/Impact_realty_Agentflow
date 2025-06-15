# Multi-stage Dockerfile for Impact Realty Application
# Optimized for production deployment on Azure Container Apps

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S impact-realty -u 1001

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=impact-realty:nodejs . .

# Create directories for logs and temp files
RUN mkdir -p /app/logs /app/temp && \
    chown -R impact-realty:nodejs /app/logs /app/temp

# Install curl for health checks
RUN apk add --no-cache curl

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info

# Expose port
EXPOSE 3000

# Switch to non-root user
USER impact-realty

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]

# Metadata labels
LABEL org.opencontainers.image.title="Impact Realty Application"
LABEL org.opencontainers.image.description="Real estate management application with Supabase integration"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Agentic Solutions"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/agentic-solutions/impact-realty"
LABEL tenant="impact-realty"
LABEL platform="azure-container-apps" 