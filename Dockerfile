# Use Node LTS
FROM node:24

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install deps
RUN npm install

# Copy rest of the code
COPY . .

# Build TypeScript (if you're compiling)
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "dist/src/app.js"]
