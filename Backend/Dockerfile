# Backend/Dockerfile

# Stage 1: Build the frontend
FROM node:18.16.0-alpine AS frontend-builder
# Use a specific Node.js version based on Alpine for minimal size

# Set the working directory for frontend
WORKDIR /frontend

# Copy frontend package files and install dependencies
COPY ./Frontend/package*.json ./
RUN npm install  # Install only production dependencies for the frontend

# Copy the frontend source code
COPY ./Frontend/ .

# Build the frontend
RUN npm run build  # This should generate the production-ready frontend in /frontend/dist

# Stage 2: Build the backend
FROM node:18.16.0-alpine
# Use the same Node.js version for consistency

# Create a non-root user and group for running the application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory for the backend
WORKDIR /app

# Copy backend package files and install dependencies
COPY ./Backend/package*.json ./
RUN npm install --production  # Install only production dependencies for the backend

# Copy the backend source code
COPY ./Backend/ .

# Copy the built frontend files into the backend's public directory
COPY --from=frontend-builder /frontend/dist ./public

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user for running the application
USER appuser

# Expose the backend port (handled by docker-compose)
EXPOSE 2608

# Start the backend application
CMD ["npm", "run", "start"]
# Assuming the start script is defined in package.json
