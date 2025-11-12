# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
# Copy built application from build stage
COPY --from=build /app/dist/ats-totvs-web /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
