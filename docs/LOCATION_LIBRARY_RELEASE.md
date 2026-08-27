# Location Library release ledger

## Objective

Deliver an owner-scoped Location Library, reliable free Mac reconstruction worker, and real-room storyboard workflow without paid reconstruction providers.

## Release mechanics

- Prepared locations are owner-scoped and durable before a story begins.
- Source photos stay durable in the app; the connected Mac receives short-lived signed leases and
  returns a signed GLB result.
- The hosted app does not depend on an inbound tunnel to the Mac. The Mac worker polls the hosted
  HTTPS origin, preserving jobs through worker restarts and temporary local-network outages.
- The location UI accepts 20–40 overlapping JPEG or PNG photos for an Apple reconstruction. Inputs
  below that threshold are rejected before a job is queued.
- A ready location is available for later project grounding; source evidence and reconstruction
  state remain visible without requiring another upload.

## Live verification requirements

1. Start the connected Mac worker with the existing shared secret and the hosted app HTTPS URL.
2. Upload a valid 20–40-photo capture through the authenticated Locations UI.
3. Verify the location advances from building to ready after the Mac claims and completes it.
4. Verify a reload preserves the ready state and the resulting location remains available to a new
   story.
