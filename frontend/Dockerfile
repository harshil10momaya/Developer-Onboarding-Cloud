# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files from root
COPY package*.json ./
COPY vite.config.js ./

# Copy frontend source
COPY frontend/ ./frontend/

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine

# Copy built assets from build stage
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
