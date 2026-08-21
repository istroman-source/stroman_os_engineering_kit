# Stroman reconstruction worker

This private service owns the photo-to-room compute path. The filmmaker continues to work only in
Stroman OS; the worker accepts integrity-checked source photos, runs either Apple's native local
photogrammetry engine or the bounded COLMAP CUDA pipeline, and returns one browser-ready GLB through
the same application boundary.

## Free local Mac mode

On a supported Apple silicon Mac, start the complete local workflow with:

```sh
npm run dev:reconstruct:mac
```

This command verifies native support, compiles the checked-in Swift executable, generates an
ephemeral signing secret without printing it, starts the worker on loopback, and starts Stroman OS
at `http://localhost:3200`. The filmmaker still uploads and enters the reconstructed room entirely
inside Stroman. Source photos and job attempts remain under the gitignored `.data/` runtime path.

The Apple engine uses sequential high-sensitivity matching with masking disabled and the automatic
object bounding box ignored so it can recover the complete photographed scene. It rejects sets with
fewer than 20 source photos or fewer than 60% usable samples, requests a reduced textured OBJ from
RealityKit, and packages that result as the same bounded GLB used by every other provider. This is the
lowest-cost first-pass setting; set `STROMAN_APPLE_RECONSTRUCTION_DETAIL=medium` only after a viable
capture needs more detail.

This path has no reconstruction fee, but the Mac must remain awake while processing. It is the
private-test default, not a claim that a user's localhost is production infrastructure. Remote web
activation still requires a reachable owned worker or a future outbound local-agent queue.

## Remote CUDA runtime

- Linux host with an NVIDIA GPU, current driver, Docker, and NVIDIA Container Toolkit.
- A persistent encrypted volume mounted at `/var/lib/stroman-reconstruction`.
- HTTPS termination in front of port `8080`; the worker port is never exposed directly.
- One random `STROMAN_RECONSTRUCTION_WORKER_SECRET` of at least 32 bytes, configured identically in
  the app and worker. Requests are body-bound, timestamped, nonce-protected, and HMAC-signed.

## Reproducible image

First build and publish a CUDA-enabled COLMAP base from the
[official COLMAP Dockerfile](https://github.com/colmap/colmap/tree/main/docker) at an exact reviewed
COLMAP commit. Resolve that published image to its immutable digest, select an exact reviewed
meshoptimizer commit, and then build:

```sh
docker build \
  --file services/reconstruction-worker/Dockerfile \
  --build-arg COLMAP_IMAGE=<private-registry>/stroman-colmap@sha256:<reviewed-digest> \
  --build-arg MESHOPTIMIZER_COMMIT=<reviewed-commit> \
  --tag stroman-reconstruction:<release-sha> \
  .
```

Do not replace either pin with `latest` in a deployed image.
The resulting image includes the applicable notices in `THIRD_PARTY_NOTICES.md`.

Run with GPU access and a persistent job volume:

```sh
docker run --detach --gpus all --restart unless-stopped \
  --env STROMAN_RECONSTRUCTION_WORKER_SECRET \
  --mount type=volume,src=stroman-reconstruction,dst=/var/lib/stroman-reconstruction \
  --publish 127.0.0.1:8080:8080 \
  stroman-reconstruction:<release-sha>
```

The app then uses:

```dotenv
STROMAN_LOCATION_RECONSTRUCTION_PROVIDER=stroman
STROMAN_RECONSTRUCTION_WORKER_URL=https://<private-worker-host>
STROMAN_RECONSTRUCTION_WORKER_SECRET=<same-secret>
```

Keep KIRI configured only as a deliberate rollback option until the permanent office-room fixture
passes the comparison gate. `auto` prefers the Stroman worker when both worker variables exist.

## Pipeline and release gate

The worker executes commands without a shell:

1. SIFT feature extraction and exhaustive matching.
2. Robust incremental camera mapping.
3. CUDA PatchMatch dense reconstruction and geometric fusion.
4. Poisson meshing and bounded simplification.
5. Texture-atlas generation from calibrated source views.
6. GLB conversion and optimization with `gltfpack`.

Before activating the worker as the production default, run the permanent office capture through
both paths and require: a valid bounded GLB; usable room-scale bounds; strong registered-image and
texture coverage; no integrity failures; acceptable browser performance; and a materially useful
filmmaker view. A structurally valid but visually unusable room does not pass.
