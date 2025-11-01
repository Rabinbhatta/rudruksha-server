# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for efficient caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of your code
COPY . .

# Set environment variable for production
ENV NODE_ENV=production

# Expose port 8080 (Cloud Run expects this)
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]
