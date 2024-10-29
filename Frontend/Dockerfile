# Use the official Node.js 18 image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Run the Vite build
RUN npm run build

# Expose the /dist folder as the build artifact
CMD ["npm", "run", "build"]
