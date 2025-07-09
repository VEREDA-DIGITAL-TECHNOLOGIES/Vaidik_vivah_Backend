# Use official Node.js LTS image
FROM node:23

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .


# Start the app (Ensure this matches your setup)
CMD ["node", "server.js"]