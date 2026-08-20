# Space + Camera architecture decision

Status: architecture approved after independent challenge and re-review  
Date: 2026-08-20

## Decision in one sentence

Stroman owns a provider-neutral filmmaking model and renders a trusted textured-geometry layer in Three.js; the default capture path now accepts ordinary overlapping room photos inside Stroman, reconstructs them through a replaceable server adapter, estimates scale without asking for dimensions, and preserves both source evidence and the resulting GLB as immutable project assets. Gaussian splats remain outside this proof until a co-registered mesh/splat fixture and alignment gate exist.

## Product boundary

This phase implements two compatible ingest paths, with photos as the default:

1. Photograph a real location from 20–40 overlapping angles directly from the Stroman workflow.
2. Preserve every original project-scoped photo, submit the set asynchronously, and import the bounded GLB result when it is ready.
3. Infer a conservative room scale automatically and label it `ESTIMATED`; the normal path never asks for dimensions.
4. Enter and navigate the recognizable location in a browser, with source-photo presence visible beside the model.
5. Manipulate one authoritative filmmaking camera and save the exact camera state and rendered frame as the shot.
6. Keep manual textured-GLB import as a recovery path for users who already have a scan.

It does not build a native mobile scanner, an in-house reconstruction farm, a CAD editor, camera-pose recovery from providers that do not expose it, or a new creative-reasoning system.

## Technology audit

| Option | What it contributes | Geometry truth | Browser/mobile reality | Cost/privacy/lock-in | Decision |
| --- | --- | --- | --- | --- | --- |
| [Niantic Capture / Scaniverse](https://www.nianticspatial.com/en/products/capture) | Guided iOS/Android capture; on-device meshes and Gaussian splats; standard exports including open SPZ | Meshes, scan coordinate system, pose/depth evidence where available | Existing phone capture avoids building a native scanner now | On-device path can stay private; cloud credits and commercial rights vary by plan; never make its account/API canonical | Highest-leverage first capture workflow, but only through exported files |
| [Apple RoomPlan](https://developer.apple.com/documentation/roomplan) | LiDAR-assisted parametric walls, doors, openings, windows, furniture and dimensions; USD/USDZ output | Strong interior geometry and explicit confidence/dimensions | Excellent guided iPhone/iPad capture, Apple/LiDAR constrained | Local device processing; platform-specific | Planned geometry adapter, not required for the first browser import |
| [COLMAP](https://github.com/colmap/colmap/blob/main/doc/tutorial.rst) | Open SfM camera recovery, sparse structure, MVS dense point cloud/mesh and texture pipeline | Strong provider-neutral reconstruction primitives; absolute scale needs an anchor | Processing is not a browser workload; suitable for later worker/local service | Open source and portable; compute/ops burden remains ours | Future photos/video reconstruction adapter, not first integrated runtime |
| [Nerfstudio](https://docs.nerf.studio/nerfology/methods/splat.html) | Train/export Gaussian splats; broader models can export point clouds/meshes | Splatfacto itself does not export mesh/point cloud; geometry export depends on another model/path | GPU-heavy training is not an ordinary browser/mobile operation | Open source but operationally expensive | Research/offline adapter only until the geometry and compute story is proven |
| [SparkJS](https://github.com/sparkjsdev/spark) | Three.js-integrated WebGL2 splat renderer supporting SPZ, PLY, SOG and multiple viewpoints | Appearance renderer only; does not turn splats into trustworthy collision/measurement geometry | Lightweight web integration and mobile-oriented rendering | MIT; format/provider neutral | Optional photographic renderer behind an adapter after a real SPZ fixture passes |
| [PlayCanvas splats](https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/) | Mature PLY/SPZ/SOG web delivery, compression and large-scene streaming | Documentation explicitly requires a mesh approximation for depth-dependent behavior in relevant cases | Strong renderer, but adopting another engine would duplicate the existing Three.js-oriented plan | Open engine; runtime and architecture coupling are larger than needed | Format/performance reference, not the first Stroman renderer |
| [Meshroom](https://alicevision.org/view/meshroom.html) | Open photogrammetry GUI/pipeline | Mesh and camera recovery | MVS expects CUDA-class hardware and macOS support is not the clean first path | Local/private but hardware constrained | Rejected for the initial workflow |
| [KIRI Engine API](https://docs.kiriengine.app/photo-scan/image-upload/) | Server-side photo scan accepts 20–300 images and can return GLB directly | Textured mesh; absolute scale still requires inference or a future anchor | Fits the existing asynchronous web workflow without another filmmaker-facing app | Paid third-party processing and three-day provider retention; the API key and job id remain server-only | First photo-reconstruction adapter, replaceable behind the domain port |

### Important technology conclusions

- A Gaussian splat is the photographic layer, not the measurement or collision authority.
- A textured photogrammetry mesh can serve both visible recognition and geometry in the first path, but the domain still records the two responsibilities separately.
- SPZ is an open, compact interchange format. It is useful for delivery, but it is not Stroman's domain model.
- Unscaled SfM output is not metric truth. It remains `ESTIMATED` until a scale anchor or a metric capture source exists.
- Raw inputs and generated outputs remain project-scoped and are never silently overwritten.
- Source photos sent through a configured cloud reconstruction adapter are disclosed as externally processed; Stroman retains its own immutable project copies and imports the result before the provider's retention window ends.

## Photo-to-room contract

The default UI asks only for a location name and 20–40 overlapping JPEG/PNG photographs. It does not ask for dimensions, units, coordinates, or reconstruction settings. Capture guidance is embedded in Stroman: perimeter coverage, roughly 70% visual overlap, floor/ceiling/openings/corners, stable light, and an empty frame.

The server stores each source through the existing owner/project-scoped immutable source boundary, then creates a dedicated reconstruction job before contacting the configured adapter. The job owns provider key/id, status, failure code, photo receipts, timestamps and optimistic-concurrency version. Provider identifiers never enter `CreativePlanningContext` or the browser response. The first adapter uses KIRI's photo-scan API with professional texture smoothing disabled and requests GLB directly. Its result archive must arrive over HTTPS, remain below the compressed bound, contain exactly one bounded GLB, and pass the room-geometry parser before activation.

Absolute scale is never invented as observed truth. If raw GLB bounds are already room-plausible, Stroman uses the raw unit scale; otherwise it normalizes the vertical extent to a conservative 2.6 m hypothesis. Both outcomes remain `ESTIMATED`. A later metric provider, depth evidence, camera metadata, or one optional known-size anchor may upgrade confidence without changing the normal flow. Manual dimension entry is deliberately absent.

On success, Stroman imports the GLB through the same immutable source boundary, creates a `PHOTOGRAMMETRY` environment carrying only the Stroman reconstruction id and source-photo references, and updates planning with the existing visual-quality gate. The UI then enters the actual room automatically. Six source photographs remain visible as a photographic-presence strip; full pose-registered portals are deferred until an adapter supplies trustworthy camera poses.

## Manual location-bundle recovery contract

The user imports one required geometry asset and optional supporting assets:

- required: textured `.glb` location geometry;
- optional: source scout photographs used to validate recognizable views;
- required metadata collected in Stroman: location name, scale provenance, coordinate convention, and capture source;
- generated Stroman manifest: asset hashes, bounds, environment version, evidence classifications, known coverage volume, and explicit unknown regions.

The recovery UI accepts a textured GLB and generates the manifest server-side. A portable archive format can follow without changing the domain. First-milestone uploads are capped at one 100 MB GLB; photo reconstruction accepts 20–40 JPEG/PNG inputs up to 8 MB each and 180 MB total; the existing 500 MB project spatial-asset ceiling remains authoritative for imported environments. Inputs over a ceiling fail before expensive parsing with a clear recovery action.

## Engine-independent domain

The renderer consumes, but does not define, these concepts:

- `SpatialEnvironment`: identity, version, source kind, geometry asset reference, canonical bounds, scale provenance and one navigable coverage volume;
- `SpatialConfidence`: `OBSERVED`, `ESTIMATED`, `UNKNOWN`, or `FILMMAKER_CONFIRMED`;
- `CameraState`: position, normalized quaternion, target, physical sensor gate, focal length, near/far planes and aspect composition;
- the existing subject, blocking and camera-movement state where the shot already needs it;
- `SavedShot`: immutable environment version plus exact camera/blocking state, derived technical data, renderer identity/version, baked storyboard image asset reference and shooting instructions.

Renderer objects, Three.js classes, provider job IDs and reconstruction SDK types never enter persisted filmmaking state. Provider orchestration persists separately because asynchronous lifecycle, expiry, retry and exact status queries are now real requirements; the creative aggregate retains only a Stroman-owned reconstruction provenance id.

## Rendering architecture

Three.js is the scene and camera renderer. The textured mesh supplies recognizable photographic appearance and participates in depth, framing, ground/navigation constraints and spatial measurements. The domain still distinguishes the mesh's visual role from its geometry role so a later photographic renderer can be substituted.

No splat renderer ships in the first proof. A future SPZ/PLY adapter may display an appearance asset only when it was exported from the same reconstruction coordinate frame or passes an ingest-time alignment gate. That gate must store the adapter transform and demonstrate three or more non-collinear correspondences with a maximum residual appropriate to the environment's scale. An unverified splat is never composited over trusted geometry. This removes mesh/splat co-registration from the first milestone's critical path rather than hand-waving it.

The same `CameraState` drives:

1. the interactive camera;
2. the camera view;
3. projection-derived technical data;
4. the saved storyboard raster;
5. the persisted saved shot.

No secondary storyboard illustration is allowed to masquerade as the saved view. Save captures both the complete parameters and baked pixels. The baked image is the canonical storyboard artifact; the parameters support editing and audit. The asset hash, environment hash, renderer name/version, viewport pixel dimensions, color space and timestamp are stored so a future re-render cannot silently replace the approved frame.

## Camera truth

- Use a real perspective camera. `CameraFormat` stores physical sensor width/height in millimeters, gate orientation (`LANDSCAPE` or `PORTRAIT`) and fit mode. `focalLengthMm` is always a physical focal length. The projection gate rotates the sensor dimensions for portrait orientation, fits the requested aspect inside that gate without stretching, and computes horizontal and vertical FOV as `2 * atan(effectiveGate / (2 * focalLengthMm))`.
- Store orientation as a normalized quaternion plus an explicit target relationship; derive one from the other at the interaction boundary and validate against degenerate states.
- 16:9 and 9:16 are separate `AspectRatioComposition` camera states. A filmmaker may clone a physical setup, then recompose either state independently.
- Derived distance, camera height, orientation, shot scale and travel are recomputed from the authoritative state on every change.
- Direct filmmaker edits become `FILMMAKER_CONFIRMED` and never snap back to a proposal.

## Known, estimated and unknown space

The first proof uses one canonical navigable coverage volume, expressed in environment coordinates and classified with confidence. A metric capture can provide an `OBSERVED` volume. For an imported asset without coverage metadata, Stroman derives a conservative inset from mesh bounds, labels it `ESTIMATED`, and requires a one-step filmmaker confirmation before exact measurements are presented.

UNKNOWN has explicit runtime behavior: the volume boundary is visible only when approached or targeted; navigation and camera placement stop at the last known/estimated boundary; looking beyond it shows a neutral hatch/fade rather than invented surfaces; saving is allowed only with an explicit warning if the frame includes unknown space; the contextual recovery action is `Add another scan angle`. The system never treats absence of mesh triangles as a wall or navigable free space.

The first imported mesh may not contain enough source-camera metadata to infer fine-grained coverage. In that case Stroman marks the conservative volume `ESTIMATED` unless the scan source certifies metric geometry, and treats outside it as `UNKNOWN`. Source-photo/pose import later refines coverage without changing saved camera semantics.

## Canonical coordinates and adapter contract

Persisted space is right-handed, measured in meters, with `+Y` up, `+X` right and camera-forward along `-Z`. Every import adapter must return a source-to-canonical 4x4 transform, source units, scale provenance, transformed bounds and confidence. The original asset is immutable; renderer nodes receive the adapter transform. Camera and saved-shot state exist only in canonical coordinates. A second deterministic test adapter with different source axes/units must map the same fixture into identical canonical camera results before provider-neutrality is considered tested.

## Storage and security

- Reuse the authenticated, owner/project-scoped source storage boundary for every original photo and imported GLB.
- Add strict MIME/extension/magic-byte checks, bounded counts and bounded byte sizes for spatial assets.
- Store hashes and immutable environment versions; never replace original scout or capture files. The first milestone retains at most three environment versions within the project ceiling. Older originals are not automatically deleted. Because archive/delete lifecycle is deliberately outside this milestone, a fourth version requires a new project rather than an unavailable or destructive action.
- Serve assets only after owner/project authorization with `private, no-store` and `nosniff` headers.
- Keep provider credentials in server environment only. Download links must be HTTPS, provider responses are never returned to the browser, archives are bounded before and during extraction, and UI/API errors never expose credentials or provider payloads.
- Persist immutable environment/photo references in planning context. Reconstruction jobs now use a dedicated table because asynchronous lifecycle, provider expiry and compare-and-swap status transitions meet the previously defined migration trigger. Move environments/shots to dedicated tables before any of these occur: collaboration or concurrent edits, more than 10 environments, more than 100 saved shots, planning JSON above 750 KB, server-side shot queries, or independent retention policies.

## Performance gates

- Lazy-load the spatial workspace and location assets only when Plan is opened.
- Show deterministic load/progress/failure states.
- Cap first-milestone asset sizes and geometry complexity; reject unsupported inputs with a recovery action.
- Acceptance budgets: on Apple M1-class desktop Chrome/Safari, at least 45 fps at the 95th percentile while navigating; on iPhone 13-class Safari, at least 30 fps at the 95th percentile; camera input-to-visible-frame below 100 ms; save-to-canonical-storyboard preview below 1 second; a supported 100 MB-or-smaller local asset interactive within 8 seconds on the test connection. Test artifacts must identify hardware/browser and measurements.
- Add LOD or a splat renderer only when a tested real scene demonstrates the need.

## Failure boundaries

Likely first failures are poor photo overlap, missing surfaces, reflective/featureless rooms, provider outage or expiry, missing scale, coordinate-system mismatch, malformed/overlarge assets and slow texture upload. Each is surfaced as capture/asset evidence, not hidden with fabricated geometry. The user can retry a new set without deleting originals. Provider outage cannot invalidate an already imported environment or saved shot, and manual GLB import remains available.

## Alternatives deliberately rejected

- Building a native scanner before the browser planning workflow proves value.
- Reconstructing arbitrary photos synchronously inside a Next.js request.
- Treating a splat as exact geometry.
- Combining independently reconstructed mesh and splat assets without a measured alignment gate.
- Persisting Three.js objects or provider-specific schemas.
- Adding Unity, Unreal, Blender-like editor modes or manual room construction.
- Making one paid reconstruction provider part of the domain or persisted creative contract. The first KIRI adapter is a replaceable operational choice and still requires an owner-supplied developer credential plus live cost/licensing acceptance before production activation.

## Graduation evidence required

The architecture is not considered proven until browser evidence covers a real office and a materially different location, multiple scout-photo reproduction attempts, known/unknown handling, natural navigation, position/orientation/target/lens/aspect changes, synchronized technical data, baked exact saved frames, persistence/reload and the numeric interaction budgets above. Independent Claude product review must inspect those artifacts at the exact final SHA.

## Architecture challenge resolution

The first independent challenge returned `CHANGES_REQUIRED` with four blocking and five important findings. This revision resolves them as follows:

- mesh/splat alignment: splats are removed from the first proof; any later adapter requires a measured co-registration gate;
- unknown behavior: boundary rendering, blocked placement/navigation, unknown-frame warning and capture recovery are now explicit;
- lens fidelity: physical sensor dimensions, gate orientation/fit and focal-length-derived horizontal/vertical FOV are canonical;
- exact frame: baked pixels are canonical alongside complete state, hashes and renderer identity;
- provider neutrality: canonical axes/units and adapter transform contract are explicit, with a second transformed test adapter required;
- performance: device tiers and numeric budgets are falsifiable;
- storage: per-asset/project/version ceilings and explicit retention behavior are defined;
- speculative domain breadth: first implementation is reduced to environment, confidence/coverage, camera, existing blocking and saved shot;
- JSON migration: concrete size, count, query and collaboration triggers are defined.

The independent re-review returned `ARCHITECTURE_APPROVED` with `BLOCKING: 0`, `IMPORTANT: 0`, and four execution/calibration notes: set a numeric splat-alignment tolerance before future splat work; validate the 100 MB GLB ceiling against real exports; confirm the vertical sensor-gate convention during product testing; and ensure unknown boundaries do not create excessive navigation friction.

## Implementation and browser-calibration log

On 2026-08-20 the authenticated local application was exercised against the real persistence and private-access boundaries. The browser workflow demonstrated:

- private project-scoped GLB upload and retrieval;
- an actual Three.js perspective camera rather than the legacy overhead abstraction;
- keyboard camera movement with an honest coverage clamp and explicit unknown-area acknowledgement;
- independent 16:9 and 9:16 camera state;
- exact 24/35/50/85 mm selection plus a continuous 14–135 mm range, with physical-gate FOV recomputation;
- a canonical baked 540×960 PNG saved alongside the exact vertical camera state, environment version/hash and renderer version;
- persistence and authenticated storyboard retrieval after the save;
- 118–121 displayed fps during the available desktop renderer smoke test. This was an
  effectively empty scene produced from an object-scale fixture that the hardened importer
  now rejects. It validates only the animation/instrumentation path and is explicitly **not**
  evidence for either real-content desktop or mobile performance acceptance budgets.

That same test correctly falsified the two locally available GLBs as graduation fixtures: both were object-scale/flat assets rather than navigable locations. The first implementation had accepted them based only on diagonal plausibility. The importer was remediated to require room-scale extent on all three axes and now rejects those files with the explicit action: check the export unit or capture more of the location. Their earlier renderer/save result remains useful only as interaction-path evidence and does **not** count as real-location evidence.

No real office scan or materially different real-location scan is present in the repository, attachment set, project source store, Downloads, Desktop or Documents. The architecture and implementation therefore remain pre-graduation until those owner-captured/exported GLBs are supplied and the full two-location browser matrix, scout-photo reproduction, persistence/reload and independent exact-SHA product review can be completed.
