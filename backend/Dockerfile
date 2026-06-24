# Use Node.js LTS base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package definition and lock file
COPY package*.json ./

# Install dependencies using clean install
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Expose the port the Express app runs on
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the server directly using node (bypassing nodemon)
CMD ["node", "src/server.js"]
