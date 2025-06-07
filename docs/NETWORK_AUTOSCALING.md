# Network Auto‑Scaling

This project now includes a simple hook for detecting network status so the UI
can adapt to different connection types. The hook exposes whether the user is
online and tries to identify the connection type (Wi‑Fi, cellular, ethernet or
none).

Developers can use `useNetworkStatus` to adjust game behaviour when
connectivity is poor. For example you might disable heavy animations or switch
to a low bandwidth mode on cellular connections. The `NetworkIndicator`
component provides a minimal example of how to display the current status to
players.

```tsx
import NetworkIndicator from "@/components/network-indicator"
```

The indicator is added to the root layout so it appears across the entire
application. Feel free to reposition or style it differently to suit your needs.
