# Hosted Creative-Reasoning Calibration

**Calibration date:** 2026-08-11  
**Provider path:** OpenAI Responses API through the server-side provider-neutral adapter  
**Configured model:** `gpt-5.4`  
**Application path:** `developCreativeBlueprint` → semantic quality gate → visual-plan quality gate

This report records the release evidence for the first hosted creative-reasoning candidate. No
credential value, request authorization header, private session token, or chain-of-thought is
stored in the repository.

## Hosted connection and application proof

- A real minimal Responses API request returned HTTP 200 through the configured server-side
  environment. The resulting provider identity was `openai-responses:gpt-5.4`.
- The Jimmy's Famous Meals fixture and every cross-mode fixture ran through the real hosted
  provider and the same application orchestration used by the product. None used the deterministic
  specialist fallback.
- The checked-in artifacts retain the exact structured provider output, semantic report, translated
  application blueprint, visual-quality report, and provider identity. `npm run calibrate:rerender`
  deterministically reruns the captured hosted output through the current application translator
  and fails if any semantic or visual gate regresses.
- Real high-effort synthesis took several minutes in some cases. The adapter has a ten-minute
  timeout and one bounded retry for transient transport, 408, 409, and 5xx failures. It does not
  retry rate limits or weaken provider error handling.

## Cross-mode results

| Mode | Recommended direction | Governing filmmaking thought | Quality |
| --- | --- | --- | ---: |
| Commercial | Before She Sits | Three denied attempts to sit become one shared sit; withhold the first clean product-and-food read until the mother successfully sits. | 94 |
| Documentary | Hold / Repeat / Confirm | Make the radio-to-body-to-confirmation custody chain the protagonist; cut scenic harbor material that does not reveal judgment. | 93 |
| Narrative | Battery Door | Distribute batteries, player, and tape across the apartment, then refuse the expected playback so the final act is a choice about who must live with the truth. | 94 |
| Performance | The Hand-Off / Clarity Ladder | Cut only when tempo authority visibly transfers or is confirmed; delay flattering detail until corrective cue traffic thins. | 92 |
| Open | Proxy Vote: If It Stays | Treat each chair placement as a vote and each aftermath hold as the count; advance only on custody change, correction, or refusal by the room. | 93 |

These are not noun-swapped templates. Each mode changes the dramatic unit, editorial law,
camera logic, evidence burden, sacrifice, falsification condition, and audience journey.

## Jimmy's Famous Meals release comparison

The permanent PR #28 negative fixture asks for a sentimental conversion film about an everyday
mother, an eight-month-old baby whose face cannot be shown, and Jimmy's Famous Meals. The raw
general-purpose baseline is competent but conventional: an early wake-up, one-handed kitchen
routine, micro-chaos, first bite, out-the-door ending, naturalistic handheld coverage, soft window
light, gentle music, center-safe framing, and vertical crops.

The Stroman result makes a more consequential project-specific judgment:

- **Thesis:** convenience converts only when it feels like care made possible, not care cut short.
- **Action engine:** the mother is denied a seat three times, then actively changes the high-chair
  relationship so eating and caregiving can happen in the same beat.
- **Purposeful violation:** the familiar early product/food beauty read is withheld until she gets
  to sit. Before that, the product stays one-handed, partial, interrupted, and embedded in action.
- **Sacrifice:** appetite-first imagery and claim density are deliberately delayed; the direction
  admits it is wrong if legal or product-identification needs force an early hero insert.
- **Concrete sequence:** Counter Before Coffee → First Almost-Sit → Tray Sweep → Move Closer →
  First Bite → Earned Read.
- **Independent formats:** horizontal frames preserve causal geography; vertical frames use new
  portrait positions and stacked relationships rather than cropping the 16:9 master.

The adversarial Jimmy fixture also passed without obeying embedded prompt-injection language or
inventing prohibited baby-face coverage.

## Visual-planning proof

- Hosted storyboard intent translates to separately composed 16:9 and 9:16 SVG previs for four
  scene-level setups, not a repeated anonymous diagram.
- Each frame uses compact person (`P`), set (`S`), and action (`A`) marks with a visible frame map.
  This keeps dense frames readable without losing the full project-specific labels.
- Blocking, lighting, look, sound, and coverage are separate artifacts. Multi-state routes use
  named route marks and a route strip rather than overlapping stick figures or anonymous red dots.
- The two-angle Jimmy scout fixture grounds the hosted scenes in the visible freestanding island,
  sink window, pendant, fridge, and hall relationship. Table/high-chair fit, exact dimensions,
  fixture control, and reverse operating depth remain explicit uncertainties.
- Desktop and 390-pixel mobile browser inspection confirmed progressive disclosure, wrapped stage
  controls, paired frame readability, a separately understandable portrait composition, and no
  filmmaker-facing provider or system plumbing.

## Review artifacts

Structured evidence lives under `evaluations/artifacts/hosted/`:

- `jimmys-famous-meals.json` — actual hosted commercial output and application blueprint
- `jimmys-famous-meals-hosted-scout.json` — the same hosted direction grounded in the scout fixture
- `jimmys-raw-general-baseline.json` — raw same-model general-purpose comparison lane
- `jimmys-adversarial-context.json` — injection and constraint-resistance fixture
- `documentary-harbor-third-shift.json`, `narrative-apartment-4c.json`,
  `performance-one-breath.json`, and `open-empty-chair.json` — cross-mode outputs
- `*-deep-room-desktop.jpg` — rendered recommendation, tradeoff, and falsification evidence
- `jimmys-scout-*-desktop.jpg` and `jimmys-scout-mobile-*.jpg` — rendered location, storyboard,
  blocking, lighting, responsive, and vertical-frame evidence

### Jimmy scout evidence correspondence

The retained Jimmy scout renders below are one signed-in application inspection of
`jimmys-famous-meals-hosted-scout.json`; they are not evidence for any earlier Jimmy direction.
The structured artifact identifies the hosted provider as `openai-responses:gpt-5.4`, the
application path as `developCreativeBlueprint`, and the translation path as
`generateBlueprint(providerOutput, scoutContext)`. Visible anchors shared by the JSON and renders
include **Before She Sits**, **Counter Before Coffee**, **First Almost-Sit**, the island / fridge /
sink-window / pendant geography, the MOM route, and independently composed 16:9 and 9:16 frames.

| Render | Product surface verified |
| --- | --- |
| `jimmys-scout-location-desktop.jpg` | signed-in scout-photo grounding and uncertainty states |
| `jimmys-scout-frames-desktop.jpg` | scene-specific paired 16:9 / 9:16 storyboard compositions |
| `jimmys-scout-blocking-desktop.jpg` | named subject route, camera marks, and protected geography |
| `jimmys-scout-lighting-desktop.jpg` | separate source / modifier / practical lighting artifact |
| `jimmys-scout-mobile-top.jpg` | 390-pixel progressive-disclosure entry state |
| `jimmys-scout-mobile-frames.jpg` | responsive paired-frame behavior |
| `jimmys-scout-mobile-vertical.jpg` | independently understandable portrait composition |

Five superseded `actual-app-jimmys-*.png` files were removed after independent review established
that they depicted a different earlier direction. Keeping them beside the final hosted JSON made
the release evidence internally contradictory.

Independent product review must inspect these artifacts together with
`CREATIVE_INTELLIGENCE_DOCTRINE.md`, `FILMMAKING_INTELLIGENCE_DIRECTION.md`, and the permanent
negative fixture at `evaluations/fixtures/jimmys-famous-meals.json`. Valid JSON, provider
connectivity, and automated test success are necessary but not sufficient release evidence.
