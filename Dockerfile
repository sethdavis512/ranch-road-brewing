FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN bun run test && bun run build

# React Router 8 needs Node 22.22+; react-router-serve runs on Node.
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
CMD ["npm", "run", "start"]
