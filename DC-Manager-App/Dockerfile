# Use the official Node.js image as a base
FROM node:20

# Create and change to the app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define environment variables
ENV PORT=3000

# Start the app
CMD ["npm", "start"]
