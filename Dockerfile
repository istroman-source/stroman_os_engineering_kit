# Multi-stage production image for Stroman OS.
# Uses the conventional Next.js production server (`next start`).

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
RUN apk add --no-cache su-exec \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs \
  && mkdir -p /app/.data/source-imports \
  && chown -R nextjs:nodejs /app/.data

# Install production dependencies only.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy the build output, static assets, and generated Prisma client.
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts/private-beta-access.mjs ./scripts/private-beta-access.mjs
COPY --from=builder /app/scripts/docker-entrypoint.sh /usr/local/bin/stroman-entrypoint
COPY --from=builder /app/next.config.ts ./next.config.ts
RUN chmod 755 /usr/local/bin/stroman-entrypoint

EXPOSE 3000
ENTRYPOINT ["stroman-entrypoint"]
CMD ["npm", "run", "start"]
