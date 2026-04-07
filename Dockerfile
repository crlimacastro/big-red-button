FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile --config.confirmModulesPurge=false
ENV NODE_OPTIONS="--import=tsx"
RUN pnpm build


FROM node:20-alpine

WORKDIR /app
RUN corepack enable

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY server ./server

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "start"]
