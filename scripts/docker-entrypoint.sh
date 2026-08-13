#!/bin/sh
set -eu

# Railway mounts volumes as root, replacing the image directory ownership. Keep
# the privileged step narrowly scoped to the one persistent mount, then run every
# application, migration, and admin command as the dedicated service user.
mkdir -p /app/.data/source-imports
chown -R nextjs:nodejs /app/.data

exec su-exec nextjs:nodejs "$@"
