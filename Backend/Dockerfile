# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY ./Frontend/package*.json ./
RUN npm install
COPY ./Frontend/ .
RUN npm run build

# Stage 2: Build the backend
FROM node:18-alpine
WORKDIR /app
COPY ./Backend/package*.json ./
RUN npm install
COPY ./Backend/ .
# Copy the built frontend files into the backend/public directory
COPY --from=frontend-builder /frontend/dist ./public
# Build the backend (if needed)
RUN npm run build
EXPOSE 2608
CMD ["npm", "run", "start"]
