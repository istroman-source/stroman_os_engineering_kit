# 3D shot-planning review evidence

Captured from the signed-in local application on 2026-08-13/14. This is product evidence for
independent review, not a readiness declaration.

## Actual project input

- Title/concept: “Instruction at the Desk — an office intern receives a phone instruction, writes
  one yellow reminder, then checks the drawer, keyboard, and mug before coming up empty.”
- Mode: narrative short scene.
- Intent: make the failed search feel dry, specific, and quietly revealing without coverage
  manufacturing the turn.
- Desired feeling: wry tension, then stillness.
- Constraints: one desk geography; phone, yellow reminder, drawer, keyboard, and mug; existing
  green fluorescent light; dry sound.

## Actual hosted Story result inspected in the product

The accepted recommendation was **Reverse-Order Restoration**: the intern cannot solve the task,
so they restore the desk in reverse order as proof of proper effort. Its point of view was “A single
off-axis desk view watches an intern keep performing method after belief has left the task.” The
formal strategy explicitly sacrificed stakes, explanatory coverage, and expressive outburst. Its
change-course condition was a rehearsal from the actual locked 35mm position in which first-time
viewers read only “tidying up” rather than an admission of failure.

This transformed the brief into a physical ending and falsifiable directing test rather than
paraphrasing the supplied nouns.

## Actual spatial decisions and rendered artifacts

- Recommended/saved version 1: 35mm, 16:9, locked, desk height, medium-wide.
- Filmmaker-modified/saved version 2: 48mm, 9:16, dolly/push, 1.3m camera height, 1.4m target,
  standing subject state, and independently dragged camera/subject/path geometry.
- Reload proved both saved versions and the active vertical camera state persisted.
- The current oblique 3D room gives set pieces visible volume and height, and names CAM, TARGET,
  INTERN, SUBJECT END, Desk, Monitor, Desk phone, Yellow reminder, and Drawer · keyboard · mug. No
  anonymous red-dot legend is used.
- [Rendered Plan viewport](./hosted-desk-3d-plan.png). This signed-in capture records the persisted
  version-2 shot and authoritative camera view immediately before the room projection was hardened
  from overhead to oblique 3D; the exact-head component acceptance test covers the replacement room
  and its shared state path.

## Actual video fixture and hosted visual result

The real application imported a 34,154-byte MP4 fixture with SHA-256
`94a226d1528e4308df97fb9cd4b7458918bd644aa15c6c29a746c4b2f9ed6a14`. It is a four-second,
640×360 rendered desk scene whose intern/arm moves from the phone area to the yellow note, keyboard,
and mug while the composition remains fixed. The browser sampled five JPEG frames at 0.2s, 1.1s,
2.0s, 2.9s, and 3.8s. The configured hosted GPT-5.4 Responses path analyzed those actual images.

The final persisted analysis was version 4 and completed. Visible observations rendered in sampling
order. Representative exact outputs:

- `[OBSERVED @ 00:00.2] On the desk, a light beige inset contains a dark upright rectangle, a yellow
  square, and a dark horizontal bar; on the right side of the desk surface are a white horizontal
  rectangle and a white circle.`
- `[OBSERVED @ 00:02.0]` the arm-like shape extends farther right and overlaps the yellow square.
- `[ESTIMATED from 00:00.2, 00:01.1, 00:02.0, 00:02.9, 00:03.8] The desk layout appears constant
  across all supplied samples while the arm alignment differs from frame to frame.`
- `[UNKNOWN] No audio, dialogue, or off-screen activity can be assessed from still frames.`
- Advisory test: keep the yellow square fully visible at contact so it can land as its own beat.
- Advisory test: increase separation between the white rectangle and gray circle so each stop reads
  as a discrete stage in the locked composition.

The output correctly refused to call the lower desk protrusion a drawer or assign identities to
ambiguous shapes. It did not claim audio, dialogue, unseen movement, emotion, or intent from stills.
Each claim retains one media evidence reference; no frame bytes, credential, or provider plumbing is
shown in the filmmaker UI.

- [Rendered video-analysis viewport](./hosted-desk-video-analysis.png)

## Transcript and Edit regression

The tracked `instruction-at-desk.vtt` fixture imported successfully. Analysis version 2 suppressed
the production slate and room-tone chatter while retaining the drawer/keyboard/mug action and
reverse-order reset. Edit continued to show source-backed moments, labeled interpretations,
filmmaker-controlled tests, current story, alternatives, and handoff after the 3D and video work.

## Review questions

The independent reviewer must evaluate implementation correctness and product meaning against
`docs/CREATIVE_INTELLIGENCE_DOCTRINE.md`, `docs/FILMMAKING_INTELLIGENCE_DIRECTION.md`, and the PR #28
negative fixture. In particular:

1. Does the spatial workspace feel like entering and shaping a shot rather than operating a generic
   diagram or 3D tool?
2. Is the camera state genuinely authoritative across room, frame, shooting information, and saved
   storyboard?
3. Are horizontal and vertical decisions distinct and understandable?
4. Does actual media change the product while preserving fact / interpretation / unknown boundaries?
5. Can a filmmaker look at the visual workspace and say, “I know how I can shoot this”?
