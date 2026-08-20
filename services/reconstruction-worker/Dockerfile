# The base image is deliberately required at build time so production cannot
# silently move to an unreviewed COLMAP build. Use an exact image digest.
ARG COLMAP_IMAGE
FROM ${COLMAP_IMAGE}

ARG MESHOPTIMIZER_COMMIT
RUN test -n "${MESHOPTIMIZER_COMMIT}" \
  && apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates cmake git ninja-build nodejs \
  && git clone https://github.com/zeux/meshoptimizer.git /tmp/meshoptimizer \
  && git -C /tmp/meshoptimizer checkout "${MESHOPTIMIZER_COMMIT}" \
  && cmake -S /tmp/meshoptimizer -B /tmp/meshoptimizer/build -GNinja \
      -DCMAKE_BUILD_TYPE=Release -DMESHOPT_BUILD_GLTFPACK=ON \
  && cmake --build /tmp/meshoptimizer/build --target gltfpack \
  && install -m 0755 /tmp/meshoptimizer/build/gltfpack /usr/local/bin/gltfpack \
  && rm -rf /tmp/meshoptimizer /var/lib/apt/lists/*

RUN useradd --create-home --uid 10001 stroman \
  && mkdir -p /var/lib/stroman-reconstruction \
  && chown -R stroman:stroman /var/lib/stroman-reconstruction

WORKDIR /opt/stroman-reconstruction
COPY --chown=stroman:stroman services/reconstruction-worker/pipeline.mjs ./pipeline.mjs
COPY --chown=stroman:stroman services/reconstruction-worker/server.mjs ./server.mjs
COPY --chown=stroman:stroman services/reconstruction-worker/THIRD_PARTY_NOTICES.md ./THIRD_PARTY_NOTICES.md

ENV NODE_ENV=production
ENV PORT=8080
ENV STROMAN_RECONSTRUCTION_DATA_PATH=/var/lib/stroman-reconstruction
USER stroman
EXPOSE 8080
VOLUME ["/var/lib/stroman-reconstruction"]
HEALTHCHECK --interval=15s --timeout=5s --retries=4 \
  CMD node -e 'fetch("http://127.0.0.1:8080/health/ready").then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))'
CMD ["node", "server.mjs"]
