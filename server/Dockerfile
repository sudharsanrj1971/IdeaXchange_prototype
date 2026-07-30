FROM node:20-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
EXPOSE 3000
CMD ["node", "src/index.js"]
