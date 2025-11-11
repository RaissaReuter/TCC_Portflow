# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY backend/package.json ./backend/
COPY backend/yarn.lock ./backend/ 2>/dev/null || :

# Install dependencies
RUN cd backend && yarn install --frozen-lockfile

# Copy backend source code
COPY backend/ ./backend/

# Build the application
RUN cd backend && yarn build

# Expose port
EXPOSE 3001

# Set working directory to backend
WORKDIR /app/backend

# Start the application
CMD ["yarn", "start"]
