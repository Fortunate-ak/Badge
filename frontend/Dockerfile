# dev-first lightweight image
ARG NODE_IMAGE=node:24-alpine
FROM ${NODE_IMAGE} AS base
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
# use npm ci for reproducible installs
RUN npm ci

# Copy project files (volume will override during development)
COPY . .

# Default dev command is set in docker-compose; expose port for nginx
EXPOSE 5173

# Keep entrypoint minimal: the compose file runs `npm run dev -- --host`
CMD ["npm", "run", "dev", "--", "--host"]
