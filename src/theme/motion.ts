/** Durations (ms) */
export const motion = {
  micro: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  ambient: 2000,
} as const;

/** React Native Animated easing — approximate CSS cubic-bezier */
export const easing = {
  standard: { x1: 0.4, y1: 0, x2: 0.2, y2: 1 },
  enter: { x1: 0, y1: 0, x2: 0.2, y2: 1 },
  exit: { x1: 0.4, y1: 0, x2: 1, y2: 1 },
  bounce: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 },
} as const;
