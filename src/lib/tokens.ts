/**
 * Design token mirror for JavaScript.
 *
 * A small, typed reflection of values that live authoritatively in
 * `src/styles/tokens.css` but are occasionally needed in JS (media queries,
 * animation timing, portal stacking). Keep these in sync with the CSS tokens.
 */

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  toast: 1400,
  tooltip: 1500,
} as const;

export type ZIndexLayer = keyof typeof zIndex;

export const motionMs = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;
