# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (only prod)
RUN npm install --omit=dev

# Copy rest of the files
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose port for Cloud Run
EXPOSE 8080

# Start server
CMD ["npm", "start"]
