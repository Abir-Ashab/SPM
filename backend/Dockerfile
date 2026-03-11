# Dockerfile for Node.js backend
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install --frozen-lockfile || yarn install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]
