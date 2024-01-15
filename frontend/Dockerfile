# Use a Node.js base image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Define the command to run the server when a container is started
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
