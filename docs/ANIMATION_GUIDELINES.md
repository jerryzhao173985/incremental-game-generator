# Animation Guidelines

This project uses a simple set of rules to keep animations smooth and accessible.

- **Natural motion**: default easing is `ease-in-out` so things accelerate and decelerate like objects in the real world.
- **Standard timing**: short animations use `var(--duration-short)` (300ms) and longer sequences use `var(--duration-long)` (600ms).
- **GPU-friendly properties**: prefer `transform` and `opacity` changes over layout-related properties such as `top` or `left`.
- **Staggered sequences**: delay items when animating multiple elements in order to improve clarity.
- **Purposeful usage**: animations should provide meaning or feedback and never distract from using the application.
- **Testing**: test motion on the range of target devices and browsers to ensure good performance.
- **Accessibility**: the global stylesheet respects `prefers-reduced-motion` so users can reduce or disable motion.

