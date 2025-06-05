# Animation Guidelines

This project follows a set of recommendations for polished and accessible animations.

## Timing Tokens
- `--duration-short` – 200ms
- `--duration-medium` – 400ms
- `--duration-long` – 600ms

## Easing
Use `cubic-bezier(0.4, 0, 0.2, 1)` as the default easing curve.

## Hardware Acceleration
Animate only `transform` and `opacity` where possible.

## Reduced Motion
Animations are disabled when `prefers-reduced-motion: reduce` is enabled.

For complex sequences, stagger elements by 50ms increments.
