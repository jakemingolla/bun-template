FROM oven/bun:1.4.2

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY src ./src

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

USER bun
CMD ["bun", "src/index.ts"]
